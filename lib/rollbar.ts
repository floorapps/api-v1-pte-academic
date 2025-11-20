import Rollbar from 'rollbar'

export const rollbarConfig = {
  accessToken: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN || '',
  environment: process.env.NODE_ENV || 'development',
  captureUncaught: true,
  captureUnhandledRejections: true,
  checkIgnore: function (_isUncaught: boolean, _args: any, payload: any) {
    try {
      const msg =
        payload?.body?.message?.body ||
        payload?.body?.trace?.exception?.message ||
        payload?.body?.trace_chain?.[0]?.exception?.message ||
        ''
      const name =
        payload?.body?.trace?.exception?.class ||
        payload?.body?.trace_chain?.[0]?.exception?.class ||
        ''

      const text = String(msg || name || '').toLowerCase()
      if (
        text.includes('aborterror') ||
        text.includes('err_aborted') ||
        text.includes('navigation aborted') ||
        text.includes('the user aborted a request')
      ) {
        return true
      }
    } catch {}
    return false
  },
  payload: {
    client: {
      javascript: {
        code_version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || '1.0.0',
        source_map_enabled: true,
      },
    },
  },
}

// Server-side Rollbar instance
export const serverRollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_SERVER_TOKEN || '',
  environment: process.env.NODE_ENV || 'development',
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    server: {
      root: process.cwd(),
    },
  },
})

// Log function for server-side errors
export function logError(error: Error | unknown, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error, 'Context:', context)
  }

  if (serverRollbar && process.env.ROLLBAR_SERVER_TOKEN) {
    serverRollbar.error(error as any, context)
  }
}

// Log function for server-side warnings
export function logWarning(message: string, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Warning:', message, 'Context:', context)
  }

  if (serverRollbar && process.env.ROLLBAR_SERVER_TOKEN) {
    serverRollbar.warning(message, context)
  }
}

// Log function for server-side info
export function logInfo(message: string, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Info:', message, 'Context:', context)
  }

  if (serverRollbar && process.env.ROLLBAR_SERVER_TOKEN) {
    serverRollbar.info(message, context)
  }
}
