# 🚀 Production Deployment - Quick Start Guide

## What Was Done

Your PTE Academic platform is now production-ready with the following improvements:

### ✅ Configuration Files Created
1. **DEPLOYMENT.md** - Comprehensive deployment guide
2. **.env.production.example** - Production environment template
3. **railway.json** & **railway.toml** - Railway deployment configuration
4. **middleware.ts** - Security middleware (blocks seed routes in production)

### ✅ Scripts Added
1. **scripts/pre-deploy-check.ts** - Pre-deployment checklist
2. **scripts/test-apis.ts** - API endpoint testing
3. **Package.json scripts**:
   - `pnpm deploy:check` - Run pre-deployment checks
   - `pnpm deploy:test` - Test all APIs
   - `pnpm deploy:vercel` - Deploy to Vercel
   - `pnpm deploy:railway` - Deploy to Railway

### ✅ Security Enhancements
- Middleware blocks `/seed` routes in production
- Security headers configured
- Environment validation
- API rate limiting already in place

### ✅ Existing Features (Already Configured)
- ✓ Database connection pooling (Drizzle ORM)
- ✓ API rate limiting (60 requests/hour on attempts)
- ✓ Better Auth for authentication
- ✓ Vercel Blob for file uploads
- ✓ OpenAI & Gemini AI integration
- ✓ Error handling on all routes
- ✓ TypeScript strict mode
- ✓ Next.js 16 with React Compiler

## 🎯 Deployment Steps

### Option 1: Deploy to Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Run pre-deployment checks
pnpm deploy:check

# 3. Login and deploy
vercel login
vercel --prod

# 4. Set environment variables in Vercel Dashboard
# Go to: Settings > Environment Variables
# Add all variables from .env.production.example
```

### Option 2: Deploy to Railway

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Run pre-deployment checks
pnpm deploy:check

# 3. Login and initialize
railway login
railway init

# 4. Add PostgreSQL database
railway add postgresql

# 5. Set environment variables
railway variables set DATABASE_URL=...
railway variables set OPENAI_API_KEY=...
# ... set all others from .env.production.example

# 6. Deploy
railway up
```

## 📋 Required Environment Variables

### Critical (Must Have)
```bash
DATABASE_URL=postgresql://...           # PostgreSQL connection
OPENAI_API_KEY=sk-...                  # OpenAI API key
VERCEL_BLOB_READ_WRITE_TOKEN=...       # File uploads
BETTER_AUTH_SECRET=...                 # Auth secret (32+ chars)
BETTER_AUTH_URL=https://your-domain.com
```

### Optional (Recommended)
```bash
GOOGLE_GENERATIVE_AI_API_KEY=...       # Gemini AI (fallback)
AI_TRANSCRIBE_PROVIDER=openai          # Enable transcription
GOOGLE_CLIENT_ID=...                   # Google OAuth
GITHUB_CLIENT_ID=...                   # GitHub OAuth
```

See `.env.production.example` for complete list.

## 🔧 Database Setup

### 1. Create PostgreSQL Database
Choose one:
- **Neon** (https://neon.tech) - Free tier, serverless
- **Railway** (automatic when adding PostgreSQL)
- **Supabase** (https://supabase.com) - Free tier
- **Your own PostgreSQL**

### 2. Run Migrations
```bash
# Set DATABASE_URL in .env.production
pnpm db:migrate
```

### 3. Seed Initial Data (Optional)
```bash
# ONLY run once, ONLY in empty database
pnpm db:seed:all
```

⚠️ **Warning**: Do NOT run seed scripts if you have existing user data!

## 🧪 Testing

### Test Locally First
```bash
# 1. Build for production
pnpm build

# 2. Start production server
pnpm start

# 3. Test APIs (in another terminal)
pnpm deploy:test

# 4. Visit http://localhost:3000
```

### Test After Deployment
```bash
# Test production APIs
pnpm tsx scripts/test-apis.ts --production https://your-domain.com
```

## 📊 API Endpoints Summary

### Public (No Auth)
- `GET /api/health` - Health check
- `GET /api/speaking/questions` - List questions
- `GET /api/writing/questions`
- `GET /api/reading/questions`
- `GET /api/listening/questions`

### Protected (Auth Required)
- `POST /api/speaking/attempts` - Submit attempt
- `POST /api/writing/attempts`
- `POST /api/reading/attempts`
- `POST /api/listening/attempts`
- `GET /api/user` - Current user
- `PATCH /api/user/profile` - Update profile
- `POST /api/uploads/audio` - Upload audio

### Disabled in Production
- `/api/seed-all` (blocked by middleware)
- `/api/speaking/seed`
- `/api/writing/seed`
- `/api/reading/seed`
- `/api/listening/seed`

## 🔒 Security Checklist

- [x] Seed routes disabled in production (middleware)
- [x] Environment variables not in code
- [x] Security headers configured
- [x] HTTPS enforced (automatic on Vercel/Railway)
- [x] API rate limiting enabled
- [x] SQL injection protected (Drizzle ORM)
- [ ] Set BETTER_AUTH_SECRET (you must do this)
- [ ] Configure OAuth providers (optional)

## 📈 Monitoring

### Health Check
```bash
curl https://your-domain.com/api/health
```

### Recommended Services
- **Uptime**: UptimeRobot (free)
- **Analytics**: Vercel Analytics (included)
- **Errors**: Sentry (optional)
- **Logs**: Vercel/Railway dashboard

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
pnpm clean
pnpm build
```

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL

# Check SSL mode
# DATABASE_URL should end with ?sslmode=require
```

### API Returns 500
```bash
# Check logs
vercel logs              # Vercel
railway logs             # Railway

# Check environment variables are set
```

### Seed Routes Accessible
```bash
# Should return 404 in production
curl https://your-domain.com/api/seed-all

# If not, check:
# 1. NODE_ENV=production is set
# 2. middleware.ts exists
# 3. Redeploy
```

## 💰 Cost Estimation

### Vercel
- **Hobby**: Free (limited)
- **Pro**: $20/month
- **Blob Storage**: ~$0.15/GB
- **Estimated**: $25-50/month

### Railway
- **Hobby**: $5/month
- **PostgreSQL**: $5-20/month
- **Estimated**: $10-30/month

### External Services
- **OpenAI API**: ~$10-50/month (usage-based)
- **Neon DB**: Free tier available

## 🎉 You're Ready!

Run these commands in order:

```bash
# 1. Pre-deployment check
pnpm deploy:check

# 2. Build
pnpm build

# 3. Test locally
pnpm start

# 4. Deploy (choose one)
pnpm deploy:vercel    # For Vercel
pnpm deploy:railway   # For Railway
```

## 📚 Documentation

- Full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Environment template: [.env.production.example](./.env.production.example)
- API tests: [scripts/test-apis.ts](./scripts/test-apis.ts)
- Pre-deploy check: [scripts/pre-deploy-check.ts](./scripts/pre-deploy-check.ts)

## 🆘 Need Help?

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
2. Run `pnpm deploy:check` to diagnose issues
3. Check Vercel/Railway logs for errors
4. Verify all environment variables are set

---

**Next Steps**:
1. ✅ Set up your database
2. ✅ Configure environment variables
3. ✅ Run migrations
4. ✅ Deploy!

Good luck! 🚀
