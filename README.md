# Dastaan - AI-Powered Social Media Content & Publishing Assistant

## Overview
**Dastaan** is an intelligent, context-aware content creation and publishing platform initially tailored for **LinkedIn**. Dastaan helps professionals, creators, and engineers convert their project updates, achievements, ideas, and career milestones into high-performing, authentic social media content without hallucination or fabricated metrics.

---

## Key Features & Core User Workflow

1. **Context-Aware Conversational Assistant**:
   - Engage in multi-turn conversations with Dastaan AI.
   - The assistant evaluates context completeness, asks targeted follow-ups, and extracts structured achievements.
   - **Zero-Fabrication Grounding**: The AI is strictly prohibited from guessing unmentioned tech stacks or inventing metrics/credentials.

2. **Single Canonical Post Source-of-Truth**:
   - Generates a single, canonical LinkedIn post document directly linked to the conversation thread.
   - Eliminates draft mismatches between the chatbot and editor.

3. **2-Column Post Editor Workspace**:
   - **Structured Fields**: Dedicated inputs for Hook, Multi-paragraph Body (with live word/char counters), Call to Action (CTA).
   - **Tag Chip Managers**: Interactive chip editors for `#hashtags` and `@mentions` with instant add/remove.
   - **AI Refinements & Transformations**: Grouped quick actions (*Regenerate*, *Improve Hook*, *Make Shorter*, *Make Personal*, *Make Technical*, *Make Professional*, *Improve Flow*, *Simplify*, *Add/Remove CTA*, and *3 Versions*).
   - **Live LinkedIn Preview**: Real-time simulation card updating on every keystroke, preserving clean paragraph spacing without raw markdown asterisks (`**`).

4. **Output Actions & Exporting**:
   - `[Save Draft]` — Persists manual edits in-place to MongoDB.
   - `[Copy Post]` — Copies formatted plain text to clipboard.
   - `[Email Me]` — Sends formatted post directly to the user's registered email via Resend.
   - `[Approve Post]` — Marks post status as `APPROVED`.

5. **API Documentation (Swagger / OpenAPI)**:
   - Complete interactive API reference at `http://localhost:5000/api/docs`.
   - Direct JWT Bearer authentication testing (`JWT-auth`).

6. **Application Monitoring & Error Tracking (Sentry.io)**:
   - Full-stack error tracking via `@sentry/nestjs` and `@sentry/react`.
   - **Recursive Metadata Sanitization**: Automatically scrubs passwords, tokens, API keys, database credentials, cookies, and raw prompt content.
   - **React Error Boundary**: Catches frontend rendering exceptions with graceful fallback UI.

---

## Tech Stack

### Frontend (`/client`)
- **Framework**: React 18 / 19 + Vite 8
- **Styling**: Tailwind CSS
- **Routing**: React Router v6 / v7
- **HTTP Client**: Axios (with JWT interceptors)
- **Icons**: Lucide React
- **Error Tracking**: Sentry React SDK (`@sentry/react`) with Error Boundary

### Backend (`/server`)
- **Framework**: NestJS (Node.js + TypeScript)
- **Configuration**: `@nestjs/config`
- **Database**: MongoDB Atlas / Mongoose
- **Auth**: JWT Authentication (`@nestjs/jwt`, `passport-jwt`, `bcrypt`)
- **AI Engine**: Google Gemini 3.5 Flash Lite (`@google/genai`, model: `gemini-3.5-flash-lite`)
- **Email Delivery**: Resend Node.js SDK (`resend`)
- **API Documentation**: Swagger / OpenAPI (`@nestjs/swagger`, `swagger-ui-express`)
- **Error Monitoring**: Sentry NestJS SDK (`@sentry/nestjs`) with Global Exception Filter

---

## Monorepo Project Structure

```
Dastaan-Writer/
├── client/                  # React + Vite Frontend
│   ├── src/
│   │   ├── assets/          # Static branding & images
│   │   ├── components/      # UI components (PostEditor, ErrorBoundary, Header, etc.)
│   │   ├── layouts/         # App shell layouts (MainLayout)
│   │   ├── pages/           # Application views (HomePage, AssistantPage, LoginPage, RegisterPage)
│   │   ├── routes/          # Client-side routing definitions
│   │   ├── services/        # Axios API client services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # React Context state management (AuthContext)
│   │   └── utils/           # Text formatters, constants, & helpers
│   ├── index.html           # HTML entrypoint with Dastaan branding
│   ├── .env.example
│   └── package.json
│
├── server/                  # NestJS Backend API
│   ├── src/
│   │   ├── auth/            # JWT authentication module, guards, & strategies
│   │   ├── users/           # User profile management module & schema
│   │   ├── ai/              # Google Gemini 3.5 AI provider & generation service
│   │   ├── conversations/   # Context-aware conversation engine & thread schema
│   │   ├── posts/           # Canonical structured post generation, refinement, & storage
│   │   ├── email/           # Resend email module & transactional HTML templates
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
- **Health Check**: `http://localhost:5000/api/health`
- **Swagger Documentation**: `http://localhost:5000/api/docs`
- **OpenAPI JSON Spec**: `http://localhost:5000/api/docs-json`

### 2. Frontend Setup (`/client`)
```bash
cd client
npm install
npm run dev
```
The React frontend will start on **http://localhost:5173**.

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
GEMINI_MODEL=gemini-3.5-flash-lite
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

## OpenAPI / Swagger Documentation

Dastaan provides interactive OpenAPI documentation for all REST APIs.

### Swagger URL
- **Interactive UI**: `http://localhost:5000/api/docs`

### How to Test Protected Endpoints in Swagger UI:
1. Open `http://localhost:5000/api/docs` in your browser.
2. Under the **Auth** section, execute `POST /api/auth/login` (or `POST /api/auth/register`) with your credentials.
3. Copy the `accessToken` string from the JSON response.
4. Click the green **Authorize** button at the top right of the Swagger UI.
5. In the `JWT-auth` field, paste your `accessToken` (without the `Bearer` prefix) and click **Authorize**.
6. You can now execute and test all protected endpoints (such as `GET /api/users/me`, `GET /api/posts`, `POST /api/conversations`, and `POST /api/email/send-post`) directly inside the Swagger UI.

---

## Transactional Email Integration (Resend)

Dastaan leverages the official [Resend Node.js SDK](https://resend.com/docs) for delivering transactional emails and post notifications.

### Available Endpoints
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
- **Behavior**: Verifies post ownership and delivers the formatted post preview exclusively to the authenticated user's registered email address.

---

## Application Monitoring & Error Tracking (Sentry)

Dastaan integrates official Sentry SDKs (`@sentry/nestjs` and `@sentry/react`) for resilient observability.

### Observability Features
- **Strict Failure Isolation**: If Sentry DSNs are not provided or if Sentry servers are unreachable, all application features and endpoints continue functioning normally.
- **Recursive Metadata Sanitization**: Automatically scrubs passwords, tokens, API keys, database credentials, cookies, and raw prompts before sending events.
- **React Error Boundary**: Prevents white-screen crashes on client errors, presenting users with a recovery screen.

---

## Development Status
- **Phase 1 (Complete)**: Project foundation setup, monorepo architecture, Vite + React frontend with Tailwind CSS, NestJS backend with TypeScript, global `/api` prefix, CORS configuration, environment variables, and `GET /api/health`.
- **Phase 2 & 3 (Complete)**: MongoDB Atlas schemas, JWT Authentication, Google Gemini 3.5 AI post generation, conversation workflows, structured post editor, and refinement pipelines.
- **Phase 3.3 (Complete)**: Quality and UX correction pass, single canonical post source of truth, zero-fabrication prompt grounding, 2-column desktop workspace, and separated refinement vs output action bars.
- **Phase 4.1 (Complete)**: Resend Transactional Email integration, authenticated email test endpoint, user-triggered post email delivery with semantic HTML templates, non-blocking fault tolerance, and "Email Me" action in PostEditor.
- **Phase 4.2 (Complete)**: Swagger / OpenAPI API documentation, interactive UI at `/api/docs`, JWT Bearer authorization testing, full DTO request/response schemas, and zero secret exposure.
- **Phase 4.3 (Complete)**: Sentry application monitoring & error tracking with `@sentry/nestjs` and `@sentry/react`, recursive metadata sanitization, React Error Boundary, failure isolation, and verified live dashboard event reporting.
