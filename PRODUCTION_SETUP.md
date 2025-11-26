# Production Setup Guide

## Prerequisites
- Node.js >= 18.18 (currently using v22.21.1 ✓)
- pnpm >= 10.23.0 (currently using v10.23.0 ✓)
- PostgreSQL database (Neon recommended)

## 1. Install Dependencies (✓ Completed)

```bash
# Clean install with frozen lockfile (production)
pnpm install --frozen-lockfile

# Or fresh install (development)
pnpm install
```

**Current Status**: ✓ All dependencies installed successfully
- 206 dependencies resolved
- 104 dev dependencies ready
- Jest 30.2.0, Next.js 16.0.3, TypeScript 5.9.3

## 2. Environment Configuration

### Step 1: Copy Environment Template
```bash
cp .env.example .env.local
```

### Step 2: Configure Required Variables
Edit `.env.local` and provide:

#### Database (Required)
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
POSTGRES_URL=postgresql://user:password@host/dbname?sslmode=require
```

#### Authentication (Required)
```bash
# Generate a secure secret:
openssl rand -base64 32
```
Then set:
```env
BETTER_AUTH_SECRET=<your-generated-key>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

#### AI Services (Required)
```env
GOOGLE_GENERATIVE_AI_API_KEY=<your-gemini-api-key>
OPENAI_API_KEY=<your-openai-api-key>
```

#### File Storage (Required)
```env
VERCEL_BLOB_READ_WRITE_TOKEN=<your-vercel-blob-token>
```

#### Deployment
```env
NODE_ENV=development    # or 'production'
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Verify Configuration
```bash
pnpm env:check
```

## 3. Database Setup

### Initialize Drizzle
```bash
# Generate migrations from schema
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Open Drizzle Studio (visual database tool)
pnpm db:studio
```

### Seed Sample Data (Optional)
```bash
# Seed all sections with test data
pnpm db:seed:all

# Or seed specific section
pnpm db:seed:speaking
```

## 4. Development Workflow

### Start Development Server
```bash
# Standard dev server (Turbopack enabled)
pnpm dev

# On VM with limited memory
pnpm dev:vm
```

The server runs on `http://localhost:3000`

### Build for Production
```bash
# Build with Turbopack (default, faster)
pnpm build

# Or build with Webpack (if needed)
pnpm build --webpack

# On VM with limited memory
pnpm build:vm
```

### Run in Production
```bash
pnpm start
```

## 5. Quality Assurance

### Linting
```bash
# Check for code issues
pnpm lint

# Auto-fix issues
pnpm lint:fix
```

**Status**: Some linting issues found (HTML entities, async client components)
- Run `pnpm lint:fix` to auto-fix

### Testing

#### Unit Tests
```bash
# Watch mode (development)
pnpm test

# CI mode (one run, parallel)
pnpm test:ci

# With coverage
pnpm test:coverage
```

#### E2E Tests
```bash
pnpm test:e2e
```

## 6. Deployment

### Vercel (Recommended)
```bash
# Pre-deployment checks
pnpm deploy:check

# Deploy to production
pnpm deploy:vercel
```

### Railway
```bash
pnpm deploy:railway
```

### Manual/Docker
```bash
# Build
pnpm build

# Run
pnpm start
```

## 7. Cleanup & Troubleshooting

### Clear Caches
```bash
# Clear Next.js build cache
pnpm clean

# Full cleanup (all caches + node_modules)
pnpm clean:all

# Fresh setup
pnpm fresh      # or pnpm fresh:vm
```

### Common Issues

**Issue**: `Cannot find DATABASE_URL`
```bash
# Solution: Run env:check and update .env.local
pnpm env:check
```

**Issue**: Linting errors before build
```bash
# Solution: Fix issues
pnpm lint:fix
```

**Issue**: Database migration failures
```bash
# Solution: Check connection and run manually
pnpm db:studio
pnpm db:migrate
```

## 8. Production Checklist

- [ ] Node.js >= 18.18 installed
- [ ] pnpm >= 10.23.0 installed
- [ ] `.env.local` configured with all required variables
- [ ] Database connected and migrations applied
- [ ] `pnpm build` completes successfully
- [ ] `pnpm test:ci` passes (if tests exist)
- [ ] `pnpm lint` passes (fix issues with `pnpm lint:fix`)
- [ ] `pnpm deploy:check` passes
- [ ] Environment variables secured (not in git)

## 9. Performance Optimization

### Enabled by Default
✓ Turbopack (faster builds)
✓ React Compiler (automatic memoization)
✓ Source maps for production debugging
✓ Cache Components (Next.js 16)
✓ Image optimization (AVIF/WebP)

### Build Times
- Dev rebuild: ~2-3 seconds
- Full build: ~30-60 seconds (depending on VM resources)

### Database
- Connection pooling configured (Neon)
- Indexes on frequently queried fields
- Query optimization with Drizzle ORM

## 10. Monitoring & Logging

### Error Tracking (Rollbar)
- Configured in `components/providers/rollbar-provider.tsx`
- Set `NEXT_PUBLIC_ROLLBAR_ACCESS_TOKEN` in `.env.local`

### Console Logging
- Server-side: `console.error()` with context
- Client-side: Filtered by `NODE_ENV`

## Next Steps

1. **Set environment variables** in `.env.local`
2. **Connect database** and run migrations
3. **Test locally** with `pnpm dev`
4. **Run tests** to verify setup
5. **Deploy** using Vercel or Railway

---

**Updated**: November 25, 2025
**Status**: ✓ Dependencies installed, ready for configuration
