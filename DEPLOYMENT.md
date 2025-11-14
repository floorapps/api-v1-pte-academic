# PTE Academic Platform - Production Deployment Guide

## Overview
This guide covers deploying the PTE Academic practice platform to Vercel or Railway.com with full database integration, API optimization, and production-ready configuration.

## Prerequisites

### Required Services
- **Database**: PostgreSQL (Neon, Railway, or Supabase)
- **Blob Storage**: Vercel Blob Storage (for audio uploads)
- **AI Services**: OpenAI API (required) and Google Gemini API (optional)

### Environment Variables Required
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
POSTGRES_URL=postgresql://user:pass@host:5432/dbname  # Alternative

# Authentication (Better Auth)
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
BETTER_AUTH_URL=https://your-domain.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-domain.com

# Vercel Blob Storage (Required for audio uploads)
VERCEL_BLOB_READ_WRITE_TOKEN=<get-from-vercel-dashboard>

# OpenAI (Required for AI scoring)
OPENAI_API_KEY=sk-...

# Google Gemini (Optional, for fallback scoring)
GOOGLE_GENERATIVE_AI_API_KEY=...

# Transcription Provider
AI_TRANSCRIBE_PROVIDER=openai  # or 'none' for no transcription

# Scoring Configuration
PTE_SCORING_PROVIDER_PRIORITY=openai,gemini,vercel,heuristic
PTE_SCORING_TIMEOUT_MS=10000

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

## Deployment Steps

### 1. Vercel Deployment

#### A. Initial Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

#### B. Environment Variables
```bash
# Add all environment variables
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY
vercel env add VERCEL_BLOB_READ_WRITE_TOKEN
# ... add all others
```

#### C. Deploy
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

#### D. Post-Deployment
```bash
# Run database migrations
# Option 1: Through Vercel CLI
vercel env pull .env.production
pnpm db:migrate

# Option 2: Add to build command in vercel.json
```

### 2. Railway Deployment

#### A. Railway Setup
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to existing project (if already created)
railway link
```

#### B. Configure Database
```bash
# Add PostgreSQL database in Railway dashboard
# Or via CLI:
railway add postgresql

# Get connection string
railway variables
```

#### C. Environment Variables
```bash
# Set all required environment variables
railway variables set DATABASE_URL=...
railway variables set OPENAI_API_KEY=...
# ... set all others
```

#### D. Deploy
```bash
# Deploy to Railway
railway up

# Or connect to GitHub for automatic deployments
```

### 3. Database Setup

#### A. Run Migrations
```bash
# Local
pnpm db:migrate

# Production (after deployment)
# 1. Set DATABASE_URL in .env.production
# 2. Run migrations
pnpm db:migrate
```

#### B. Seed Initial Data (Optional)
```bash
# Seed speaking questions
pnpm db:seed:speaking

# Seed all question types
pnpm db:seed:all
```

**Important**: Do NOT run seed scripts in production with existing user data!

## API Endpoints

### Public Endpoints (No Auth Required)
- `GET /api/health` - Health check
- `POST /api/auth/[...all]` - Better Auth endpoints

### Protected Endpoints (Auth Required)
- **Speaking**
  - `GET /api/speaking/questions` - List questions
  - `GET /api/speaking/questions/[id]` - Get question
  - `POST /api/speaking/attempts` - Submit attempt

- **Writing**
  - `GET /api/writing/questions`
  - `GET /api/writing/questions/[id]`
  - `POST /api/writing/attempts`

- **Reading**
  - `GET /api/reading/questions`
  - `GET /api/reading/questions/[id]`
  - `POST /api/reading/attempts`

- **Listening**
  - `GET /api/listening/questions`
  - `GET /api/listening/questions/[id]`
  - `POST /api/listening/attempts`

- **User**
  - `GET /api/user` - Current user
  - `GET /api/user/profile` - User profile
  - `PATCH /api/user/profile` - Update profile
  - `GET /api/user/exam-dates` - Get exam dates
  - `POST /api/user/exam-dates` - Add exam date
  - `DELETE /api/user/exam-dates/[id]` - Delete exam date
  - `GET /api/user/target-score` - Get target score
  - `PATCH /api/user/target-score` - Update target score

- **Uploads**
  - `POST /api/uploads/audio` - Upload audio file

## Production Optimizations

### 1. Database Connection Pooling
```typescript
// lib/db/drizzle.ts already configured with:
// - Connection pooling
// - SSL in production
// - Proper timeout settings
```

### 2. API Rate Limiting
```typescript
// Implemented in:
// - app/api/speaking/attempts/route.ts (60 attempts/hour)
// - app/api/writing/attempts/route.ts
// - Other attempt endpoints
```

### 3. Caching Strategy
- Static pages: ISR with 1-hour revalidation
- API responses: No caching (real-time data)
- Images: CDN caching via Next.js Image component

### 4. Error Handling
- All API routes have try-catch blocks
- Proper error codes (400, 401, 403, 404, 500)
- Error logging to console (add Sentry/LogRocket in production)

## Monitoring & Health Checks

### Health Check Endpoint
```bash
curl https://your-domain.com/api/health
```

Response:
```json
{
  "ok": true,
  "version": "1",
  "uptimeMs": 123,
  "timestamp": "2025-01-14T...",
  "providers": [
    {"provider": "openai", "ok": true},
    {"provider": "gemini", "ok": true},
    {"provider": "vercel", "ok": true}
  ]
}
```

### Recommended Monitoring
1. **Uptime**: UptimeRobot or Pingdom
2. **Performance**: Vercel Analytics
3. **Errors**: Sentry
4. **Logs**: Vercel Logs or Railway Logs

## Security Checklist

- [ ] All API keys in environment variables (never committed)
- [ ] HTTPS enforced (automatic on Vercel/Railway)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] SQL injection protected (using Drizzle ORM)
- [ ] XSS protection headers set (in vercel.json)
- [ ] Authentication required for sensitive endpoints
- [ ] File upload validation (size, type)

## Performance Checklist

- [ ] Database indexes created (check migrations)
- [ ] Image optimization enabled (Next.js Image)
- [ ] API response caching where appropriate
- [ ] Bundle size optimized (check with `pnpm build`)
- [ ] Lazy loading for heavy components
- [ ] Edge functions for static content (Vercel Edge)

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL

# Check connection pool
# Increase max connections if needed
```

### Build Failures
```bash
# Clear cache and rebuild
pnpm clean
pnpm build

# Check TypeScript errors
pnpm tsc --noEmit
```

### API Errors
```bash
# Check logs
vercel logs  # Vercel
railway logs  # Railway

# Test endpoints locally
pnpm dev
```

## Mock Data Removal

The following files contain mock/sample data used for development:

### Keep (Required for Application)
- `lib/pte/mock-test-data.ts` - Mock test structure (actual feature)
- `lib/mock-tests/generator.ts` - Mock test generator (actual feature)

### Optional (Can be removed after seeding)
- `lib/db/mock-data.ts` - Sample data structure (not used in production)
- `lib/db/seed.ts` - Database seeding (only run once)

### Seed Routes (Development Only)
These routes should be disabled in production:
- `app/api/speaking/seed/route.ts`
- `app/api/writing/seed/route.ts`
- `app/api/reading/seed/route.ts`
- `app/api/listening/seed/route.ts`
- `app/api/seed-all/route.ts`

## Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations completed
- [ ] Initial data seeded (if needed)
- [ ] Health check endpoint returns 200
- [ ] Test user registration
- [ ] Test speaking practice workflow
- [ ] Test file uploads
- [ ] Test AI scoring
- [ ] Monitor error rates
- [ ] Set up backup strategy

## Backup Strategy

### Database Backups
```bash
# Neon: Automatic daily backups
# Railway: Enable automatic backups in dashboard
# Manual backup:
pg_dump $DATABASE_URL > backup.sql
```

### Blob Storage
Vercel Blob Storage has built-in redundancy.

## Scaling Considerations

### When to Scale
- Response time > 2s
- Database CPU > 80%
- Error rate > 1%
- Concurrent users > 1000

### Scaling Options
1. **Vercel**: Upgrade to Pro/Enterprise
2. **Railway**: Increase resource limits
3. **Database**: Upgrade plan or add read replicas
4. **CDN**: Use Vercel Edge or Cloudflare

## Support & Documentation

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs)

## Cost Estimation

### Vercel (Pro Plan)
- Hosting: $20/month
- Blob Storage: ~$0.15/GB
- Function executions: Included
- **Estimated**: $25-50/month (low traffic)

### Railway
- Hobby Plan: $5/month
- PostgreSQL: $5-20/month
- **Estimated**: $10-30/month (low traffic)

### External Services
- OpenAI API: ~$0.002/1K tokens
- Gemini API: Free tier available
- **Estimated**: $10-50/month depending on usage

## Next Steps

1. Choose your deployment platform (Vercel recommended for Next.js)
2. Set up required services (database, blob storage)
3. Configure environment variables
4. Run database migrations
5. Deploy!
6. Monitor and optimize

Good luck with your deployment! 🚀
