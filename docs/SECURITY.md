# Security Best Practices

## 🚨 URGENT: Credential Exposure

**If you've accidentally exposed credentials (like just now), take immediate action:**

1. **Reset Database Password**
   - Go to [Neon Console](https://console.neon.tech)
   - Navigate to your project
   - Reset the database password immediately
   - Update your `.env.local` with the new password

2. **Rotate All Secrets**
   - Generate new `BETTER_AUTH_SECRET`: `openssl rand -base64 32`
   - Rotate OAuth credentials if exposed
   - Update all deployment environment variables

3. **Review Access**
   - Check database logs for suspicious activity
   - Review recent sign-ins and sessions
   - Monitor for unauthorized access

---

## 🔒 Critical Security Guidelines

### Never Expose Credentials

**❌ NEVER do this:**
- ❌ Commit `.env.local` or `.env.production` to Git
- ❌ Share environment variables in public channels
- ❌ Include credentials in code, documentation, or screenshots
- ❌ Share connection strings with AI assistants or support
- ❌ Store secrets in client-side code
- ❌ Hardcode API keys or passwords
- ❌ Share `.env` files via email or chat

**✅ DO this instead:**
- ✅ Use `.env.example` with placeholder values
- ✅ Add `.env*` (except `.env.example`) to `.gitignore`
- ✅ Use environment variables for all secrets
- ✅ Store secrets in deployment platform (Vercel, etc.)
- ✅ Use secret management services for production
- ✅ Rotate credentials regularly
- ✅ Use different credentials for dev/staging/prod

---

## 🛡️ Better Auth Security

### Authentication Security

1. **Strong Secrets**
   ```bash
   # Generate strong secret (minimum 32 characters)
   openssl rand -base64 32
   ```

2. **Secure Cookie Settings**
   ```typescript
   // In production
   advanced: {
     useSecureCookies: process.env.NODE_ENV === "production",
     cookiePrefix: "better-auth",
   }
   ```

3. **Session Management**
   - Sessions expire after 7 days (default)
   - Cookie cache: 5 minutes
   - Always use HTTPS in production
   - Enable `sameSite: 'lax'` or `'strict'`

4. **Password Requirements**
   - Minimum 8 characters (enforced by schema)
   - Encourage strong passwords with client-side validation
   - Consider password strength indicators
   - Never store plain text passwords (Better Auth hashes automatically)

### OAuth Security

1. **Callback URLs**
   - Always use HTTPS in production
   - Whitelist specific callback URLs
   - Verify state parameter (Better Auth handles this)

2. **Token Storage**
   - Access tokens stored securely in database
   - Refresh tokens encrypted at rest (if needed)
   - Never expose tokens to client side

3. **Provider Configuration**
   ```typescript
   socialProviders: {
     google: {
       clientId: process.env.GOOGLE_CLIENT_ID || "",
       clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
       enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
       // Always verify these are set in production
     }
   }
   ```

---

## 🗄️ Database Security

### Connection Security

1. **Use SSL/TLS**
   ```bash
   # Always use sslmode=require for production
   POSTGRES_URL=postgresql://user:pass@host/db?sslmode=require
   ```

2. **Connection Pooling**
   - Use pooled connections for serverless (Neon)
   - Limit connection pool size
   - Set connection timeouts

3. **Least Privilege**
   - Create separate database users for different environments
   - Grant only necessary permissions
   - Use read-only users where applicable

### Data Protection

1. **Sensitive Data**
   - Never log sensitive information (passwords, tokens)
   - Consider encryption for PII
   - Implement data retention policies

2. **SQL Injection Prevention**
   - Use parameterized queries (Drizzle ORM handles this)
   - Never interpolate user input into SQL
   - Validate all inputs

---

## 🌐 API Security

### Rate Limiting

```typescript
// Implement rate limiting for auth endpoints
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many attempts, please try again later',
});
```

### CORS Configuration

```typescript
// In auth.ts
trustedOrigins: [
  process.env.NEXT_PUBLIC_APP_URL,
  // Only add trusted domains
],
```

### Input Validation

```typescript
// Always validate user input
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});
```

---

## 🔐 Session Security

### Session Management Best Practices

1. **Session Expiration**
   ```typescript
   session: {
     expiresIn: 60 * 60 * 24 * 7, // 7 days
     updateAge: 60 * 60 * 24, // 1 day
   }
   ```

2. **Session Revocation**
   - Revoke sessions on password change
   - Allow users to view/revoke active sessions
   - Implement "sign out everywhere" functionality

3. **Session Storage**
   - Use secure, httpOnly cookies
   - Enable SameSite protection
   - Consider secondary storage (Redis) for high-traffic sites

### Protecting Routes

```typescript
// Always validate session server-side
export default async function ProtectedPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/sign-in');
  }
  
  // Additional authorization checks
  if (session.user.role !== 'admin') {
    redirect('/unauthorized');
  }
  
  return <Page />;
}
```

---

## 🚦 Deployment Security

### Vercel/Production Environment

1. **Environment Variables**
   - Set all secrets in Vercel dashboard
   - Use different values for preview/production
   - Never use `.env.local` in production

2. **Domain Security**
   - Enable HTTPS only
   - Configure HSTS headers
   - Use security headers middleware

3. **Monitoring**
   - Enable error tracking (Sentry)
   - Monitor failed login attempts
   - Set up alerts for suspicious activity

### Security Headers

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## 📋 Security Checklist

### Before Production

- [ ] All secrets use strong, randomly generated values
- [ ] `.env.local` and `.env.production` in `.gitignore`
- [ ] HTTPS enabled and enforced
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Database uses SSL connections
- [ ] OAuth redirect URIs whitelisted
- [ ] Session expiration configured appropriately
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't include passwords/tokens
- [ ] Dependencies are up to date
- [ ] Security scanning enabled (Dependabot)

### Regular Maintenance

- [ ] Rotate secrets quarterly
- [ ] Review and update dependencies monthly
- [ ] Monitor security advisories
- [ ] Review access logs for anomalies
- [ ] Test backup and recovery procedures
- [ ] Update security documentation

---

## 🔍 Common Vulnerabilities to Avoid

### 1. Credential Exposure
**Risk**: Database takeover, data breach  
**Prevention**: Never commit secrets, use proper .gitignore

### 2. Session Fixation
**Risk**: Account takeover  
**Prevention**: Regenerate session ID after login (Better Auth handles this)

### 3. XSS (Cross-Site Scripting)
**Risk**: Session hijacking, data theft  
**Prevention**: Sanitize user input, use CSP headers

### 4. CSRF (Cross-Site Request Forgery)
**Risk**: Unauthorized actions  
**Prevention**: Use SameSite cookies, CSRF tokens (Better Auth handles this)

### 5. SQL Injection
**Risk**: Database compromise  
**Prevention**: Use ORM, parameterized queries (Drizzle handles this)

### 6. Weak Passwords
**Risk**: Brute force attacks  
**Prevention**: Enforce strong passwords, implement rate limiting

### 7. Insecure Token Storage
**Risk**: Token theft  
**Prevention**: Use httpOnly cookies, don't store in localStorage

---

## 📞 Security Incident Response

### If You Suspect a Breach

1. **Immediate Actions**
   - Rotate all credentials immediately
   - Revoke all active sessions
   - Enable additional monitoring
   - Document the incident

2. **Investigation**
   - Review access logs
   - Check for unauthorized data access
   - Identify the attack vector
   - Assess the damage

3. **Remediation**
   - Patch the vulnerability
   - Notify affected users
   - Update security measures
   - Implement additional controls

4. **Prevention**
   - Conduct security audit
   - Update documentation
   - Train team members
   - Implement lessons learned

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Better Auth Security](https://www.better-auth.com/docs/concepts/security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Neon Security](https://neon.tech/docs/security/security-overview)

---

**Remember**: Security is an ongoing process, not a one-time setup. Stay vigilant!