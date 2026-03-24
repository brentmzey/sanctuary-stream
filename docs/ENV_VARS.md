# Environment Variables for Sanctuary Stream

## PocketBase Configuration

Required for all environments (Production, Staging, Local Development).

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `PB_URL` | The base URL for the PocketBase instance. | `http://127.0.0.1:8090` | `https://sanctuary-stream.pockethost.io` |
| `PB_ADMIN_EMAIL` | Admin email for superuser operations (migrations, tests). | - | `admin@sanctuary-stream.com` |
| `PB_ADMIN_PASSWORD` | Admin password for superuser operations. | - | `hunter2` |
| `STREAM_ID` | The unique identifier for this parish's stream instance. | - | `pbc_1849560702` |

## Environment-Specific Suffixes

For robust multi-environment management, you can use suffixes in your CI/CD or local `.env` files:

- `PB_URL_PRODUCTION`
- `PB_ADMIN_EMAIL_PRODUCTION`
- `PB_ADMIN_PASSWORD_PRODUCTION`

## Security Policies

> [!IMPORTANT]
> Admin credentials should **NEVER** be committed to the repository. Use GitHub Secrets for CI/CD and a local `.env` file (ignored by Git) for development.

## Automated Schema Sync

The `just sync-schemas` command uses these variables to align your local `pb_schema.json` with the remote instance.
