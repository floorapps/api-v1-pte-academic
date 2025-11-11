# Better Auth Quick Start Guide

Quick reference for common authentication tasks in the PTE Learning LMS.

## 🚀 Quick Setup

### 1. Environment Variables

```bash
cp .env.example .env.local
```

Add these required variables:
```bash
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-here
POSTGRES_URL=your-database-url
```

### 2. Run Migrations

```bash
npm run db:push
```

---

## 🔐 Common Tasks

### Client-Side Authentication

```typescript
import { authClient } from "@/lib/auth/auth-client";

// Sign Up
const { data, error } = await authClient.signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
});

// Sign In
await authClient.signIn.email({
  email: "user@example.com",
  password: "password123",
});

// Sign Out
await authClient.signOut();

// OAuth Sign In
await authClient.signIn.social({
  provider: "google", // or "github", "facebook", "apple"
  callbackURL: "/dashboard",
});
```

### React Hooks

```typescript
import { useSession, useAuth } from "@/lib/auth/auth-client";

// Get session data
function MyComponent() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not signed in</div>;
  
  return <div>Welcome {session.user.name}</div>;
}

// Simple auth check
function MyComponent() {
  const { user, isAuthenticated, isPending } = useAuth();
  
  if (!isAuthenticated) return <SignInButton />;
  return <UserProfile user={user} />;
}
```

### Server-Side Authentication

```typescript
import { getSession, getCurrentUser, requireAuth } from "@/lib/auth/server";

// Get session (nullable)
const session = await getSession();

// Get user (nullable)
const user = await getCurrentUser();

// Require auth (throws if not authenticated)
const user = await requireAuth();
```

### Protected Pages

```typescript
// app/dashboard/page.tsx
import { requireAuth } from "@/lib/auth/server";

export default async function DashboardPage() {
  const user = await requireAuth();
  return <div>Welcome {user.name}</div>;
}
```

### Server Actions

```typescript
"use server";
import { requireAuth } from "@/lib/auth/server";

export async function myServerAction(formData: FormData) {
  const user = await requireAuth();
  // Your logic here
}
```

---

## 🛠️ User Management

```typescript
// Update profile
await authClient.updateUser({
  name: "New Name",
  image: "https://example.com/avatar.jpg",
});

// Change password
await authClient.changePassword({
  currentPassword: "old123",
  newPassword: "new456",
  revokeOtherSessions: true, // Optional
});

// List accounts
const { data: accounts } = await authClient.listAccounts();

// Link social account
await authClient.linkSocial({
  provider: "github",
  callbackURL: "/settings",
});

// Unlink account
await authClient.unlinkAccount({
  providerId: "github",
});
```

---

## 📊 Session Management

```typescript
// List all sessions
const { data: sessions } = await authClient.listSessions();

// Revoke specific session
await authClient.revokeSession({
  token: "session_token",
});

// Revoke all other sessions
await authClient.revokeOtherSessions();

// Revoke all sessions
await authClient.revokeSessions();
```

---

## ⚠️ Error Handling

```typescript
const { data, error } = await authClient.signIn.email(
  { email, password },
  {
    onError: (ctx) => {
      console.error(ctx.error.message);
      toast.error(ctx.error.message);
    },
    onSuccess: (ctx) => {
      router.push("/dashboard");
    },
  }
);

// Check error manually
if (error) {
  console.error("Error:", error.message);
  console.error("Status:", error.status);
}
```

---

## 🔑 API Endpoints

All endpoints are under `/api/auth`:

- `POST /api/auth/sign-up/email` - Sign up with email
- `POST /api/auth/sign-in/email` - Sign in with email
- `GET /api/auth/sign-in/social?provider=google` - OAuth sign in
- `GET /api/auth/callback/{provider}` - OAuth callback
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/get-session` - Get current session
- `POST /api/auth/update-user` - Update user profile
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/list-accounts` - List user accounts
- `GET /api/auth/list-sessions` - List all sessions
- `POST /api/auth/revoke-session` - Revoke session

---

## 🎨 Example: Complete Sign In Form

```typescript
"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { data, error: authError } = await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => router.push("/dashboard"),
      }
    );

    if (authError) {
      setError(authError.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="text-red-500">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Sign In</button>
      
      {/* OAuth Buttons */}
      <button
        type="button"
        onClick={() => authClient.signIn.social({
          provider: "google",
          callbackURL: "/dashboard",
        })}
      >
        Sign in with Google
      </button>
    </form>
  );
}
```

---

## 📚 User Object Structure

```typescript
{
  id: string,
  name: string,
  email: string,
  emailVerified: boolean,
  image: string | null,
  createdAt: Date,
  updatedAt: Date,
  // Custom fields
  dailyAiCredits: number,
  aiCreditsUsed: number,
  lastCreditReset: Date,
  organizationId: string | null,
  role: string, // "student", "teacher", "admin"
}
```

---

## 🔒 Security Best Practices

1. **Always validate on server**: Don't trust client-side auth checks alone
2. **Use requireAuth for protected actions**: Throws if not authenticated
3. **Handle errors gracefully**: Show user-friendly messages
4. **Revoke sessions on password change**: Use `revokeOtherSessions: true`
5. **Use HTTPS in production**: Set `useSecureCookies: true`
6. **Keep secrets secure**: Never commit `.env.local` files

---

## 📖 Full Documentation

See [`BETTER_AUTH_API.md`](./BETTER_AUTH_API.md) for complete API reference.

---

## 🆘 Common Issues

### "Unauthorized" Error
- Check if session cookie exists
- Verify `BETTER_AUTH_SECRET` is set
- Ensure session hasn't expired

### OAuth Not Working
- Verify OAuth credentials in `.env.local`
- Check redirect URIs in OAuth provider settings
- Ensure provider is enabled in auth config

### Session Not Persisting
- Check cookie settings
- Verify `BETTER_AUTH_URL` matches your domain
- Check browser cookie settings

---

**Need Help?** Check the [full API documentation](./BETTER_AUTH_API.md)