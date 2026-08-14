import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { renderTestEmailTemplate } from './templates/test-email.template';
import { renderPostReadyTemplate, PostReadyEmailParams } from './templates/post-ready.template';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resendClient: Resend | null = null;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Returns a configured Resend SDK client or throws a configuration exception.
   */
  private getResendClient(): { client: Resend; fromEmail: string } {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL');

    if (!apiKey || !apiKey.trim()) {
      this.logger.error('Email delivery aborted: RESEND_API_KEY is not configured');
      throw new BadRequestException(
        'Email service is not configured. RESEND_API_KEY environment variable is missing.',
      );
    }

    if (!fromEmail || !fromEmail.trim()) {
      this.logger.error('Email delivery aborted: RESEND_FROM_EMAIL is not configured');
      throw new BadRequestException(
        'Email service sender is not configured. RESEND_FROM_EMAIL environment variable is missing.',
      );
    }

    if (!this.resendClient) {
      this.resendClient = new Resend(apiKey.trim());
    }

    return { client: this.resendClient, fromEmail: fromEmail.trim() };
  }

  /**
   * Sends a transactional email using the Resend SDK.
   */
  async sendEmail(options: SendEmailOptions): Promise<{ id: string }> {
    const { client, fromEmail } = this.getResendClient();

    try {
      const response = await client.emails.send({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (response.error) {
        this.logger.error(
          `Resend API error sending email to ${options.to}: [${response.error.name}] ${response.error.message}`,
        );
        throw new InternalServerErrorException(
          `Failed to deliver email: ${response.error.message || 'Resend delivery error'}`,
        );
      }

      if (!response.data?.id) {
        this.logger.warn(`Resend did not return a message ID for recipient ${options.to}`);
        throw new InternalServerErrorException('Email delivery did not return a valid message confirmation');
      }

      this.logger.log(`Email delivered successfully to ${options.to} (Message ID: ${response.data.id})`);
      return { id: response.data.id };
    } catch (err: any) {
      if (err instanceof BadRequestException || err instanceof InternalServerErrorException) {
        throw err;
      }
      this.logger.error(`Network/SDK exception while sending email: ${err.message}`);
      throw new InternalServerErrorException(
        `Email service encounter an error: ${err.message || 'Unable to deliver message'}`,
      );
    }
  }

  /**
   * Sends a test email to verify Resend connectivity.
   */
  async sendTestEmail(to: string): Promise<{ success: boolean; message: string }> {
    const clientOrigin = this.configService.get<string>('CLIENT_ORIGIN', 'http://localhost:5173');
    const html = renderTestEmailTemplate({ recipient: to, appUrl: clientOrigin });

    await this.sendEmail({
      to,
      subject: '[Dastaan] Resend Email Integration Test',
      html,
      text: `Dastaan Resend Email Integration Test\n\nThis test email confirms that transactional email delivery is configured and working properly with the official Resend SDK.`,
    });

    return {
      success: true,
      message: 'Test email sent successfully',
    };
  }

  /**
   * Sends a structured post email to the user.
   */
  async sendPostReadyEmail(
    params: { to: string } & PostReadyEmailParams,
  ): Promise<{ success: boolean; message: string }> {
    const clientOrigin = this.configService.get<string>('CLIENT_ORIGIN', 'http://localhost:5173');
    const html = renderPostReadyTemplate({ ...params, appUrl: clientOrigin });

    const textContent = [
      `Hi ${params.userName || 'Creator'},`,
      `Here is your structured post from Dastaan:`,
      `Type: ${params.postType} | Tone: ${params.tone}`,
      ``,
      params.hook,
      ``,
      params.body,
      params.cta ? `\n${params.cta}` : '',
      params.hashtags?.length ? `\n${params.hashtags.join(' ')}` : '',
      params.mentions?.length ? `\n${params.mentions.join(' ')}` : '',
      ``,
      `Open Dastaan: ${clientOrigin}`,
    ]
      .filter(Boolean)
      .join('\n');

    await this.sendEmail({
      to: params.to,
      subject: `[Dastaan] Your Structured Post: ${params.postType || 'New Post'}`,
      html,
      text: textContent,
    });

    return {
      success: true,
      message: 'Post email sent successfully',
    };
  }
}
