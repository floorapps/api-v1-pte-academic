# 🎓 PTE Learning SaaS Platform

A modern, production-ready SaaS application built with Next.js 16, Better Auth, Drizzle ORM, and Neon PostgreSQL.

## ✨ Features

- 🔐 **Authentication**: Better Auth with email/password + OAuth (Google, GitHub, Facebook, Apple)
- 🗄️ **Database**: Drizzle ORM with Neon PostgreSQL (serverless, scalable)
- 🎨 **UI**: shadcn/ui + Tailwind CSS 4
- ⚡ **Performance**: Next.js 16 with optimizations for production
- 🔒 **Security**: Production-ready security headers and best practices
- 📊 **TypeScript**: Full type safety across the stack
- 🚀 **Deployment**: Optimized for Vercel deployment

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: Better Auth 1.3+
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Zustand
- **Data Fetching**: SWR
- **Type Safety**: TypeScript 5.8+
- **Package Manager**: pnpm

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Neon PostgreSQL account ([neon.tech](https://neon.tech))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd saas-starter
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your `.env.local`**
   ```env
   POSTGRES_URL=postgresql://user:pass@host.pooler.aws.neon.tech/db?sslmode=require
   BETTER_AUTH_SECRET=your-secret-key-here
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
   ```

5. **Generate auth secret**
   ```bash
   openssl rand -base64 32
   ```

6. **Set up database**
   ```bash
   # Generate migration
   pnpm db:generate
   
   # Push schema to database
   npx drizzle-kit push
   
   # Verify setup
   npx tsx scripts/verify-auth-setup.ts
   ```

7. **Run development server**
   ```bash
   pnpm dev
   ```

8. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
saas-starter/
├── app/                    # Next.js 16 App Router
│   ├── (home)/            # Home page route group
│   ├── (login)/           # Authentication pages
│   ├── (pte-academic)/    # PTE learning features
│   ├── api/               # API routes
│   │   └── auth/          # Better Auth endpoints
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── pte/              # PTE-specific components
│   └── practice/         # Practice session components
├── lib/                   # Core application logic
│   ├── auth/             # Better Auth configuration
│   ├── db/               # Database & ORM
│   │   ├── schema.ts     # Drizzle schema definitions
│   │   ├── drizzle.ts    # Database connection
│   │   └── migrations/   # Database migrations
│   ├── hooks/            # Custom React hooks
│   └── pte/              # PTE business logic
├── public/               # Static assets
├── scripts/              # Utility scripts
├── .env.example          # Environment template
├── drizzle.config.ts     # Drizzle Kit configuration
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
├── vercel.json           # Vercel deployment config
└── package.json          # Project dependencies
```

## 🗄️ Database Management

### Available Commands

```bash
# Generate migrations from schema changes
pnpm db:generate

# Push schema to database
npx drizzle-kit push

# Open Drizzle Studio (visual database browser)
pnpm db:studio

# Run migrations
pnpm db:migrate

# Verify database setup
npx tsx scripts/verify-auth-setup.ts

# Drop all tables (DANGER!)
npx tsx scripts/dangerously-drop-all-tables.ts
```

### Database Schema

Core tables managed by Better Auth + custom extensions:

- **users** - User accounts with custom fields (credits, organization)
- **sessions** - Active user sessions
- **accounts** - OAuth provider accounts + email/password
- **verifications** - Email verification tokens
- **organizations** - Multi-tenancy support (custom)

## 🔐 Authentication

### Email/Password Sign Up

```typescript
import { signUp } from '@/lib/auth/auth-client';

const result = await signUp.email({
  email: 'user@example.com',
  password: 'securePassword123',
  name: 'John Doe',
});
```

### OAuth Sign In

```typescript
import { signIn } from '@/lib/auth/auth-client';

// Google
await signIn.social({ provider: 'google' });

// GitHub
await signIn.social({ provider: 'github' });
```

### Get Current Session

```typescript
import { useSession } from '@/lib/auth/auth-client';

export default function Profile() {
  const { data: session } = useSession();
  
  if (!session) return <div>Not logged in</div>;
  
  return <div>Welcome, {session.user.name}!</div>;
}
```

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com/) and customizable:

```bash
# Add new components
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add card
```

Components available:
- Buttons, Cards, Dialogs
- Forms, Inputs, Labels
- Tables, Tabs, Tooltips
- Dropdowns, Selects, Progress bars
- And many more...

## 🚀 Production Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy!

3. **Configure Environment Variables**
   Add these in Vercel Dashboard → Settings → Environment Variables:
   ```
   POSTGRES_URL=your-neon-pooled-connection-string
   BETTER_AUTH_SECRET=your-generated-secret
   BETTER_AUTH_URL=https://your-app.vercel.app
   NEXT_PUBLIC_BETTER_AUTH_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```

4. **Update OAuth Redirect URIs**
   Add production callback URLs in OAuth provider settings:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   https://your-app.vercel.app/api/auth/callback/github
   ```

📚 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide**

## 🛠️ Development Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues

# Database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
pnpm db:seed          # Seed database (if configured)

# Utilities
pnpm clean            # Clear caches
pnpm clean:all        # Clean everything & reinstall
pnpm fresh            # Clean cache & restart dev
```

## 📊 Performance Optimizations

### Implemented Optimizations

✅ **Bundle Size Reduction**
- Tree shaking enabled
- Package import optimization
- Dynamic imports for heavy components

✅ **Caching Strategy**
- Static asset caching (1 year)
- API response caching (60s + SWR)
- Image optimization (AVIF/WebP)

✅ **Database Performance**
- Connection pooling (max 10 connections)
- Optimized queries with Drizzle
- Proper indexing on frequently queried fields

✅ **Security Headers**
- CSP (Content Security Policy)
- HSTS (Strict Transport Security)
- X-Frame-Options, X-Content-Type-Options
- Referrer Policy, Permissions Policy

## 🔧 Configuration Files

### Next.js (`next.config.ts`)
- Production optimizations
- Security headers
- Image optimization
- Webpack customization

### TypeScript (`tsconfig.json`)
- Strict mode enabled
- Path aliases configured
- Production-ready settings

### Drizzle (`drizzle.config.ts`)
- PostgreSQL dialect
- Migration management
- Schema location

## 🐛 Troubleshooting

### Common Issues

**Database connection failed**
```bash
# Check your POSTGRES_URL
echo $POSTGRES_URL

# Verify with test script
pnpm db:test
```

**Build errors**
```bash
# Clear cache and rebuild
pnpm clean
pnpm build
```

**OAuth not working**
- Verify redirect URIs match exactly
- Check OAuth credentials in environment
- Ensure HTTPS in production

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete production deployment guide
- [Migration Guide](./MIGRATION_GUIDE.md) - Database migration strategies
- [Environment Variables](./.env.example) - All environment variables explained

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Better Auth](https://www.better-auth.com/) - Authentication library
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## 🔗 Useful Links

- [Live Demo](https://your-app.vercel.app) (Update with your URL)
- [Documentation](https://your-docs-site.com)
- [Issue Tracker](https://github.com/your-username/your-repo/issues)

---

Made with ❤️ using Next.js 16 and Better Auth