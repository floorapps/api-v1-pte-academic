# Rollbar Error Tracking Setup

This app is configured with Rollbar for comprehensive error tracking and monitoring.

## Setup Instructions

### 1. Get Your Rollbar Tokens

1. Go to your Rollbar dashboard: [https://app.rollbar.com/a/hellowhq67-s-projects](https://app.rollbar.com/a/hellowhq67-s-projects)
2. Navigate to **Settings** → **Project Access Tokens**
3. Copy the following tokens:
   - **post_client_item** token → for `NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN`
   - **post_server_item** token → for `ROLLBAR_SERVER_TOKEN`

### 2. Configure Environment Variables

Add the tokens to your `.env.local` file:

```bash
# Rollbar Error Tracking
NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN=your_post_client_item_token_here
ROLLBAR_SERVER_TOKEN=your_post_server_item_token_here
```

**Important**:
- `NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN` is used for **client-side** error tracking
- `ROLLBAR_SERVER_TOKEN` is used for **server-side** error tracking

### 3. Deploy to Production

When deploying to Vercel, add these environment variables:

```bash
vercel env add NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN
vercel env add ROLLBAR_SERVER_TOKEN
```

Or add them through the Vercel dashboard:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add both tokens for Production, Preview, and Development environments

## Features Enabled

✅ **Client-side error tracking** - Catches errors in React components
✅ **Server-side error tracking** - Catches errors in API routes and server components
✅ **Global error boundary** - Custom error UI with automatic error reporting
✅ **Source maps** - Production source maps enabled for better stack traces
✅ **Environment tracking** - Separates errors by development/production
✅ **User context** - Can track which user experienced the error

## Usage

### Automatic Error Tracking

Errors are automatically tracked:
- Uncaught exceptions
- Unhandled promise rejections
- React component errors (via Error Boundary)

### Manual Error Logging (Server-side)

```typescript
import { logError, logWarning, logInfo } from '@/lib/rollbar'

try {
  // Your code
} catch (error) {
  logError(error, {
    userId: user.id,
    action: 'create_test_attempt'
  })
}

// Log warnings
logWarning('API rate limit approaching', {
  remainingRequests: 10
})

// Log info
logInfo('User completed mock test', {
  userId: user.id,
  score: 85
})
```

### Manual Error Logging (Client-side)

```typescript
'use client'

import Rollbar from 'rollbar'
import { rollbarConfig } from '@/lib/rollbar'

const rollbar = new Rollbar(rollbarConfig)

function MyComponent() {
  const handleAction = async () => {
    try {
      // Your code
    } catch (error) {
      rollbar.error(error, {
        userId: user.id,
        component: 'MyComponent'
      })
    }
  }
}
```

## Testing

To test if Rollbar is working:

1. **Development Mode**: Errors are logged to console AND Rollbar
2. **Production Mode**: Errors are only sent to Rollbar

Test client-side error:
```typescript
// Add this to any component
throw new Error('Test Rollbar client error')
```

Test server-side error:
```typescript
// Add this to any API route
import { logError } from '@/lib/rollbar'
logError(new Error('Test Rollbar server error'))
```

## Rollbar Dashboard

View errors at: [https://app.rollbar.com/a/hellowhq67-s-projects](https://app.rollbar.com/a/hellowhq67-s-projects)

Features available:
- Real-time error notifications
- Stack traces with source maps
- Error grouping and trends
- Deploy tracking
- Alert rules and integrations (Slack, email, etc.)

## Best Practices

1. **Add context to errors**: Always include user ID, action, and relevant data
2. **Use appropriate log levels**: error > warning > info
3. **Set up notifications**: Configure Slack/email alerts for critical errors
4. **Review regularly**: Check Rollbar weekly for new error patterns
5. **Link to deploys**: Use Rollbar's deploy tracking to correlate errors with releases

## Troubleshooting

**Errors not showing up?**
- Check that environment variables are set correctly
- Verify tokens are from the correct Rollbar project
- Check browser console for Rollbar connection errors
- Ensure `NODE_ENV` is set appropriately

**Too many errors?**
- Adjust sampling rate in `lib/rollbar.ts`
- Set up ignore rules in Rollbar dashboard
- Use environment filters to focus on production errors

## Related Files

- [lib/rollbar.ts](lib/rollbar.ts) - Rollbar configuration and helper functions
- [components/providers/rollbar-provider.tsx](components/providers/rollbar-provider.tsx) - Client-side provider
- [app/global-error.tsx](app/global-error.tsx) - Global error boundary
- [app/layout.tsx](app/layout.tsx) - Root layout with Rollbar integration
