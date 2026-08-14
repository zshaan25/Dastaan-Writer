# Dastaan - AI-Powered Social Media Content & Publishing Assistant

## Overview
**Dastaan** is an intelligent content creation and publishing platform initially tailored for **LinkedIn**. Dastaan helps professionals, creators, and engineers convert their project updates, achievements, ideas, and career milestones into high-performing, authentic social media content.

---

## Key Features & Core User Workflow
1. **Context Understanding**: User inputs an achievement, project note, or idea.
2. **AI Content Generation**: Generates a structured post with a compelling hook, organized body, relevant hashtags, and targeted mentions.
3. **Review & Customization**: User can edit, refine, or request AI regenerations.
4. **Draft Management**: Save polished content for future scheduling/posting.
5. **Direct Publishing**: Connect LinkedIn account to publish posts seamlessly (planned).

---

## Tech Stack

### Frontend (`/client`)
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Monitoring**: Sentry React SDK (`@sentry/react`) with Error Boundary

### Backend (`/server`)
- **Framework**: NestJS (Node.js + TypeScript)
- **Configuration**: `@nestjs/config`
- **Database**: MongoDB Atlas / Mongoose
- **Auth**: JWT Authentication & Passport
- **AI Engine**: Google Gemini SDK (`@google/genai`)
- **Email Delivery**: Resend Node.js SDK (`resend`)
- **API Documentation**: Swagger / OpenAPI (`@nestjs/swagger`, `swagger-ui-express`)
- **Monitoring**: Sentry NestJS SDK (`@sentry/nestjs`) with Global Exception Filter

---

## Monorepo Project Structure

```
Dastaan-Writer/
├── client/                  # React + Vite Frontend
│   ├── src/
│   │   ├── assets/          # Static branding & images
│   │   ├── components/      # UI components (PostEditor, ErrorBoundary, Navbar, etc.)
│   │   ├── layouts/         # App shell layouts
│   │   ├── pages/           # Application views (AssistantPage, Dashboard, etc.)
│   │   ├── routes/          # Client-side routing definition
│   │   ├── services/        # Axios API services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # React Context state management
│   │   └── utils/           # Helper functions & text formatters
│   ├── .env.example
│   └── package.json
│
├── server/                  # NestJS Backend API
│   ├── src/
│   │   ├── auth/            # JWT authentication module & guards
│   │   ├── users/           # User profile management module & schema
│   │   ├── ai/              # Google Gemini AI provider & generation service
│   │   ├── conversations/   # Interactive post creation threads & context engine
│   │   ├── posts/           # Canonical structured post generation, refinement, & storage
│   │   ├── email/           # Resend email module & transactional templates
│   │   ├── health/          # Health check endpoint controller & module
│   │   ├── common/          # Global filters (SentryExceptionFilter), decorators, & utils
│   │   ├── app.module.ts    # Main NestJS application module
│   │   └── main.ts          # Application entrypoint, Sentry init & Swagger setup
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Local Setup & Quickstart

### Prerequisites
- **Node.js**: v18.0.0+ or higher
- **npm**: v9.0.0+ or higher

### 1. Backend Setup (`/server`)
```bash
cd server
npm install
npm run start:dev
```
The NestJS backend will start on **http://localhost:5000**.
- Health Check: `curl http://localhost:5000/api/health`
- Swagger Docs: **http://localhost:5000/api/docs**

### 2. Frontend Setup (`/client`)
```bash
cd client
npm install
npm run dev
```
The React frontend will start on **http://localhost:5173**.

---

## OpenAPI / Swagger Documentation

Dastaan provides interactive OpenAPI documentation for all REST APIs.

### Swagger URL
- **Interactive UI**: `http://localhost:5000/api/docs`
- **OpenAPI JSON Spec**: `http://localhost:5000/api/docs-json`

### How to Test Protected Endpoints in Swagger UI:
1. Open `http://localhost:5000/api/docs` in your browser.
2. Under the **Auth** section, execute `POST /api/auth/login` (or `POST /api/auth/register`) with your credentials.
3. Copy the `accessToken` string from the JSON response.
4. Click the green **Authorize** button at the top right of the Swagger UI.
5. In the `JWT-auth` field, paste your `accessToken` (without the `Bearer` prefix) and click **Authorize**.
6. You can now execute and test all protected endpoints (such as `GET /api/users/me`, `GET /api/posts`, `POST /api/conversations`, and `POST /api/email/send-post`) directly inside the Swagger UI.

---

## Application Monitoring & Error Tracking (Sentry)

Dastaan integrates the official Sentry SDKs for resilient error tracking and observability across both the NestJS backend and React frontend.

### 1. Observability Isolation Principle
Sentry operates strictly as a non-intrusive observability layer. If Sentry DSNs are not provided or if Sentry's ingest servers are unreachable:
- Backend services and REST endpoints continue serving requests normally.
- Frontend views continue rendering without crashes.

### 2. Backend Sentry Integration (`@sentry/nestjs`)
- **Global Exception Filter** (`SentryExceptionFilter`): Intercepts unhandled runtime exceptions and 5xx server errors.
- **Recursive Metadata Sanitization**: Automatically redacts sensitive fields (passwords, tokens, API keys, database credentials, cookies, and raw prompt texts) before sending scope metadata to Sentry.
- **Safe Context**: Attaches only non-sensitive operational identifiers (`userId`, `method`, `path`, `statusCode`, `generationId`, `postId`, `conversationId`).

### 3. Frontend Sentry Integration (`@sentry/react`)
- **React Error Boundary** (`ErrorBoundary.jsx`): Catches rendering crashes, reports them to Sentry, and renders a clean fallback screen allowing users to reload or return to the dashboard without encountering white-screen freezes.
- **Dedicated Client DSN**: Uses strictly `VITE_SENTRY_DSN` in the browser bundle.

---

## Environment Variables

### Backend (`/server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
SENTRY_DSN=your_sentry_backend_dsn
SENTRY_ENVIRONMENT=development
```

### Frontend (`/client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SENTRY_DSN=your_sentry_frontend_dsn
```

---

## Transactional Email Integration (Resend)

Dastaan leverages the official [Resend Node.js SDK](https://resend.com/docs) for delivering transactional emails and post notifications.

### 1. Configuration
- **`RESEND_API_KEY`**: Your secret API key obtained from the Resend Dashboard.
- **`RESEND_FROM_EMAIL`**: The verified sender address. In local development/sandbox environments, use `onboarding@resend.dev` (which delivers emails to your registered account address or `delivered@resend.dev`). In production, use your verified domain address (e.g., `updates@yourdomain.com`).

### 2. Available Endpoints
All email endpoints are protected by JWT authentication (`Authorization: Bearer <token>`).

#### **Test Email Endpoint**
- **Method**: `POST /api/email/test`
- **Body**:
  ```json
  {
    "to": "delivered@resend.dev"
  }
  ```

#### **Send Saved Post Endpoint**
- **Method**: `POST /api/email/send-post`
- **Body**:
  ```json
  {
    "postId": "64f1a2b3c4d5e6f7a8b9c0d1"
  }
  ```

---

## Development Status
- **Phase 1 (Complete)**: Project foundation setup, monorepo architecture, Vite + React 19 frontend setup with Tailwind CSS v4, NestJS backend setup with TypeScript, global `/api` prefix, CORS configuration, environment variables, and `GET /api/health`.
- **Phase 2 & 3 (Complete)**: MongoDB Atlas schemas, JWT Authentication, Gemini AI post generation, conversation workflows, structured post editor, and refinement pipelines.
- **Phase 4.1 (Complete)**: Resend Transactional Email integration, authenticated email test endpoint, user-triggered post email delivery with semantic HTML templates, non-blocking fault tolerance, and "Email Me" button in PostEditor.
- **Phase 4.2 (Complete)**: Swagger / OpenAPI API documentation, interactive UI at `/api/docs`, JWT Bearer authorization testing, full DTO request/response schemas, and zero secret exposure.
- **Phase 4.3 (Complete)**: Sentry application monitoring & error tracking with `@sentry/nestjs` and `@sentry/react`, recursive metadata sanitization, React Error Boundary, failure isolation, and separated backend/frontend environment configurations.
