# 🎓 PTE Learning SaaS Platform - Academic API v1

<div align="center">

![PTE Academic Platform](https://via.placeholder.com/800x400/4F46E5/ffffff?text=PTE+Academic+Learning+Platform)

**A modern, production-ready SaaS application for PTE Academic test preparation**

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Better Auth](https://img.shields.io/badge/Better%20Auth-1.3-green)](https://www.better-auth.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-Latest-orange)](https://orm.drizzle.team/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) • [Tech Stack](#️-tech-stack) • [Getting Started](#-quick-start) • [Production](#-production-deployment) • [Documentation](#-documentation) • [Team](#-team)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Production Deployment](#-production-deployment)
- [Project Structure](#-project-structure)
- [Database Management](#️-database-management)
- [Authentication](#-authentication)
- [Development Scripts](#️-development-scripts)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Team & Credits](#-team--credits)
- [Contributing](#-contributing)
- [License](#-license)

---

## Overview

The **PTE Learning SaaS Platform** is a comprehensive, enterprise-grade web application designed for PTE (Pearson Test of English) Academic test preparation. Built with modern technologies and best practices, it provides an interactive learning environment with AI-powered scoring, practice sessions, and real-time feedback.

### Key Highlights

- 🚀 **Production-Ready**: Deployed and running in production with optimized performance
- 🔐 **Enterprise Authentication**: Multi-provider OAuth + email/password authentication
- 🤖 **AI-Powered**: Integrated with Google Gemini and OpenAI for intelligent scoring
- 📊 **Real-time Analytics**: Track student progress and performance metrics
- 🎯 **Modular Architecture**: Scalable microservices with Motia backend
- 🌐 **Global Scale**: Serverless PostgreSQL with Neon, deployed on Vercel

---

## ✨ Features

### 🎯 Core Functionality

- **PTE Academic Test Modules**
  - Speaking (Read Aloud, Repeat Sentence, Describe Image, etc.)
  - Writing (Summarize Written Text, Essay Writing)
  - Reading (Multiple Choice, Re-order Paragraphs, Fill in Blanks)
  - Listening (Summarize Spoken Text, Multiple Choice, Fill in Blanks)

- **AI-Powered Scoring System**
  - Real-time feedback using Google Gemini AI
  - Comprehensive rubric-based evaluation
  - Pronunciation analysis (planned)
  - Fluency and coherence scoring

- **User Management**
  - Multi-organization support
  - Role-based access control (RBAC)
  - Credit-based system for test attempts
  - Progress tracking and analytics

### 🔐 Authentication & Security

- **Better Auth** with multiple providers:
  - Email/Password with email verification
  - Google OAuth
  - GitHub OAuth
  - Facebook OAuth
  - Apple Sign In
- Production-ready security headers
- CSRF protection
- Rate limiting
- SQL injection prevention

### 📊 Admin Features

- User management dashboard
- Analytics and reporting
- Content management system
- System health monitoring

---

## 🏗️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16 | React framework with App Router |
| [React](https://react.dev/) | 19.2 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.8+ | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 4.1 | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com/) | Latest | Component library |
| [Framer Motion](https://www.framer.com/motion/) | 12 | Animations |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5 | State management |
| [SWR](https://swr.vercel.app/) | 2.3 | Data fetching |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Better Auth](https://www.better-auth.com/) | 1.3+ | Authentication |
| [Drizzle ORM](https://orm.drizzle.team/) | 0.43+ | Database ORM |
| [PostgreSQL](https://www.postgresql.org/) | 15+ | Primary database |
| [Neon](https://neon.tech/) | Latest | Serverless PostgreSQL |
| [Motia](https://motia.ai/) | Latest | Microservices backend |

### AI & APIs

| Service | Purpose |
|---------|---------|
| [Google Gemini](https://deepmind.google/technologies/gemini/) | AI scoring and analysis |
| [OpenAI](https://openai.com/) | GPT-4 for advanced features |
| [Vercel AI SDK](https://sdk.vercel.ai/) | AI integration framework |

### DevOps & Infrastructure

| Technology | Purpose |
|------------|---------|
| [Vercel](https://vercel.com/) | Frontend deployment & hosting |
| [Railway](https://railway.app/) | Backend services |
| [Docker](https://www.docker.com/) | Containerization |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipeline |
| [pnpm](https://pnpm.io/) | Package manager |

---

## 🏛️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
│                  (Next.js 16 - Vercel)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTPS/REST API
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   API Gateway Layer                          │
│              (Next.js API Routes)                           │
└─────────┬──────────────────────────┬───────────────────────┘
          │                          │
          │                          │
┌─────────▼──────────┐    ┌─────────▼──────────────────────┐
│  Better Auth       │    │   Motia Backend                │
│  Authentication    │    │   (Microservices)              │
│  Service           │    │   - Speaking API               │
└────────────────────┘    │   - Scoring Service            │
                          │   - Content Management          │
                          └────────────────────────────────┘
                                      │
                      ┌───────────────┼──────────────┐
                      │               │              │
           ┌──────────▼─────┐  ┌─────▼────┐  ┌─────▼──────┐
           │ Neon PostgreSQL│  │ AI APIs  │  │ Blob Storage│
           │   (Primary DB) │  │ (Gemini) │  │  (Vercel)  │
           └────────────────┘  └──────────┘  └────────────┘
```

### Deployment Architecture

![Production Environment](https://via.placeholder.com/800x300/059669/ffffff?text=Production+Deployment+Architecture)

```
Production Environment:
├── Frontend (Vercel)
│   ├── Domain: [your-production-url].vercel.app
│   ├── CDN: Global Edge Network
│   ├── SSL: Auto-managed by Vercel
│   └── Environment: Production
│
├── Backend Services
│   ├── Motia Backend (Railway/Motia Cloud)
│   │   ├── Port: 3001
│   │   ├── Docker Image: motia-backend:latest
│   │   └── Auto-scaling: Enabled
│   │
│   └── API Routes (Vercel Serverless)
│       └── Better Auth endpoints
│
├── Database (Neon)
│   ├── PostgreSQL 15+
│   ├── Connection Pooling: Enabled
│   ├── Backups: Automatic daily
│   └── Region: AWS (configurable)
│
└── AI Services
    ├── Google Gemini API
    └── OpenAI API (GPT-4)
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: 18.18 or higher ([Download](https://nodejs.org/))
- **pnpm**: 10.23.0 or higher (`npm install -g pnpm`)
- **Git**: Latest version ([Download](https://git-scm.com/))
- **Neon Account**: Sign up at [neon.tech](https://neon.tech)
- **Google AI API Key**: Get from [Google AI Studio](https://makersuite.google.com/)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/floorapps/api-v1-pte-academic.git
cd api-v1-pte-academic
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

#### 4. Configure Environment Variables

Edit `.env.local` with your credentials:

```env
# Database (Neon PostgreSQL)
POSTGRES_URL=postgresql://user:password@host.pooler.aws.neon.tech/database?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here  # Generate: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# AI Services
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key  # Optional

# Vercel Blob Storage (Production)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

#### 5. Database Setup

```bash
# Generate Drizzle migrations
pnpm db:generate

# Push schema to database
npx drizzle-kit push

# Verify setup
npx tsx scripts/verify-auth-setup.ts

# (Optional) Seed database with sample data
pnpm db:seed:all
```

#### 6. Run Development Server

```bash
pnpm dev
```

#### 7. Open Application

Navigate to [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. **Create Admin Account**: Sign up using email/password
2. **Verify Email**: Check your inbox for verification link
3. **Explore Features**: Navigate through the dashboard
4. **Test Practice Sessions**: Try speaking or writing modules

---

## 🌐 Production Deployment

### Production Environment Variables

```env
# Production Database (Neon)
POSTGRES_URL=postgresql://user:password@ep-xxxx.aws.neon.tech/db?sslmode=require

# Better Auth (Production)
BETTER_AUTH_SECRET=<32-byte-random-string>
BETTER_AUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-domain.vercel.app

# OAuth Providers
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxx

# AI Services (Production)
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx

# Optional: Error Tracking
ROLLBAR_ACCESS_TOKEN=your-rollbar-token
ROLLBAR_ENVIRONMENT=production

# System
NODE_ENV=production
```

### Deploy to Vercel

#### Option 1: Automatic Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js configuration

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all production environment variables listed above
   - Apply to: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live! 🎉

#### Option 2: CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
pnpm deploy:vercel
```

### Deploy Backend to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
pnpm deploy:railway
```

### Docker Deployment

Build and run using Docker:

```bash
# Build image
docker build -t pte-academic-platform .

# Run container
docker run -p 3000:3000 --env-file .env.production pte-academic-platform
```

### Post-Deployment Checklist

- ✅ Verify database connection
- ✅ Test authentication flows (email, OAuth)
- ✅ Update OAuth redirect URIs in provider settings
- ✅ Test AI scoring functionality
- ✅ Check error tracking (Rollbar)
- ✅ Verify SSL certificate
- ✅ Test mobile responsiveness
- ✅ Run production smoke tests

### Production URLs

- **Frontend**: [https://your-app.vercel.app](https://your-app.vercel.app)
- **Motia Backend**: [https://your-backend.railway.app](https://your-backend.railway.app)
- **Admin Dashboard**: [https://your-app.vercel.app/admin](https://your-app.vercel.app/admin)

---

## 📁 Project Structure

```
api-v1-pte-academic/
├── 📁 app/                          # Next.js 16 App Router
│   ├── (home)/                      # Home page route group
│   ├── (login)/                     # Authentication pages
│   │   ├── sign-in/                 # Sign in page
│   │   └── sign-up/                 # Sign up page
│   ├── (pte-academic)/              # PTE learning features
│   │   ├── dashboard/               # User dashboard
│   │   ├── practice/                # Practice sessions
│   │   │   ├── speaking/            # Speaking modules
│   │   │   ├── writing/             # Writing modules
│   │   │   ├── reading/             # Reading modules
│   │   │   └── listening/           # Listening modules
│   │   └── results/                 # Test results & analytics
│   ├── api/                         # API routes
│   │   ├── auth/                    # Better Auth endpoints
│   │   ├── practice/                # Practice session APIs
│   │   └── scoring/                 # AI scoring APIs
│   ├── layout.tsx                   # Root layout
│   └── globals.css                  # Global styles
│
├── 📁 components/                   # React components
│   ├── ui/                          # shadcn/ui components
│   │   ├── button.tsx               # Button component
│   │   ├── card.tsx                 # Card component
│   │   ├── dialog.tsx               # Dialog component
│   │   └── ...                      # Other UI components
│   ├── pte/                         # PTE-specific components
│   │   ├── speaking-recorder.tsx    # Audio recording
│   │   ├── question-card.tsx        # Question display
│   │   └── scoring-panel.tsx        # Score display
│   └── practice/                    # Practice session components
│       ├── timer.tsx                # Session timer
│       └── progress-bar.tsx         # Progress indicator
│
├── 📁 lib/                          # Core application logic
│   ├── auth/                        # Better Auth configuration
│   │   ├── auth.ts                  # Auth server setup
│   │   ├── auth-client.ts           # Auth client hooks
│   │   └── auth-config.ts           # Auth providers config
│   ├── db/                          # Database & ORM
│   │   ├── schema.ts                # Drizzle schema definitions
│   │   ├── drizzle.ts               # Database connection
│   │   ├── seed.ts                  # Database seeding
│   │   └── migrations/              # Database migrations
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-session.ts           # Session management
│   │   └── use-audio.ts             # Audio recording
│   ├── pte/                         # PTE business logic
│   │   ├── scoring/                 # AI scoring algorithms
│   │   ├── questions/               # Question management
│   │   └── types/                   # TypeScript types
│   └── utils/                       # Utility functions
│
├── 📁 motia-backend/                # Microservices backend
│   ├── src/                         # Source code
│   │   ├── routes/                  # API routes
│   │   ├── services/                # Business logic
│   │   └── utils/                   # Utilities
│   ├── Dockerfile                   # Docker configuration
│   └── package.json                 # Backend dependencies
│
├── 📁 public/                       # Static assets
│   ├── images/                      # Image files
│   ├── audio/                       # Sample audio files
│   └── favicon.ico                  # Favicon
│
├── 📁 scripts/                      # Utility scripts
│   ├── verify-auth-setup.ts         # Auth verification
│   ├── migrate.ts                   # Database migration
│   ├── pre-deploy-check.ts          # Pre-deployment checks
│   └── dangerously-drop-all-tables.ts  # DB reset (dev only)
│
├── 📁 .github/                      # GitHub configuration
│   └── workflows/                   # CI/CD workflows
│       ├── docker-publish.yml       # Docker build & push
│       ├── deploy-motia.yml         # Motia backend deployment
│       └── motia-docker.yml         # Motia Docker workflow
│
├── 📄 .env.example                  # Environment template
├── 📄 .env.local                    # Local environment (gitignored)
├── 📄 drizzle.config.ts             # Drizzle Kit configuration
├── 📄 next.config.ts                # Next.js configuration
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 tailwind.config.ts            # Tailwind CSS configuration
├── 📄 vercel.json                   # Vercel deployment config
├── 📄 railway.json                  # Railway deployment config
├── 📄 docker-compose.yml            # Docker Compose setup
├── 📄 package.json                  # Project dependencies
├── 📄 pnpm-lock.yaml                # pnpm lock file
└── 📄 README.md                     # This file
```

---

## 🗄️ Database Management

### Available Commands

```bash
# Generate migrations from schema changes
pnpm db:generate

# Push schema to database (development)
npx drizzle-kit push

# Run migrations (production)
pnpm db:migrate

# Open Drizzle Studio (visual database browser)
pnpm db:studio

# Seed database with sample data
pnpm db:seed:all

# Seed only speaking module data
pnpm db:seed:speaking

# Verify database setup
npx tsx scripts/verify-auth-setup.ts

# Test database connection
pnpm db:test

# ⚠️ DANGER: Drop all tables (development only!)
npx tsx scripts/dangerously-drop-all-tables.ts
```

### Database Schema

The application uses PostgreSQL with the following core tables:

#### Authentication Tables (Better Auth)

- **users** - User accounts with custom fields
  - id, email, name, emailVerified, image
  - credits (custom field for practice sessions)
  - organizationId (multi-tenancy support)

- **sessions** - Active user sessions
  - sessionId, userId, expiresAt, ipAddress

- **accounts** - OAuth provider accounts
  - userId, accountId, providerId, accessToken

- **verifications** - Email verification tokens
  - id, identifier, value, expiresAt

#### Application Tables

- **organizations** - Multi-tenancy support
- **practice_sessions** - User practice attempts
- **question_banks** - PTE questions repository
- **scoring_results** - AI scoring results
- **user_progress** - Learning progress tracking

### Database Migrations

```bash
# Create a new migration
pnpm db:generate

# Apply migrations to production
pnpm db:migrate

# Rollback last migration (if needed)
npx drizzle-kit drop
```

---

## 🔐 Authentication

### Supported Methods

#### Email/Password Authentication

```typescript
import { signUp, signIn } from '@/lib/auth/auth-client';

// Sign Up
const result = await signUp.email({
  email: 'user@example.com',
  password: 'securePassword123',
  name: 'John Doe',
});

// Sign In
const session = await signIn.email({
  email: 'user@example.com',
  password: 'securePassword123',
});
```

#### OAuth Providers

```typescript
import { signIn } from '@/lib/auth/auth-client';

// Google Sign In
await signIn.social({ provider: 'google' });

// GitHub Sign In
await signIn.social({ provider: 'github' });

// Facebook Sign In
await signIn.social({ provider: 'facebook' });
```

#### Session Management

```typescript
import { useSession } from '@/lib/auth/auth-client';

export default function ProfilePage() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;

  return <div>Welcome, {session.user.name}!</div>;
}
```

### OAuth Configuration

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`

#### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL:
   - Development: `http://localhost:3000/api/auth/callback/github`
   - Production: `https://your-domain.com/api/auth/callback/github`

---

## 🛠️ Development Scripts

### Core Scripts

```bash
# Development
pnpm dev                    # Start dev server (port 3000)
pnpm dev:vm                 # Start dev server (VM optimized)
pnpm build                  # Build for production
pnpm build:vm               # Build for production (VM optimized)
pnpm start                  # Start production server
pnpm lint                   # Run ESLint
pnpm lint:fix               # Fix ESLint issues automatically

# Database
pnpm db:generate            # Generate Drizzle migrations
pnpm db:migrate             # Run migrations
pnpm db:studio              # Open Drizzle Studio (localhost:4983)
pnpm db:seed                # Seed database
pnpm db:seed:speaking       # Seed only speaking module
pnpm db:seed:all            # Seed all modules
pnpm db:test                # Test database connection

# Utilities
pnpm clean                  # Clear .next cache
pnpm clean:vm               # Clear cache + pnpm store (VM)
pnpm clean:all              # Clean everything & reinstall
pnpm fresh                  # Clean cache & restart dev
pnpm fresh:vm               # Fresh start (VM optimized)

# Deployment
pnpm deploy:check           # Pre-deployment checks
pnpm deploy:test            # Test production APIs
pnpm deploy:vercel          # Deploy to Vercel
pnpm deploy:railway         # Deploy to Railway

# Testing
pnpm test:e2e               # Run Playwright E2E tests

# VM Development
pnpm vm:setup               # Setup for VM environment
pnpm vm:dev                 # Start VM development mode
```

### VM Development (Low Memory Environments)

For development on virtual machines or low-memory systems:

```bash
# Initial setup
pnpm vm:setup

# Development
pnpm dev:vm                 # Uses 2GB memory
pnpm build:vm               # Uses 4GB memory
```

---

## 📡 API Documentation

### Authentication Endpoints

```
POST   /api/auth/sign-up                    # Email/password sign up
POST   /api/auth/sign-in                    # Email/password sign in
POST   /api/auth/sign-out                   # Sign out
GET    /api/auth/session                    # Get current session
POST   /api/auth/verify-email               # Verify email address
POST   /api/auth/forgot-password            # Request password reset
POST   /api/auth/reset-password             # Reset password

# OAuth
GET    /api/auth/callback/google            # Google OAuth callback
GET    /api/auth/callback/github            # GitHub OAuth callback
GET    /api/auth/callback/facebook          # Facebook OAuth callback
```

### Practice Session Endpoints

```
GET    /api/practice/sessions               # Get user sessions
POST   /api/practice/sessions               # Create new session
GET    /api/practice/sessions/:id           # Get session details
PUT    /api/practice/sessions/:id           # Update session
DELETE /api/practice/sessions/:id           # Delete session

POST   /api/practice/speaking/submit        # Submit speaking answer
POST   /api/practice/writing/submit         # Submit writing answer
```

### Scoring Endpoints

```
POST   /api/scoring/speaking                # Score speaking response
POST   /api/scoring/writing                 # Score writing response
GET    /api/scoring/results/:id             # Get scoring results
```

### Motia Backend API

Base URL: `http://localhost:3001` (development) or production URL

```
GET    /api/health                          # Health check
POST   /api/speaking/score                  # AI speaking scoring
GET    /api/questions/:type                 # Get questions by type
```

---

## 🧪 Testing

### End-to-End Testing with Playwright

```bash
# Install Playwright
npx playwright install

# Run E2E tests
pnpm test:e2e

# Run tests in UI mode
npx playwright test --ui

# Run specific test
npx playwright test tests/auth.spec.ts
```

### Manual Testing Checklist

- [ ] User registration flow
- [ ] Email verification
- [ ] OAuth sign-in (Google, GitHub)
- [ ] Create practice session
- [ ] Submit speaking answer
- [ ] View scoring results
- [ ] Dashboard analytics
- [ ] Mobile responsiveness

---

## 👥 Team & Credits

### 👨‍💻 Main Engineer

**Lijan Haque**
*Lead Full-Stack Engineer & Architect*

- 🔧 System architecture and design
- 💻 Full-stack development (Next.js, TypeScript, PostgreSQL)
- 🤖 AI integration (Google Gemini, OpenAI)
- 🚀 DevOps and deployment (Vercel, Railway, Docker)
- 📊 Database design and optimization

[LinkedIn](https://linkedin.com/in/lijanhaque) • [GitHub](https://github.com/lijanhaque) • [Email](mailto:lijan@example.com)

---

### 🤝 Technology Partners & Tools

#### Core Technologies

<table>
<tr>
<td align="center" width="25%">
<img src="https://cdn.worldvectorlogo.com/logos/anthropic-icon.svg" width="60" height="60" alt="Anthropic"/><br/>
<b>Anthropic Claude</b><br/>
<sub>AI Development & Assistance</sub>
</td>
<td align="center" width="25%">
<img src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_dark_background.png" width="60" height="60" alt="Vercel"/><br/>
<b>Vercel</b><br/>
<sub>Deployment & Hosting</sub>
</td>
<td align="center" width="25%">
<img src="https://neon.tech/favicon/favicon.svg" width="60" height="60" alt="Neon"/><br/>
<b>Neon</b><br/>
<sub>Serverless PostgreSQL</sub>
</td>
<td align="center" width="25%">
<img src="https://railway.app/brand/logo-light.png" width="60" height="60" alt="Railway"/><br/>
<b>Railway</b><br/>
<sub>Backend Hosting</sub>
</td>
</tr>
</table>

#### Development Frameworks

- **[Next.js](https://nextjs.org/)** by Vercel - React framework for production
- **[Better Auth](https://www.better-auth.com/)** - Modern authentication library
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript-first ORM
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library

#### AI & Machine Learning

- **[Google Gemini](https://deepmind.google/technologies/gemini/)** - AI-powered scoring
- **[OpenAI GPT-4](https://openai.com/)** - Advanced language model
- **[Vercel AI SDK](https://sdk.vercel.ai/)** - AI integration toolkit

#### Infrastructure & DevOps

- **[GitHub](https://github.com/)** - Version control and CI/CD
- **[Docker](https://www.docker.com/)** - Containerization
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager

---

### 🙏 Special Thanks

Special thanks to the following open-source communities and tools that made this project possible:

- **Anthropic Claude** for AI-assisted development and problem-solving
- **Vercel** for seamless deployment and excellent developer experience
- **Neon** for serverless PostgreSQL with amazing performance
- **Better Auth** team for a modern authentication solution
- **Drizzle ORM** team for a developer-friendly TypeScript ORM
- **shadcn** for beautiful, accessible UI components
- The entire **Next.js** and **React** communities

---

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com/) - fully customizable components.

### Add Components

```bash
# Install shadcn CLI
npx shadcn@latest init

# Add individual components
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add card
npx shadcn@latest add form
npx shadcn@latest add table
```

### Available Components

- ✅ Buttons, Cards, Dialogs, Modals
- ✅ Forms, Inputs, Labels, Selects
- ✅ Tables, Tabs, Tooltips, Popovers
- ✅ Dropdowns, Menus, Navigation
- ✅ Progress bars, Sliders, Switches
- ✅ Accordions, Collapsibles
- ✅ Date pickers, Calendar
- ✅ Toast notifications, Alerts

---

## 📊 Performance Optimizations

### Implemented Optimizations

#### ⚡ Bundle Size Reduction
- Tree shaking enabled in production
- Dynamic imports for heavy components
- Optimized package imports (import specific modules)
- Code splitting with Next.js App Router

#### 🗄️ Caching Strategy
- Static assets cached for 1 year
- API responses cached with SWR (60s stale time)
- Image optimization (AVIF/WebP formats)
- Serverless function edge caching

#### 💾 Database Performance
- Connection pooling (max 10 connections)
- Optimized queries with Drizzle ORM
- Proper indexing on frequently queried fields
- Serverless Postgres with Neon for auto-scaling

#### 🔒 Security Headers
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options, X-Content-Type-Options
- Referrer Policy, Permissions Policy
- CSRF protection enabled

### Performance Metrics

```
Lighthouse Score (Production):
├── Performance:    95+
├── Accessibility:  98+
├── Best Practices: 95+
└── SEO:           100
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Database Connection Failed

```bash
# Check your POSTGRES_URL
echo $POSTGRES_URL

# Verify database connection
pnpm db:test

# Check Neon dashboard for database status
# https://console.neon.tech/
```

#### Build Errors

```bash
# Clear all caches and rebuild
pnpm clean
pnpm install
pnpm build

# VM-specific build
pnpm build:vm
```

#### OAuth Not Working

- ✅ Verify redirect URIs match exactly (no trailing slashes)
- ✅ Check OAuth credentials in environment variables
- ✅ Ensure HTTPS in production
- ✅ Check OAuth provider dashboard for errors

#### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

#### Out of Memory Errors

```bash
# Use VM-optimized scripts
pnpm dev:vm    # 2GB memory
pnpm build:vm  # 4GB memory

# Or increase Node.js memory manually
NODE_OPTIONS='--max-old-space-size=4096' pnpm build
```

---

## 📚 Documentation

### Additional Resources

- 📖 [Deployment Guide](./DEPLOYMENT.md) - Complete production deployment guide
- 🗄️ [Motia Deployment](./MOTIA_DEPLOYMENT.md) - Motia backend deployment
- 🔧 [Project Context](./PROJECT_CONTEXT.md) - Project overview and context
- 🤖 [Agent Documentation](./AGENT_DOC.MD) - AI agent integration docs
- 🌐 [Environment Variables](./.env.example) - All environment variables explained

### External Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/docs)

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Contributing Guidelines

1. **Fork the repository**
   ```bash
   git fork https://github.com/floorapps/api-v1-pte-academic.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow the existing code style
   - Add tests if applicable

4. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Wait for code review

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages (Conventional Commits)

### Reporting Issues

Found a bug? Have a feature request?

- 🐛 [Report Bug](https://github.com/floorapps/api-v1-pte-academic/issues/new?template=bug_report.md)
- ✨ [Request Feature](https://github.com/floorapps/api-v1-pte-academic/issues/new?template=feature_request.md)

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 Lijan Haque & Floorapps

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See the [LICENSE](LICENSE) file for full details.

---

## 🔗 Useful Links

- 🌐 **Live Demo**: [https://your-app.vercel.app](https://your-app.vercel.app)
- 📚 **Documentation**: [https://docs.your-domain.com](https://docs.your-domain.com)
- 🐛 **Issue Tracker**: [GitHub Issues](https://github.com/floorapps/api-v1-pte-academic/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/floorapps/api-v1-pte-academic/discussions)
- 📧 **Contact**: [support@your-domain.com](mailto:support@your-domain.com)

---

## 📱 Social Media

Stay updated with the latest news and updates:

- 🐦 Twitter: [@floorapps](https://twitter.com/floorapps)
- 💼 LinkedIn: [Floorapps](https://linkedin.com/company/floorapps)
- 📺 YouTube: [Floorapps Channel](https://youtube.com/@floorapps)

---

Made with ❤️ using Next.js 16 and Better Auth

## Running Tests

This project includes comprehensive unit tests for core business logic.

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

### Test Coverage

Unit tests are provided for:
- **Scoring normalization** (`lib/pte/scoring-normalize.ts`) - Pure functions for score calculations
- **Timing utilities** (`lib/pte/timing.ts`) - PTE test timing logic
- **PTE utilities** (`lib/pte/utils.ts`) - Word counting and media type detection
- **General utilities** (`lib/utils.ts`) - className merging

Tests follow Jest conventions and are located in the `__tests__` directory.
## 🌟 Star History

If you find this project helpful, please consider giving it a ⭐ star on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=floorapps/api-v1-pte-academic&type=Date)](https://star-history.com/#floorapps/api-v1-pte-academic&Date)

---

<div align="center">

**Made with ❤️ by [Lijan Haque](https://github.com/lijanhaque)**

**Powered by Next.js 16, Better Auth, Drizzle ORM, and Neon PostgreSQL**

**Deployed on Vercel • AI by Google Gemini & OpenAI**

---

© 2024 Lijan Haque & Floorapps. All rights reserved.

[⬆ Back to Top](#-pte-learning-saas-platform---academic-api-v1)

</div>
