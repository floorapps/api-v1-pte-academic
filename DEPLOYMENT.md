# 🚀 Production Deployment Guide for Vercel

Complete guide to deploy your Next.js 16 app with Better Auth + Drizzle ORM + Neon DB on Vercel.

---

## 📋 Pre-Deployment Checklist

### 1. **Environment Variables**
Before deploying, ensure you have:

- ✅ Neon PostgreSQL database URL (with pooling enabled)
- ✅ Better Auth secret key (minimum 32 characters)
- ✅ OAuth provider credentials (if using social login)
- ✅ Production domain URL

### 2. **Database Setup**
```bash
# Generate a new migration if schema changed
pnpm db:generate

# Push schema to production database
npx drizzle-kit push
```

### 3. **Build Test**
```bash
# Test production build locally
pnpm build
pnpm start
```

### 4. **Generate Better Auth Secret**
```bash
# Generate a secure secret
openssl rand -base64 32
```

---

## 🔧 Vercel Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select "Next.js" as framework preset
   - Configure project settings

3. **Add Environment Variables**
   In Vercel Dashboard → Settings → Environment Variables:
   
   ```env
   # Required
   POSTGRES_URL=postgresql://user:pass@host.pooler.aws.neon.tech/db?sslmode=require
   BETTER_AUTH_SECRET=your-generated-secret-key
   BETTER_AUTH_URL=https://your-app.vercel.app
   NEXT_PUBLIC_BETTER_AUTH_URL=https://your-app.vercel.app
   NODE_ENV=production
   
   # Optional OAuth (if using)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts to configure
```

---

## 🔐 OAuth Redirect URI Configuration

After deployment, update OAuth provider settings:

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client
4. Add authorized redirect URI:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Edit your OAuth App
3. Update "Authorization callback URL":
   ```
   https://your-app.vercel.app/api/auth/callback/github
   ```

### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/apps)
2. Settings → Basic → Add Platform → Website
3. Add redirect URI:
   ```
   https://your-app.vercel.app/api/auth/callback/facebook
   ```

---

## 🗄️ Database Migration Strategy

### Initial Production Setup
```bash
# 1. Drop all tables (DANGEROUS - only for fresh start)
npx tsx scripts/dangerously-drop-all-tables.ts

# 2. Push schema to production
npx drizzle-kit push

# 3. Verify setup
npx tsx scripts/verify-auth-setup.ts
```

### Future Schema Updates
```bash
# 1. Generate migration
pnpm db:generate

# 2. Review migration file in lib/db/migrations/

# 3. Push to production
npx drizzle-kit push
```

---

## 📊 Post-Deployment Verification

### 1. **Test Authentication**
- Visit your production URL
- Test sign-up with email/password
- Test OAuth providers
- Verify session management

### 2. **Check Database**
```bash
# Run Drizzle Studio
pnpm db:studio
```

### 3. **Monitor Logs**
- Check Vercel deployment logs
- Monitor error tracking (if configured)
- Review database connection pool usage

### 4. **Performance Check**
- Test page load speeds
- Check Lighthouse scores
- Monitor Core Web Vitals

---

## 🏗️ Project Structure

```
saas-starter/
├── app/                    # Next.js 16 App Router
│   ├── (home)/            # Home page group
│   ├── (login)/           # Auth pages group
│   ├── (pte-academic)/    # PTE features
│   ├── api/               # API routes
│   │   └── auth/          # Better Auth endpoints
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── pte/              # PTE-specific components
│   └── practice/         # Practice components
├── lib/                   # Core business logic
│   ├── auth/             # Better Auth config
│   │   ├── auth.ts       # Auth instance
│   │   └── auth-client.ts # Client hooks
│   ├── db/               # Database layer
│   │   ├── schema.ts     # Drizzle schema
│   │   ├── drizzle.ts    # DB connection
│   │   └── migrations/   # Migration files
│   ├── hooks/            # Custom React hooks
│   └── pte/              # PTE business logic
├── public/               # Static assets
├── scripts/              # Utility scripts
│   ├── migrate.ts        # Migration runner
│   └── verify-auth-setup.ts # Setup verification
├── .env.example          # Environment template
├── .env.local            # Local environment (gitignored)
├── drizzle.config.ts     # Drizzle Kit config
├── next.config.ts        # Next.js config
├── tsconfig.json         # TypeScript config
├── vercel.json           # Vercel deployment config
└── package.json          # Dependencies
```

---

## 🚨 Troubleshooting

### Build Failures

**Error: "Module not found"**
```bash
# Clear cache and rebuild
pnpm clean
pnpm install
pnpm build
```

**Error: "TypeScript errors"**
```bash
# Fix TypeScript issues
pnpm lint:fix
# Or temporarily bypass (not recommended)
# Set typescript.ignoreBuildErrors: true in next.config.ts
```

### Database Issues

**Error: "Cannot connect to database"**
- Verify `POSTGRES_URL` in Vercel environment variables
- Ensure using **pooled** connection string from Neon
- Check Neon dashboard for connection issues

**Error: "Table does not exist"**
```bash
# Push schema to database
npx drizzle-kit push
```

### Authentication Issues

**OAuth redirect fails**
- Verify redirect URIs in OAuth provider settings
- Ensure `BETTER_AUTH_URL` matches your production domain
- Check that OAuth credentials are correct

**Session not persisting**
- Verify `BETTER_AUTH_SECRET` is set correctly
- Check cookie settings in browser
- Ensure HTTPS is enabled (required for secure cookies)

### Performance Issues

**Slow database queries**
- Enable Neon connection pooling
- Review and optimize database queries
- Consider adding database indexes

**Large bundle size**
```bash
# Analyze bundle
npm i -g @next/bundle-analyzer
ANALYZE=true pnpm build
```

---

## 📈 Optimization Tips

### 1. **Enable Caching**
- Use Next.js `revalidate` for ISR
- Implement SWR for client-side caching
- Enable Vercel Edge Caching

### 2. **Image Optimization**
```tsx
import Image from 'next/image';

<Image
  src="/image.jpg"
  width={800}
  height={600}
  alt="Description"
  priority // For above-the-fold images
/>
```

### 3. **Code Splitting**
```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  ssr: false,
  loading: () => <p>Loading...</p>
});
```

### 4. **Database Connection Pooling**
Already configured in [`lib/db/drizzle.ts`](lib/db/drizzle.ts:18):
```typescript
export const client = postgres(process.env.POSTGRES_URL, {
  ssl: true,
  max: 10,        // Maximum pool size
  idle_timeout: 20,
  connect_timeout: 10,
});
```

---

## 🔄 Continuous Deployment

### Automatic Deployments
- Pushes to `main` branch automatically deploy to production
- Pull requests create preview deployments
- Configure branch-specific environment variables

### Preview Deployments
```bash
# Deploy preview
vercel

# Deploy to production
vercel --prod
```

---

## 📝 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `POSTGRES_URL` | ✅ Yes | Neon DB connection string (pooled) | `postgresql://user:pass@host.pooler...` |
| `BETTER_AUTH_SECRET` | ✅ Yes | Secret key (32+ chars) | Generated via `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | ✅ Yes | Production URL | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | ✅ Yes | Public URL for client | Same as BETTER_AUTH_URL |
| `NODE_ENV` | ✅ Yes | Environment | `production` |
| `GOOGLE_CLIENT_ID` | ❌ No | Google OAuth ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | ❌ No | Google OAuth secret | From Google Cloud Console |
| `GITHUB_CLIENT_ID` | ❌ No | GitHub OAuth ID | From GitHub Developer Settings |
| `GITHUB_CLIENT_SECRET` | ❌ No | GitHub OAuth secret | From GitHub Developer Settings |

---

## 🎯 Production Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured in Vercel
- [ ] OAuth redirect URIs updated
- [ ] Production build tested locally
- [ ] HTTPS enabled
- [ ] Custom domain configured (optional)
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Analytics configured
- [ ] Performance monitoring enabled
- [ ] Backup strategy in place
- [ ] Documentation updated

---

## 📞 Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Better Auth Documentation](https://www.better-auth.com)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Neon Documentation](https://neon.tech/docs)

---

## 🎉 Deployment Complete!

Your app is now live on Vercel with:
- ✅ Next.js 16 optimizations
- ✅ Better Auth authentication
- ✅ Drizzle ORM + Neon PostgreSQL
- ✅ Production-ready configuration
- ✅ Security headers
- ✅ Performance optimizations

**Next Steps:**
1. Monitor your app's performance
2. Set up error tracking
3. Configure analytics
4. Plan your backup strategy
5. Scale as needed

Good luck with your production deployment! 🚀