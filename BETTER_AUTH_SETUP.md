# Better Auth Setup Guide

## ✅ Completed Steps

1. ✅ Installed Better Auth (`pnpm add better-auth`)
2. ✅ Created Better Auth instance at `lib/auth/auth.ts`
3. ✅ Created API route handler at `app/api/auth/[...all]/route.ts`
4. ✅ Created auth client at `lib/auth/auth-client.ts`
5. ✅ Created login form component with OAuth support
6. ✅ Created signup form component with OAuth support
7. ✅ Updated sign-in and sign-up pages

## 🔧 Required Configuration

### 1. Generate Auth Secret

Run this command to generate a secure auth secret:

```bash
openssl rand -base64 32
```

Then update `.env.local` with the generated secret:

```env
BETTER_AUTH_SECRET=your_generated_secret_here
```

### 2. Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URI:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy **Client ID** and **Client Secret** to `.env.local`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Setup Apple OAuth

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Go to **Certificates, Identifiers & Profiles**
3. Create a new **Services ID** for Sign in with Apple
4. Configure **Return URLs**:
   - Development: `http://localhost:3000/api/auth/callback/apple`
   - Production: `https://yourdomain.com/api/auth/callback/apple`
5. Generate and download your Apple OAuth key
6. Update `.env.local`:

```env
APPLE_CLIENT_ID=your_apple_service_id
APPLE_CLIENT_SECRET=your_apple_client_secret
```

### 4. Update Database Schema

You need to add Better Auth tables to your database. Run:

```bash
pnpm db:generate
pnpm db:migrate
```

Or manually add these tables to your schema:

#### Required Tables:

**sessions** table:
- id (uuid, primary key)
- userId (uuid, foreign key to users.id)
- expiresAt (timestamp)
- ipAddress (varchar)
- userAgent (text)
- createdAt (timestamp)
- updatedAt (timestamp)

**accounts** table:
- id (uuid, primary key)
- userId (uuid, foreign key to users.id)
- accountId (text)
- providerId (varchar)
- accessToken (text)
- refreshToken (text)
- idToken (text)
- expiresAt (timestamp)
- password (text)
- createdAt (timestamp)
- updatedAt (timestamp)

**verifications** table:
- id (uuid, primary key)
- identifier (varchar)
- value (text)
- expiresAt (timestamp)
- createdAt (timestamp)
- updatedAt (timestamp)

#### Update users table:

Add these fields to your existing `users` table:
- emailVerified (timestamp, nullable)
- image (text, nullable)

Remove these fields (handled by accounts table):
- passwordHash (moved to accounts.password)

## 🚀 Usage

### Sign Up with Email/Password

```tsx
import { authClient } from "@/lib/auth/auth-client";

const { data, error } = await authClient.signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
});
```

### Sign In with Email/Password

```tsx
const { data, error } = await authClient.signIn.email({
  email: "user@example.com",
  password: "password123",
});
```

### Sign In with OAuth (Google/Apple)

```tsx
// Google
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
});

// Apple
await authClient.signIn.social({
  provider: "apple",
  callbackURL: "/dashboard",
});
```

### Get Current Session

```tsx
"use client";

import { useSession } from "@/lib/auth/auth-client";

export function MyComponent() {
  const { data: session, isPending, error } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!session) return <div>Not logged in</div>;

  return <div>Welcome, {session.user.name}!</div>;
}
```

### Sign Out

```tsx
import { authClient } from "@/lib/auth/auth-client";

await authClient.signOut();
```

## 📝 Features Included

✅ Email/Password authentication
✅ Google OAuth integration
✅ Apple OAuth integration
✅ Session management
✅ Protected routes
✅ User registration
✅ Login/Signup forms with validation
✅ Error handling
✅ Loading states
✅ Responsive design

## 🔒 Security Notes

- All cookies are `httpOnly` and `secure` in production
- Passwords are hashed with bcrypt
- Session tokens use JWT
- CSRF protection included
- Secure OAuth flows

## 📚 Next Steps

1. **Generate auth secret** and update `.env.local`
2. **Setup OAuth providers** (Google & Apple)
3. **Run database migrations** to add required tables
4. **Test authentication** flows
5. **Customize** forms and UI as needed
6. **Add email verification** (optional)
7. **Configure** password reset (optional)

## 🆘 Troubleshooting

### "Cannot find module" error
Make sure Better Auth is installed: `pnpm add better-auth`

### OAuth redirect errors
- Check your callback URLs match exactly
- Ensure OAuth providers are configured in `.env.local`
- Verify redirect URIs in OAuth provider settings

### Database connection errors
- Verify `POSTGRES_URL` is set correctly
- Ensure database is running
- Check if migrations have been applied

### Session not persisting
- Check if `BETTER_AUTH_SECRET` is set
- Verify cookies are enabled in browser
- Check `BETTER_AUTH_URL` matches your domain

## 📖 Documentation

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Google OAuth Setup](https://console.cloud.google.com/)
- [Apple Sign In Setup](https://developer.apple.com/sign-in-with-apple/)
