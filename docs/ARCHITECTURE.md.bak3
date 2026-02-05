# 🏗️ Sanctuary Stream - Architecture Documentation

## System Overview

Sanctuary Stream is a distributed system designed for reliable, secure control of church live streams. The architecture follows cloud-native principles with clear separation of concerns.

## Components

### 1. PocketBase Broker (Cloud)

**Purpose**: Central command hub and state synchronizer

**Technology**: PocketBase (SQLite + Go), hosted on PocketHost

**Responsibilities**:
- User authentication and RBAC
- Command queue management
- Real-time state synchronization (SSE)
- API gateway for all components

**Scaling**: Vertical (PocketHost handles this)

**Security**:
- TLS/HTTPS only
- Role-based collection rules
- Rate limiting (10 req/sec per user)
- No public write access

### 2. Church Bridge (On-Premise)

**Purpose**: OBS automation agent

**Technology**: Node.js + TypeScript

**Responsibilities**:
- Connect to local OBS via WebSocket
- Subscribe to PocketBase command queue
- Execute streaming commands idempotently
- Send heartbeat status updates

**Deployment**: 
- Linux: systemd service
- Windows: Windows Service (NSSM) or PM2
- Auto-restart on failure

**Security**:
- No inbound ports required
- Outbound HTTPS to PocketBase only
- OBS password stored in environment

### 3. Tauri Frontend (Cross-Platform)

**Purpose**: Remote control interface

**Technology**: Tauri (Rust) + React + TypeScript

**Responsibilities**:
- User authentication
- Send stream commands
- Display live stream status
- Provide diagnostic information

**Platforms**: Windows, macOS, Linux

**Security**:
- No local server required
- Auth tokens encrypted at rest (Tauri secure storage)
- Auto-update for security patches

### 4. AWS CDN Stack (Optional)

**Purpose**: Private video archive storage

**Technology**: S3 + CloudFront with signed URLs

**Responsibilities**:
- Store recorded Masses
- Serve videos with time-limited access
- Integrate with PocketBase for access control

**Security**:
- Private S3 bucket (no public access)
- CloudFront signed cookies/URLs
- RSA key pair for signing

## Data Flow

### Stream Start Flow

```
┌──────────────┐                ┌──────────────┐                ┌──────────────┐
│ Tauri App    │                │ PocketBase   │                │ Church Bridge│
│ (Pastor)     │                │ (Broker)     │                │ (Church PC)  │
└──────┬───────┘                └──────┬───────┘                └──────┬───────┘
       │                               │                               │
       │ 1. Click "Begin Mass"         │                               │
       │ Generate UUID                 │                               │
       │                               │                               │
       │ 2. POST /commands             │                               │
       │ {action: START,               │                               │
       │  correlation_id: uuid}        │                               │
       ├──────────────────────────────>│                               │
       │                               │                               │
       │ 3. Validate RBAC              │                               │
       │    (pastor role check)        │                               │
       │                               │                               │
       │ 4. Insert record              │                               │
       │    (unique constraint on      │                               │
       │     correlation_id)           │                               │
       │                               │                               │
       │                               │ 5. SSE Event                  │
       │                               │ {new command created}         │
       │                               ├──────────────────────────────>│
       │                               │                               │
       │                               │ 6. Fetch command              │
       │                               │    Check executed = false     │
       │                               │                               │
       │                               │                               │ 7. OBS API
       │                               │                               │ StartStream()
       │                               │                               │
       │                               │ 8. PATCH /commands/{id}       │
       │                               │ {executed: true}              │
       │                               │<──────────────────────────────│
       │                               │                               │
       │                               │ 9. Update streams record      │
       │                               │ {status: live}                │
       │                               │<──────────────────────────────│
       │                               │                               │
       │ 10. SSE Event                 │                               │
       │ {stream status updated}       │                               │
       │<──────────────────────────────┤                               │
       │                               │                               │
       │ 11. UI updates                │                               │
       │ Button turns red + pulses     │                               │
       │                               │                               │
```

### Heartbeat Flow

```
Every 30 seconds:

Church Bridge                    PocketBase
      │                               │
      │ 1. OBS.GetStreamStatus()      │
      │                               │
      │ 2. PATCH /streams/{id}        │
      │ {status, heartbeat, metadata} │
      ├──────────────────────────────>│
      │                               │
      │                               │ 3. SSE Event
      │                               │ (all subscribed clients)
      │                               │
```

## Database Schema

### Collection: `users`
- **id**: PK
- **email**: Unique, indexed
- **role**: Enum (admin, pastor, tech)
- **name**: String
- **avatar**: String (URL)

### Collection: `commands`
- **id**: PK
- **action**: Enum (START, STOP)
- **executed**: Boolean (default: false, indexed)
- **correlation_id**: String (unique index)
- **payload**: JSON
- **created_by**: FK → users
- **created**: Timestamp (indexed)

### Collection: `streams`
- **id**: PK
- **status**: Enum (live, idle, indexed)
- **heartbeat**: Timestamp
- **youtube_url**: String
- **metadata**: JSON

## Security Model

### Authentication
- **PocketBase Auth**: Email/password with JWT tokens
- **Token Refresh**: Auto-refresh before expiry
- **Session Timeout**: 24 hours

### Authorization (RBAC)
| Role | Can View | Can Create Commands | Can Update Streams |
|------|----------|---------------------|-------------------|
| Guest | ❌ | ❌ | ❌ |
| Pastor | ✅ | ✅ | ❌ |
| Tech | ✅ | ❌ | ✅ (Bridge only) |
| Admin | ✅ | ✅ | ✅ |

### Idempotency
- **Mechanism**: Unique constraint on `commands.correlation_id`
- **Generation**: `crypto.randomUUID()` in frontend
- **Benefit**: Double-clicks don't trigger duplicate streams

### Network Security
- **TLS**: All HTTP traffic encrypted (HTTPS)
- **CORS**: Limited to approved domains
- **Rate Limiting**: 10 requests/sec per authenticated user
- **No Public APIs**: All endpoints require authentication

## Performance Considerations

### Latency Targets
- **Command Execution**: <5 seconds (click → OBS starts)
- **Status Update**: <2 seconds (OBS status → UI update)
- **Heartbeat Interval**: 30 seconds

### Scalability
- **PocketBase**: Handles 1000s of concurrent SSE connections
- **Bridge**: Single instance per church (no scaling needed)
- **Frontend**: Unlimited clients (read-only operations)

### Reliability
- **Bridge Auto-Restart**: PM2 or systemd
- **PocketBase Uptime**: 99.9% SLA (PocketHost)
- **Command Retry**: Automatic for network failures

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │                           │
         │                           │
    ┌────▼────┐                 ┌────▼────┐
    │PocketHost                 │ Tauri   │
    │(Cloud)   │                │ Apps    │
    │          │                │(Devices)│
    │- Auth    │                │         │
    │- Queue   │                │- Pastor │
    │- Sync    │                │- Tech   │
    └────┬─────┘                │- Admin  │
         │                      └─────────┘
         │ HTTPS + SSE
         │
    ┌────▼─────────────┐
    │ Church Firewall  │
    │ (Outbound only)  │
    └────┬─────────────┘
         │
    ┌────▼─────────────┐
    │ Church Bridge    │
    │ (Local Service)  │
    │                  │
    │ - Node.js        │
    │ - PM2/systemd    │
    └────┬─────────────┘
         │ WebSocket (local)
    ┌────▼─────────────┐
    │ OBS Studio       │
    │ (Streaming PC)   │
    └──────────────────┘
```

## Disaster Recovery

### Bridge Service Failure
- **Detection**: Missing heartbeat for >2 minutes
- **Notification**: Alert sent to tech staff via PocketBase
- **Recovery**: PM2/systemd auto-restarts service
- **Manual**: SSH to church PC and restart

### PocketBase Downtime
- **Detection**: Connection errors in Bridge + Frontend
- **Behavior**: Bridge queues commands locally (future enhancement)
- **Recovery**: Automatic reconnection when PocketBase returns

### OBS Crash
- **Detection**: WebSocket connection lost
- **Behavior**: Bridge attempts reconnection (3 retries, 5s backoff)
- **Notification**: Update stream status to "error" in PocketBase
- **Recovery**: Manual restart of OBS required

## Future Enhancements

- **Multi-Church Support**: Tenant isolation in PocketBase
- **Video Archive Integration**: Automatic upload to S3 + CloudFront
- **Analytics Dashboard**: View counts, streaming health metrics
- **Mobile App**: React Native version of Tauri app
- **Webhook Integrations**: Discord/Slack notifications
- **Backup Streaming**: Automatic failover to YouTube/Facebook

---

**Last Updated**: 2026-02-03  
**Version**: 0.1.0
