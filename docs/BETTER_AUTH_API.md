# Better Auth API Documentation

Complete API reference for the PTE Learning LMS authentication system powered by Better Auth.

## Table of Contents

- [Overview](#overview)
- [Configuration](#configuration)
- [Client API](#client-api)
- [Server API](#server-api)
- [Authentication](#authentication)
- [Session Management](#session-management)
- [User Management](#user-management)
- [OAuth Providers](#oauth-providers)
- [Database Schema](#database-schema)
- [Type Definitions](#type-definitions)
- [Error Handling](#error-handling)

---

## Overview

This application uses [Better Auth](https://www.better-auth.com/) for authentication and session management. Better Auth provides a type-safe, flexible authentication system with built-in support for:

- Email/password authentication
- OAuth providers (Google, GitHub, Facebook, Apple)
- Session management with cookie caching
- Type-safe API endpoints
- Next.js integration

**Base URL**: `/api/auth`

**Authentication Methods**:
- Email & Password
- Google OAuth
- GitHub OAuth
- Facebook OAuth
- Apple OAuth

---

## Configuration

### Environment Variables

```bash
# Required
BETTER_AUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-app.vercel.app
BETTER_AUTH_SECRET=your-secret-key-minimum-32-characters-long

# Database (use pooled connection for serverless)
POSTGRES_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
```

### Better Auth Instance

Located in [`lib/auth/auth.ts`](../lib/auth/auth.ts):

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  appName: "PTE Learning LMS",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: users, account: accounts, session: sessions, verification: verifications },
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: { /* config */ },
    github: { /* config */ },
    facebook: { /* config */ },
    apple: { /* config */ },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  plugins: [nextCookies()],
});
```

---

## Client API

### Installation

```typescript
import { authClient } from "@/lib/auth/auth-client";
```

### Authentication Methods

#### Sign Up with Email

```typescript
const { data, error } = await authClient.signUp.email({
  email: "user@example.com",
  password: "securePassword123",
  name: "John Doe",
});

// Response
{
  data: {
    user: {
      id: "user_123",
      email: "user@example.com",
      name: "John Doe",
      emailVerified: false,
      image: null,
      createdAt: Date,
      updatedAt: Date,
      // Custom fields
      dailyAiCredits: 4,
      aiCreditsUsed: 0,
      lastCreditReset: Date,
      organizationId: null,
      role: "student"
    },
    session: {
      id: "session_123",
      userId: "user_123",
      expiresAt: Date,
      token: "...",
      ipAddress: "127.0.0.1",
      userAgent: "...",
    }
  },
  error: null
}
```

#### Sign In with Email

```typescript
const { data, error } = await authClient.signIn.email({
  email: "user@example.com",
  password: "securePassword123",
});

// Response structure same as sign up
```

#### Sign In with OAuth

```typescript
// Redirects to OAuth provider
await authClient.signIn.social({
  provider: "google", // or "github", "facebook", "apple"
  callbackURL: "/dashboard", // Optional redirect after auth
});
```

#### Sign Out

```typescript
const { data, error } = await authClient.signOut();

// Response
{
  data: { success: true },
  error: null
}
```

### Session Hooks

#### useSession

React hook for reactive session access:

```typescript
import { useSession } from "@/lib/auth/auth-client";

function UserProfile() {
  const { data: session, isPending, error, refetch } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!session) return <div>Not authenticated</div>;

  return (
    <div>
      <h1>Welcome {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
      <p>AI Credits: {session.user.dailyAiCredits}</p>
      <button onClick={() => refetch()}>Refresh Session</button>
    </div>
  );
}
```

#### useAuth

Custom authentication hook:

```typescript
import { useAuth } from "@/lib/auth/auth-client";

function ProtectedComponent() {
  const { user, isAuthenticated, isPending } = useAuth();

  if (isPending) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return <div>Welcome {user.name}</div>;
}
```

### User Management

#### Update User Profile

```typescript
const { data, error } = await authClient.updateUser({
  name: "Jane Doe",
  image: "https://example.com/avatar.jpg",
});

// Response
{
  data: {
    id: "user_123",
    name: "Jane Doe",
    image: "https://example.com/avatar.jpg",
    // ... other user fields
  },
  error: null
}
```

#### Change Password

```typescript
const { data, error } = await authClient.changePassword({
  currentPassword: "oldPassword123",
  newPassword: "newPassword456",
  revokeOtherSessions: true, // Optional: sign out all other sessions
});

// Response
{
  data: { success: true },
  error: null
}
```

#### List User Accounts

```typescript
const { data, error } = await authClient.listAccounts();

// Response
{
  data: [
    {
      id: "account_123",
      providerId: "credential",
      accountId: "user@example.com",
      userId: "user_123",
      createdAt: Date,
    },
    {
      id: "account_456",
      providerId: "google",
      accountId: "google_user_id",
      userId: "user_123",
      accessToken: "...",
      refreshToken: "...",
      createdAt: Date,
    }
  ],
  error: null
}
```

#### Link Social Account

```typescript
const { data, error } = await authClient.linkSocial({
  provider: "github",
  callbackURL: "/settings/accounts",
});
```

#### Unlink Account

```typescript
const { data, error } = await authClient.unlinkAccount({
  providerId: "github",
});
```

### Session Management

#### Get Session

```typescript
const { data, error } = await authClient.getSession();

// Response
{
  data: {
    session: { /* session object */ },
    user: { /* user object */ }
  },
  error: null
}
```

#### List All Sessions

```typescript
const { data, error } = await authClient.listSessions();

// Response
{
  data: [
    {
      id: "session_123",
      token: "...",
      userId: "user_123",
      expiresAt: Date,
      ipAddress: "127.0.0.1",
      userAgent: "Chrome/...",
      createdAt: Date,
    }
  ],
  error: null
}
```

#### Revoke Session

```typescript
const { data, error } = await authClient.revokeSession({
  token: "session_token_to_revoke",
});
```

#### Revoke Other Sessions

```typescript
const { data, error } = await authClient.revokeOtherSessions();
```

#### Revoke All Sessions

```typescript
const { data, error } = await authClient.revokeSessions();
```

### Fetch Options

All client methods accept fetch options:

```typescript
await authClient.signIn.email(
  {
    email: "user@example.com",
    password: "password",
  },
  {
    onSuccess: (ctx) => {
      console.log("Sign in successful!", ctx.data);
      // Redirect or update UI
    },
    onError: (ctx) => {
      console.error("Sign in failed:", ctx.error.message);
      // Show error message
    },
    onResponse: (ctx) => {
      console.log("Response received");
    },
  }
);
```

---

## Server API

### Server-Side Session Management

Located in [`lib/auth/server.ts`](../lib/auth/server.ts):

#### getSession

```typescript
import { getSession } from "@/lib/auth/server";

// In Server Component or API Route
const session = await getSession();

// Returns: { session: Session, user: User } | null
```

#### getCurrentUser

```typescript
import { getCurrentUser } from "@/lib/auth/server";

const user = await getCurrentUser();

// Returns: User | null
```

#### requireAuth

```typescript
import { requireAuth } from "@/lib/auth/server";

// Throws if not authenticated
const user = await requireAuth();

// Returns: User (never null)
```

#### isAuthenticated

```typescript
import { isAuthenticated } from "@/lib/auth/server";

const authenticated = await isAuthenticated();

// Returns: boolean
```

### Server Actions

Located in [`lib/auth/user-actions.ts`](../lib/auth/user-actions.ts):

#### updateAccount

```typescript
"use server";
import { updateAccount } from "@/lib/auth/user-actions";

export async function handleUpdateAccount(prevState: any, formData: FormData) {
  const result = await updateAccount(prevState, formData);
  
  // Returns:
  // { name: string, success: string } | { error: string }
}
```

#### updatePassword

```typescript
"use server";
import { updatePassword } from "@/lib/auth/user-actions";

export async function handleUpdatePassword(prevState: any, formData: FormData) {
  const result = await updatePassword(prevState, formData);
  
  // Returns:
  // { success: string } | { error: string }
}
```

#### deleteAccount

```typescript
"use server";
import { deleteAccount } from "@/lib/auth/user-actions";

export async function handleDeleteAccount(prevState: any, formData: FormData) {
  await deleteAccount(prevState, formData);
  // Redirects to /sign-in
}
```

### Using API Endpoints Directly

```typescript
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

// Sign Up
await auth.api.signUpEmail({
  body: {
    email: "user@example.com",
    password: "password",
    name: "John Doe",
  },
});

// Sign In
await auth.api.signInEmail({
  body: {
    email: "user@example.com",
    password: "password",
  },
  headers: await headers(),
});

// Get Session
await auth.api.getSession({
  headers: await headers(),
});

// Change Password
await auth.api.changePassword({
  body: {
    currentPassword: "oldPassword",
    newPassword: "newPassword",
    revokeOtherSessions: true,
  },
  headers: await headers(),
});

// Sign Out
await auth.api.signOut({
  headers: await headers(),
});
```

### Return Headers or Response

```typescript
// Get headers
const { headers: responseHeaders, data } = await auth.api.signUpEmail({
  returnHeaders: true,
  body: { email: "user@example.com", password: "password", name: "John" },
});

const cookies = responseHeaders.get("set-cookie");

// Get Response object
const response = await auth.api.signInEmail({
  asResponse: true,
  body: { email: "user@example.com", password: "password" },
});
```

---

## Authentication

### Email & Password

#### Sign Up

**Endpoint**: `POST /api/auth/sign-up/email`

**Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response**:
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "image": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "dailyAiCredits": 4,
    "aiCreditsUsed": 0,
    "lastCreditReset": "2024-01-01T00:00:00.000Z",
    "organizationId": null,
    "role": "student"
  },
  "session": {
    "id": "session_123",
    "token": "...",
    "userId": "user_123",
    "expiresAt": "2024-01-08T00:00:00.000Z",
    "ipAddress": "127.0.0.1",
    "userAgent": "Mozilla/5.0...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Sign In

**Endpoint**: `POST /api/auth/sign-in/email`

**Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**: Same as sign up

### OAuth Providers

#### Initiate OAuth Flow

**Endpoint**: `GET /api/auth/sign-in/social`

**Query Parameters**:
- `provider`: `google` | `github` | `facebook` | `apple`
- `callbackURL` (optional): Redirect URL after authentication

**Example**:
```
GET /api/auth/sign-in/social?provider=google&callbackURL=/dashboard
```

#### OAuth Callback

**Endpoint**: `GET /api/auth/callback/{provider}`

Automatically handled by Better Auth. This endpoint receives the OAuth callback and creates/signs in the user.

**Example**:
```
GET /api/auth/callback/google?code=...&state=...
```

---

## Session Management

### Session Configuration

```typescript
session: {
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60, // 5 minutes cache
  },
  expiresIn: 60 * 60 * 24 * 7, // 7 days (default)
  updateAge: 60 * 60 * 24, // 1 day (default)
}
```

### Get Session

**Endpoint**: `GET /api/auth/get-session`

**Headers**:
```
Cookie: better-auth.session_token=...
```

**Response**:
```json
{
  "session": {
    "id": "session_123",
    "token": "...",
    "userId": "user_123",
    "expiresAt": "2024-01-08T00:00:00.000Z",
    "ipAddress": "127.0.0.1",
    "userAgent": "Mozilla/5.0...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "image": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "dailyAiCredits": 4,
    "aiCreditsUsed": 0,
    "lastCreditReset": "2024-01-01T00:00:00.000Z",
    "organizationId": null,
    "role": "student"
  }
}
```

### List Sessions

**Endpoint**: `GET /api/auth/list-sessions`

**Response**:
```json
[
  {
    "id": "session_123",
    "token": "...",
    "userId": "user_123",
    "expiresAt": "2024-01-08T00:00:00.000Z",
    "ipAddress": "127.0.0.1",
    "userAgent": "Chrome/...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Revoke Session

**Endpoint**: `POST /api/auth/revoke-session`

**Body**:
```json
{
  "token": "session_token_to_revoke"
}
```

### Sign Out

**Endpoint**: `POST /api/auth/sign-out`

**Response**:
```json
{
  "success": true
}
```

---

## User Management

### Update User

**Endpoint**: `POST /api/auth/update-user`

**Body**:
```json
{
  "name": "Jane Doe",
  "image": "https://example.com/avatar.jpg"
}
```

**Response**:
```json
{
  "id": "user_123",
  "name": "Jane Doe",
  "image": "https://example.com/avatar.jpg",
  "email": "user@example.com",
  "emailVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "dailyAiCredits": 4,
  "aiCreditsUsed": 0,
  "lastCreditReset": "2024-01-01T00:00:00.000Z",
  "organizationId": null,
  "role": "student"
}
```

### Change Password

**Endpoint**: `POST /api/auth/change-password`

**Body**:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "revokeOtherSessions": true
}
```

**Response**:
```json
{
  "success": true
}
```

### List Accounts

**Endpoint**: `GET /api/auth/list-accounts`

**Response**:
```json
[
  {
    "id": "account_123",
    "accountId": "user@example.com",
    "providerId": "credential",
    "userId": "user_123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "account_456",
    "accountId": "google_user_id",
    "providerId": "google",
    "userId": "user_123",
    "accessToken": "ya29.a0...",
    "refreshToken": "1//...",
    "scope": "email profile",
    "createdAt": "2024-01-02T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
]
```

---

## OAuth Providers

### Supported Providers

1. **Google OAuth**
   - Scopes: `email`, `profile`
   - Redirect URI: `/api/auth/callback/google`

2. **GitHub OAuth**
   - Scopes: `email`, `user`
   - Redirect URI: `/api/auth/callback/github`

3. **Facebook OAuth**
   - Redirect URI: `/api/auth/callback/facebook`

4. **Apple OAuth**
   - Redirect URI: `/api/auth/callback/apple`

### Configuration

Each provider requires environment variables:

```bash
# Google
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# GitHub
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# Facebook
FACEBOOK_CLIENT_ID=your-client-id
FACEBOOK_CLIENT_SECRET=your-client-secret

# Apple
APPLE_CLIENT_ID=your-client-id
APPLE_CLIENT_SECRET=your-client-secret
```

### OAuth Redirect URIs

For production: `https://your-app.vercel.app/api/auth/callback/{provider}`  
For development: `http://localhost:3000/api/auth/callback/{provider}`

---

## Database Schema

### Users Table

```typescript
{
  id: string (Primary Key)
  name: string
  email: string (Unique)
  emailVerified: boolean (Default: false)
  image: string | null
  createdAt: Date
  updatedAt: Date
  
  // Custom fields
  dailyAiCredits: number (Default: 4)
  aiCreditsUsed: number (Default: 0)
  lastCreditReset: Date
  organizationId: uuid | null
  role: string (Default: "student")
}
```

### Sessions Table

```typescript
{
  id: string (Primary Key)
  token: string (Unique)
  userId: string (Foreign Key -> users.id)
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  updatedAt: Date
}
```

### Accounts Table

```typescript
{
  id: string (Primary Key)
  accountId: string
  providerId: string ("credential" | "google" | "github" | "facebook" | "apple")
  userId: string (Foreign Key -> users.id)
  accessToken: string | null
  refreshToken: string | null
  idToken: string | null
  accessTokenExpiresAt: Date | null
  refreshTokenExpiresAt: Date | null
  scope: string | null
  password: string | null (Hashed, for credential accounts)
  createdAt: Date
  updatedAt: Date
}
```

### Verifications Table

```typescript
{
  id: string (Primary Key)
  identifier: string
  value: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}
```

---

## Type Definitions

### User Type

```typescript
type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  dailyAiCredits: number;
  aiCreditsUsed: number;
  lastCreditReset: Date | null;
  organizationId: string | null;
  role: string | null;
};
```

### Session Type

```typescript
type Session = {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
};
```

### Account Type

```typescript
type Account = {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  scope: string | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
};
```

### Auth Response Type

```typescript
type AuthResponse = {
  user: User;
  session: Session;
};
```

---

## Error Handling

### Client-Side Error Handling

```typescript
const { data, error } = await authClient.signIn.email({
  email: "user@example.com",
  password: "wrongPassword",
});

if (error) {
  console.error("Error Code:", error.code);
  console.error("Error Message:", error.message);
  console.error("Status:", error.status);
  console.error("Status Text:", error.statusText);
}
```

### Error Codes

```typescript
import { authClient } from "@/lib/auth/auth-client";

// Access error codes
const errorCodes = authClient.$ERROR_CODES;

// Common error codes:
// - USER_ALREADY_EXISTS
// - INVALID_EMAIL_OR_PASSWORD
// - EMAIL_NOT_VERIFIED
// - INVALID_SESSION
// - UNAUTHORIZED
// - BAD_REQUEST
```

### Custom Error Messages

```typescript
const errorTranslations = {
  USER_ALREADY_EXISTS: "This email is already registered",
  INVALID_EMAIL_OR_PASSWORD: "Invalid credentials",
  UNAUTHORIZED: "Please sign in to continue",
};

const getErrorMessage = (code: string) => {
  return errorTranslations[code] || "An error occurred";
};

// Usage
if (error?.code) {
  alert(getErrorMessage(error.code));
}
```

### Server-Side Error Handling

```typescript
import { APIError } from "better-auth/api";

try {
  await auth.api.signInEmail({
    body: { email: "", password: "" },
  });
} catch (error) {
  if (error instanceof APIError) {
    console.error("API Error:", error.message, error.status);
  }
}
```

### Common Errors

| Error Code | Status | Description |
|------------|--------|-------------|
| `USER_ALREADY_EXISTS` | 400 | Email already registered |
| `INVALID_EMAIL_OR_PASSWORD` | 401 | Invalid login credentials |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `EMAIL_NOT_VERIFIED` | 403 | Email verification required |
| `INVALID_SESSION` | 401 | Session expired or invalid |
| `BAD_REQUEST` | 400 | Invalid request data |

---

## Best Practices

### 1. Always Check Session on Protected Routes

```typescript
// app/dashboard/page.tsx
import { requireAuth } from "@/lib/auth/server";

export default async function DashboardPage() {
  const user = await requireAuth(); // Throws if not authenticated
  
  return <div>Welcome {user.name}</div>;
}
```

### 2. Use React Hook for Client Components

```typescript
// components/UserMenu.tsx
import { useAuth } from "@/lib/auth/auth-client";

export function UserMenu() {
  const { user, isAuthenticated, isPending } = useAuth();
  
  if (isPending) return <Skeleton />;
  if (!isAuthenticated) return <SignInButton />;
  
  return <UserDropdown user={user} />;
}
```

### 3. Handle Errors Gracefully

```typescript
const { data, error } = await authClient.signIn.email(
  { email, password },
  {
    onError: (ctx) => {
      toast.error(ctx.error.message);
    },
    onSuccess: (ctx) => {
      router.push("/dashboard");
    },
  }
);
```

### 4. Use Cookie Cache for Performance

Session data is cached in cookies for 5 minutes to reduce database queries.

### 5. Revoke Sessions on Password Change

```typescript
await authClient.changePassword({
  currentPassword,
  newPassword,
  revokeOtherSessions: true, // Sign out other devices
});
```

---

## Examples

### Complete Sign Up Flow

```typescript
"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { data, error: authError } = await authClient.signUp.email(
      { email, password, name },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
      }
    );

    if (authError) {
      setError(authError.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
        required
      />
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
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### Protected Server Component

```typescript
// app/dashboard/page.tsx
import { getSession } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session.user.name}</p>
      <p>Email: {session.user.email}</p>
      <p>Daily AI Credits: {session.user.dailyAiCredits}</p>
      <p>Credits Used: {session.user.aiCreditsUsed}</p>
    </div>
  );
}
```

### Server Action with Auth

```typescript
"use server";
import { requireAuth } from "@/lib/auth/server";
import { db } from "@/lib/db/drizzle";

export async function updateUserProfile(formData: FormData) {
  const user = await requireAuth(); // Throws if not authenticated

  const name = formData.get("name") as string;

  await db.update(users)
    .set({ name })
    .where(eq(users.id, user.id));

  return { success: true };
}
```

---

## Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
- [Next.js Documentation](https://nextjs.org/docs)
- [Database Schema](../lib/db/schema.ts)
- [Auth Configuration](../lib/auth/auth.ts)

---

## Support

For issues or questions:
1. Check the [Better Auth Documentation](https://www.better-auth.com/docs)
2. Review this API documentation
3. Check the implementation in your codebase
4. Contact your development team

---

**Last Updated**: 2024-01-11  
**Version**: 1.0.0