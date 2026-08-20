# Dastaan - AI LinkedIn Storytelling & Publishing Studio

<div align="center">
  <img src="./client/public/logo.png" alt="Dastaan Logo" width="80" height="80" style="border-radius: 18px;" />
  <h3>Turn your experience into compelling social media stories.</h3>
  <p>An intelligent, context-grounded AI storytelling studio tailored for LinkedIn and technical creators.</p>
</div>

---

## 🌟 Overview

**Dastaan** is an intelligent, context-aware content creation and publishing platform initially tailored for **LinkedIn**. Dastaan helps professionals, creators, and engineers convert their project updates, achievements, ideas, and career milestones into high-performing, authentic social media content without hallucination or fabricated metrics.

---

## ✨ Key Features & Architecture

### 1. 🤖 Expansive Full-Screen AI Assistant Workspace
- **ChatGPT & Gemini-Inspired Canvas**: Distraction-free full-page conversation canvas with generous whitespace and comfortable readability.
- **Multi-State Collapsible Sidebar**: Smooth transitions between `expanded` (280px), `compact` (60px icon rail), and `hidden` (0px) modes with `localStorage` persistence and keyboard shortcut support (`[`).
- **Dynamic "Draft" Status Hierarchy**: Real-time badges distinguishing between active context gathering, ready **`Draft`** status, and approved posts.
- **Inline Thread Renaming**: Rename conversations on-the-fly directly in the sidebar and header.
- **Floating Capsule Composer**: Auto-growing textarea up to 200px, prompt starter suggestions, and model switcher.
- **Slide-Over Post Studio Drawer**: Seamless on-demand slide-over panel for the 2-column LinkedIn Post Editor without crowding the chat flow.

### 2. 👤 Dedicated Modular Profile Hub (`/profile`)
- **Interactive Avatar Cropper**: Drag-and-drop file upload, client-side canvas zoom (`0.8x` to `3x`) and pan controls, pure circular clipping preview, and MongoDB storage.
- **Personal Information & Voice Context**: Full Name, Profession, Bio, Interactive Skills Tag Manager (add/remove chips), Writing Style, and Preferred Tone.
- **Account & Security**: Email management, password changes, active session overview, and sign-out.
- **Activity & Content Metrics**: Total stories created, approved posts count, words generated metrics, and recent post drafts list.
- **Privacy & AI Memory Controls**: Real-time context grounding toggle, memory retention settings, transient memory reset, and full JSON workspace data export.

### 3. ✍️ 2-Column Post Editor Workspace
- **Structured Fields**: Dedicated inputs for Hook, Multi-paragraph Body (with live word/char counters), Call to Action (CTA).
- **Tag Chip Managers**: Interactive chip editors for `#hashtags` and `@mentions` with instant add/remove.
- **AI Refinements & Transformations**: Grouped quick actions (*Regenerate*, *Improve Hook*, *Make Shorter*, *Make Personal*, *Make Technical*, *Make Professional*, *Improve Flow*, *Simplify*, *Add/Remove CTA*, and *3 Versions*).
- **Live LinkedIn Preview**: Real-time simulation card updating on every keystroke, preserving clean paragraph spacing without raw markdown asterisks (`**`).

### 4. 🔑 Authentication & Password Recovery
- Secure JWT authentication (`@nestjs/jwt`, `passport-jwt`, `bcrypt`).
- Clean Sign In and Sign Up workflows.
- Interactive **Forgot Password / Change Password** modal and dedicated backend reset endpoint (`POST /api/auth/reset-password`).

### 5. 📬 Transactional Email Delivery (Resend)
- Sends formatted post previews directly to registered user emails via the official Resend SDK.
- Non-blocking fault tolerance with semantic HTML templates.

### 6. 🛡️ Observability & API Documentation
- **Swagger / OpenAPI Reference**: Interactive API docs at `http://localhost:5000/api/docs`.
- **Sentry Error Tracking**: Full-stack observability via `@sentry/nestjs` and `@sentry/react` with recursive credential sanitization and React Error Boundary.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Framework**: React 18 + Vite 8
- **Styling**: Tailwind CSS (Hyper-Minimalist AI Studio aesthetic)
- **Routing**: React Router v6
- **HTTP Client**: Axios (with JWT bearer interceptors)
- **Icons**: Lucide React
- **Error Tracking**: Sentry React SDK (`@sentry/react`) with Error Boundary

### Backend (`/server`)
- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: MongoDB Atlas / Mongoose
- **Auth**: JWT Authentication (`@nestjs/jwt`, `passport-jwt`, `bcrypt`)
- **AI Engine**: Google Gemini 3.5 Flash Lite (`@google/genai`, model: `gemini-3.5-flash-lite`)
- **Email Delivery**: Resend Node.js SDK (`resend`)
- **API Documentation**: Swagger / OpenAPI (`@nestjs/swagger`, `swagger-ui-express`)
- **Error Monitoring**: Sentry NestJS SDK (`@sentry/nestjs`) with Global Exception Filter

---

## 📂 Project Structure

```
Dastaan-Writer/
├── client/                  # React + Vite Frontend
│   ├── src/
│   │   ├── assets/          # Static brand logos & assets
│   │   ├── components/      # UI components (Header, PostEditor, DastaanLogo, etc.)
│   │   │   ├── assistant/   # Assistant components (Sidebar, Composer, Header, Message)
│   │   │   ├── auth/        # Auth modals (ForgotPasswordModal)
│   │   │   └── profile/     # Profile sections (AvatarCropper, PersonalInfo, Activity)
│   │   ├── context/         # AuthContext & state providers
│   │   ├── hooks/           # Custom hooks (useSidebarState)
│   │   ├── layouts/         # App shell layouts (MainLayout)
│   │   ├── pages/           # Views (HomePage, AssistantPage, ProfilePage, LoginPage, RegisterPage)
│   │   ├── routes/          # Route definitions (AppRoutes)
│   │   ├── services/        # Axios API client functions
│   │   └── utils/           # Formatters, helpers, & constants
│   ├── public/              # Static public assets (logo.png, favicon.png)
│   ├── index.html           # HTML entrypoint
│   └── package.json
│
├── server/                  # NestJS Backend API
│   ├── src/
│   │   ├── auth/            # Authentication module, controllers, & reset password DTOs
│   │   ├── users/           # User schema & profile management
│   │   ├── ai/              # Google Gemini AI provider & prompt generation
│   │   ├── conversations/   # Conversation thread controllers & services
│   │   ├── posts/           # Structured post generation, storage, & refinement
│   │   ├── email/           # Resend email templates & delivery
│   │   ├── health/          # Health check endpoint
│   │   ├── common/          # Filters, guards, & decorators
│   │   ├── app.module.ts    # Main NestJS module
│   │   └── main.ts          # Server entrypoint & Swagger bootstrap
│   └── package.json
│
├── package.json             # Root monorepo workspace scripts
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup & Quickstart

### Prerequisites
- **Node.js**: v18.0.0+ or higher
- **npm**: v9.0.0+ or higher

### Root Development Scripts
From the project root:
```bash
# Start Frontend Dev Server
npm run dev

# Start Backend Server
npm run server
```

### Manual Service Setup

#### 1. Backend Setup (`/server`)
```bash
cd server
npm install
npm run start:dev
```
- **API Base URL**: `http://localhost:5000/api`
- **Swagger Documentation**: `http://localhost:5000/api/docs`
- **Health Check**: `http://localhost:5000/api/health`

#### 2. Frontend Setup (`/client`)
```bash
cd client
npm install
npm run dev
```
- **Frontend URL**: `http://localhost:5173/`

---

## ⚙️ Environment Variables

### Backend (`/server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
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

## 📖 OpenAPI / Swagger API Endpoints

Interactive Swagger documentation is live at `http://localhost:5000/api/docs`.

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register new account |
| **Auth** | `POST` | `/api/auth/login` | Sign in & receive JWT |
| **Auth** | `POST` | `/api/auth/reset-password` | Reset password by email |
| **Auth** | `GET` | `/api/auth/me` | Current session details |
| **Users** | `GET` | `/api/users/me` | Fetch user profile & voice context |
| **Users** | `PUT` | `/api/users/me` | Update bio, skills, avatar, & tone |
| **Conversations** | `POST` | `/api/conversations` | Create new post thread |
| **Conversations** | `GET` | `/api/conversations` | List user conversation history |
| **Conversations** | `PUT` | `/api/conversations/:id` | Rename / update thread |
| **Posts** | `POST` | `/api/posts/generate` | Generate structured LinkedIn draft |
| **Posts** | `POST` | `/api/posts/refine` | Refine post with 1-click transformation |
| **Posts** | `POST` | `/api/posts/:id/approve` | Approve post status |
| **Email** | `POST` | `/api/email/send-post` | Email post draft via Resend |
| **Health** | `GET` | `/api/health` | Service health status |

---

## 📄 License
UNLICENSED — Proprietary to Dastaan Writer Project.
