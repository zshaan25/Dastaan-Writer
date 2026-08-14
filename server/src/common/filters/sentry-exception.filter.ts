import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/nestjs';

const SENSITIVE_PATTERNS = [
  'authorization',
  'password',
  'passcode',
  'token',
  'secret',
  'apikey',
  'api_key',
  'dsn',
  'cookie',
  'prompt',
  'mongo',
  'jwt',
  'privatekey',
  'private_key',
];

/**
 * Checks if a key name matches sensitive patterns
 */
export function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[-_]/g, '');
  return SENSITIVE_PATTERNS.some((pattern) => {
    const normalizedPattern = pattern.replace(/[-_]/g, '');
    return normalized.includes(normalizedPattern);
  });
}

/**
 * Recursively sanitizes objects and arrays, replacing sensitive keys or bearer strings with '[REDACTED]'
 */
export function sanitizeContext(data: any, depth = 0): any {
  if (depth > 8 || data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    if (data.toLowerCase().startsWith('bearer ')) {
      return '[REDACTED_BEARER_TOKEN]';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeContext(item, depth + 1));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (isSensitiveKey(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeContext(value, depth + 1);
      }
    }
    return sanitized;
  }

  return data;
}

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException ? exception.getResponse() : null;
    let message = 'Internal server error';

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      message = (exceptionResponse as any).message || JSON.stringify(exceptionResponse);
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Only report unexpected 5xx server errors, unhandled exceptions, and critical failures to Sentry
    const isServerError = status >= 500;
    const isUnhandled = !isHttpException;

    if (isServerError || isUnhandled) {
      try {
        const user = (request as any).user;
        const safeUserId = user?.id || user?._id || user?.sub || undefined;

        const safeParams = sanitizeContext(request.params || {});
        const safeQuery = sanitizeContext(request.query || {});

        Sentry.withScope((scope) => {
          scope.setTag('http.method', request.method);
          scope.setTag('http.url', request.url);
          scope.setTag('http.status_code', status);
          scope.setTag('error.type', exception instanceof Error ? exception.name : 'UnknownException');

          if (safeUserId) {
            scope.setUser({ id: String(safeUserId) });
          }

          // Attach contextual operational IDs if present (e.g. generationId, postId, conversationId)
          const operationalContext: Record<string, any> = {
            method: request.method,
            path: request.path,
            statusCode: status,
            params: safeParams,
            query: safeQuery,
          };

          if (request.body && typeof request.body === 'object') {
            if (request.body.postId) operationalContext.postId = request.body.postId;
            if (request.body.conversationId) operationalContext.conversationId = request.body.conversationId;
            if (request.body.generationId) operationalContext.generationId = request.body.generationId;
          }

          scope.setContext('request_context', operationalContext);

          Sentry.captureException(exception);
        });
      } catch (sentryError) {
        // Observability isolation: Sentry failure must never crash or alter API responses
        this.logger.warn(`Failed to capture exception in Sentry: ${(sentryError as any)?.message}`);
      }
    }

    // Deliver standard HTTP JSON error response to client
    if (!response.headersSent) {
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
