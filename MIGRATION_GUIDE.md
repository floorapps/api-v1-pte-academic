# Migration Guide: Next.js 16 + Better Auth

## Overview
This project has been migrated to Next.js 16 with Better Auth for authentication, replacing the custom JWT-based auth system.

## Key Changes

### 1. Next.js 16 Async Request APIs
All Request APIs are now async in Next.js 16:
- `cookies()` → `await cookies()`
- `headers()` → `await headers()`
- `params` prop → now async

### 2. Better Auth Integration

#### New Files Created:
- `lib/auth/auth.ts` - Better Auth configuration
- `lib/auth/auth-client.ts` - Client-side auth utilities
- `lib/auth/server.ts` - Server-side auth utilities (async-compatible)
- `lib/auth/actions.ts` - Auth actions (sign in, sign up, sign out)
- `lib/auth/user-actions.ts` - User management actions
- `middleware.ts` - Route protection middleware

#### Updated Files:
- `lib/db/queries.ts` - Now uses Better Auth sessions
- `app/api/auth/[...all]/route.ts` - Better Auth API routes

### 3. Authentication Flow

#### Sign In
```typescript
import { signInAction } from '@/lib/auth/actions';

// In your component
const [state, formAction] = useActionState(signInAction, null);

<form action={formAction}>
  <input name="email" type="email" required />
  <input name="password" type="password" required />
  <button type="submit">Sign In</button>
</form>
```

#### Sign Up
```typescript
import { signUpAction } from '@/lib/auth/actions';

// In your component
const [state, formAction] = useActionState(signUpAction, null);

<form action={formAction}>
  <input name="email" type="email" required />
  <input name="password" type="password" required />
  <input name="name" type="text" />
  <button type="submit">Sign Up</button>
</form>
```

#### Sign Out
```typescript
import { signOutAction } from '@/lib/auth/actions';

// In your component
<form action={signOutAction}>
  <button type="submit">Sign Out</button>
</form>
```

#### Get Current User (Server)
```typescript
import { getCurrentUser, getSession } from '@/lib/auth/server';

export default async function Page() {
  const user = await getCurrentUser();
  const session = await getSession();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  return <div>Welcome {user.name}</div>;
}
```

#### Use Session (Client)
```typescript
'use client';

import { useSession } from '@/lib/auth/auth-client';

export function UserProfile() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not signed in</div>;
  
  return <div>Hello {session.user.name}</div>;
}
```

### 4. Middleware Protection

Routes are now protected by middleware:

**Protected routes:**
- `/dashboard/*`
- `/practice/*`
- `/mock-tests/*`
- `/templates/*`
- `/study/*`

**Auth routes** (redirect to dashboard if authenticated):
- `/sign-in`
- `/sign-up`

### 5. Database Schema

Better Auth uses the existing `users`, `sessions`, and `accounts` tables from your schema. Make sure to run migrations if needed:

```bash
pnpm db:generate
pnpm db:migrate
```

### 6. Environment Variables

Required environment variables:

```env
# Database (Primary)
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require&channel_binding=require"

# Optional: Uncomment for direct connection (non-pooled)
# DATABASE_URL_UNPOOLED="postgresql://username:password@host:port/database?sslmode=require&channel_binding=require"

# Fallback: POSTGRES_URL is also supported for compatibility
# POSTGRES_URL=your_postgres_url

# Better Auth
AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Optional: Social Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret
```

### 7. User Management Actions

All user management actions have been updated:

```typescript
import { 
  updateAccount,
  updatePassword,
  deleteAccount,
  removeTeamMember,
  inviteTeamMember 
} from '@/lib/auth/user-actions';
```

### 8. Removed Files (Old Auth System)

The following files are deprecated but kept for reference:
- `lib/auth/session.ts` - Old JWT-based session management
- `lib/auth/middleware.ts` - Old validation middleware
- `app/(login)/actions.ts` - Old auth actions

**Note:** You can safely remove these files after verifying the new system works.

## Testing the Migration

### 1. Start the Development Server
```bash
pnpm dev
```

### 2. Test Authentication Flow
1. Visit http://localhost:3000/sign-up
2. Create a new account
3. Verify redirect to dashboard
4. Sign out
5. Sign in again
6. Test protected routes

### 3. Test User Management
1. Update account details
2. Change password
3. Invite team members
4. Remove team members

## Troubleshooting

### Issue: "User not found" after migration
**Solution:** Run database migrations to ensure Better Auth tables are properly set up:
```bash
pnpm db:generate
pnpm db:migrate
```

### Issue: Redirect loops
**Solution:** Clear cookies and local storage, then try again.

### Issue: TypeScript errors
**Solution:** Ensure all imports are updated to use new auth utilities:
- `getUser()` from `@/lib/db/queries`
- `getCurrentUser()` from `@/lib/auth/server`
- `useSession()` from `@/lib/auth/auth-client`

## Next Steps

1. Update all login/signup forms to use new actions
2. Replace `getUser()` calls with `getCurrentUser()` where appropriate
3. Test all protected routes
4. Remove deprecated auth files after verification
5. Update any custom middleware logic
6. Test social provider auth (Google, Apple) if configured

## Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-16)
