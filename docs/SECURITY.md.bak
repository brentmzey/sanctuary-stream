# 🛡️ Security Guidelines - Sanctuary Stream

## Overview

Sanctuary Stream follows security best practices for church streaming applications, protecting sensitive operations and user data.

## Threat Model

### Assets to Protect
1. **Stream Control**: Unauthorized users cannot start/stop streams
2. **User Credentials**: Email/password combinations
3. **OBS Access**: Local OBS WebSocket password
4. **Video Archives**: Private Mass recordings (if using AWS CDN)

### Potential Threats
- Unauthorized stream control (pranks, attacks)
- Credential theft via phishing
- Man-in-the-middle attacks
- Denial of service
- Leaked video content

## Authentication & Authorization

### PocketBase Authentication
- **Method**: Email + password with JWT tokens
- **Token Expiry**: 24 hours (configurable)
- **Refresh**: Automatic before expiry
- **Storage**: Encrypted in Tauri secure storage

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **Admin** | Full access: manage users, create commands, view all data |
| **Pastor** | Create stream commands (START/STOP) |
| **Tech** | View diagnostics, Bridge service account |
| **Guest** | No access (must log in) |

### API Rules (PocketBase)

```javascript
// Collection: commands
// CREATE Rule
@request.auth.role = 'admin' || @request.auth.role = 'pastor'

// UPDATE Rule (Bridge service account only)
@request.auth.role = 'tech'

// VIEW Rule
@request.auth.id != ''
```

## Network Security

### TLS/HTTPS
- **All traffic encrypted**: PocketBase enforces HTTPS
- **Certificate validation**: Tauri app validates SSL certificates
- **No HTTP fallback**: Reject unencrypted connections

### CORS Policy
```json
{
  "origin": [
    "tauri://localhost",
    "https://your-production-domain.com"
  ],
  "methods": ["GET", "POST", "PATCH"],
  "credentials": true
}
```

### Rate Limiting
- **PocketBase**: 10 requests/second per authenticated user
- **Command Creation**: 1 request/5 seconds per user (prevents spam)

## Secret Management

### Environment Variables

**NEVER commit these to Git**:
```bash
BRIDGE_PASS=your-secure-password
OBS_PASS=obs-websocket-password
AWS_SECRET_ACCESS_KEY=secret-key
CLOUDFRONT_PRIVATE_KEY_PATH=./private-key.pem
```

### Storage Locations
- **Development**: `.env` (gitignored)
- **Production (Bridge)**: `/etc/sanctuary-stream/.env` (chmod 600)
- **Production (Tauri)**: OS-specific secure storage
  - Windows: Credential Manager
  - macOS: Keychain
  - Linux: Secret Service API

### Secret Rotation
- **PocketBase passwords**: Change every 90 days
- **OBS WebSocket**: Change after tech staff changes
- **AWS keys**: Rotate annually or on breach

## Idempotency & Duplicate Prevention

### Correlation IDs
Every command includes a `correlation_id` generated with `crypto.randomUUID()`:
```typescript
const correlationId = crypto.randomUUID();
await pb.collection('commands').create({
  action: 'START',
  correlation_id: correlationId, // Unique constraint in DB
});
```

**Benefits**:
- Double-clicks don't trigger duplicate streams
- Retry-safe operations
- Audit trail for debugging

### Database Constraints
```sql
CREATE UNIQUE INDEX idx_correlation_id 
ON commands(correlation_id);
```

## Input Validation

### Zod Schemas
All API inputs validated with Zod:
```typescript
const CommandSchema = z.object({
  action: z.enum(['START', 'STOP']),
  correlation_id: z.string().uuid(),
  payload: z.record(z.unknown()).optional(),
});
```

### Sanitization
- **No SQL injection**: PocketBase uses prepared statements
- **No XSS**: React auto-escapes JSX content
- **No code injection**: No `eval()` or dynamic code execution

## Video Archive Security (AWS)

### S3 Bucket Configuration
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Deny",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::sanctuary-archives/*",
    "Condition": {
      "Bool": { "aws:SecureTransport": "false" }
    }
  }]
}
```

### CloudFront Signed URLs
```typescript
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

const signedUrl = getSignedUrl({
  url: 'https://d1234.cloudfront.net/mass-2024-01-15.mp4',
  keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
  privateKey: fs.readFileSync(process.env.CLOUDFRONT_PRIVATE_KEY_PATH),
  dateLessThan: new Date(Date.now() + 3600 * 1000), // 1 hour expiry
});
```

## Dependency Security

### Regular Audits
```bash
# Run on every CI build
npm audit --production

# Fix automatically (review changes first)
npm audit fix

# For critical vulnerabilities
npm audit fix --force
```

### Automated Scanning
```yaml
# .github/workflows/security.yml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    severity: 'CRITICAL,HIGH'
```

### Update Policy
- **Critical vulnerabilities**: Patch within 24 hours
- **High severity**: Patch within 1 week
- **Medium/Low**: Patch in next release

## Logging & Monitoring

### What to Log
- ✅ Authentication attempts (success/failure)
- ✅ Command creation (who, when, what)
- ✅ Command execution (Bridge)
- ✅ Errors and exceptions

### What NOT to Log
- ❌ Passwords or tokens
- ❌ Full JWT tokens (log last 4 chars only)
- ❌ AWS secret keys

### Example Log Entry
```json
{
  "timestamp": "2026-02-03T12:34:56Z",
  "level": "info",
  "service": "bridge",
  "event": "command_executed",
  "correlation_id": "a1b2c3d4-...",
  "action": "START",
  "user_id": "user_xyz123",
  "duration_ms": 1234
}
```

## Incident Response

### Security Breach Checklist
1. **Isolate**: Disconnect Bridge service from network
2. **Revoke**: Invalidate all PocketBase auth tokens
3. **Rotate**: Change all passwords and API keys
4. **Audit**: Review logs for unauthorized access
5. **Patch**: Fix vulnerability if code-related
6. **Notify**: Inform affected users (if applicable)
7. **Document**: Write post-mortem

### Emergency Contacts
- **Tech Lead**: tech@sanctuary-stream.dev
- **Security Team**: security@sanctuary-stream.dev
- **PocketHost Support**: support@pockethost.io

## Best Practices Checklist

- [ ] All secrets in environment variables (never in code)
- [ ] HTTPS enforced for all API calls
- [ ] RBAC configured in PocketBase
- [ ] Unique constraints on correlation_id
- [ ] Input validation with Zod
- [ ] Rate limiting enabled
- [ ] Regular `npm audit` runs
- [ ] Logs don't contain sensitive data
- [ ] AWS S3 bucket is private
- [ ] CloudFront uses signed URLs
- [ ] Bridge service runs as non-root user
- [ ] Tauri app uses secure storage for tokens

## Reporting Vulnerabilities

**DO NOT** open public GitHub issues for security vulnerabilities.

Instead:
1. Email: security@sanctuary-stream.dev
2. Include: Steps to reproduce, impact assessment, proposed fix (if known)
3. Expect: Response within 48 hours, fix within 7 days (critical) or 30 days (non-critical)

We follow responsible disclosure and will credit researchers in release notes (with permission).

---

**Last Updated**: 2026-02-03  
**Security Contact**: security@sanctuary-stream.dev
