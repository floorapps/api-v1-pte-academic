# Database Setup Guide

## Quick Start

1. **Configure your database connection**
   
   Copy `.env.example` to `.env.local` and update the `POSTGRES_URL`:

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your PostgreSQL connection string:
   ```
   POSTGRES_URL=postgresql://username:password@host:port/database?sslmode=require
   ```

2. **Test the connection**

   ```bash
   pnpm db:test
   ```

3. **Generate and run migrations**

   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

4. **Seed the database (optional)**

   ```bash
   pnpm db:seed
   ```

5. **Open Drizzle Studio (optional)**

   ```bash
   pnpm db:studio
   ```

## Database Providers

You can use any PostgreSQL provider:

- [Neon](https://neon.tech) - Serverless Postgres
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [Railway](https://railway.app) - Deploy databases easily
- [Vercel Postgres](https://vercel.com/storage/postgres) - Postgres on Vercel
- Local PostgreSQL instance

## Connection Configuration

The database connection is configured in:
- `lib/db/drizzle.ts` - Main database client
- `drizzle.config.ts` - Drizzle Kit configuration

Both files read from `.env.local` automatically.

## Troubleshooting

### Connection fails with SSL error
Make sure your connection string includes `sslmode=require` if your provider requires SSL:
```
POSTGRES_URL=postgresql://user:pass@host/db?sslmode=require
```

### Environment variable not found
Ensure you're using `.env.local` (not `.env`) and that `POSTGRES_URL` is defined.
