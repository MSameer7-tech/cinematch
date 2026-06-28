# CinemaMatch Data Dictionary

Version: 1.0

Status: Draft

---

This document defines every database field used in CinemaMatch. It serves as the authoritative reference for PostgreSQL schema design, Supabase implementation, backend models, API contracts, and frontend integration. Every database column must first be documented here before implementation.

---

# 1. Users Table

| Column | Type | Nullable | Default | Constraints | Indexed | Description |
|--------|------|----------|---------|-------------|---------|-------------|
| id | UUID | No | auth.users.id | PK, FK → auth.users(id) | ✅ | Unique identifier shared with Supabase Auth |
| display_name | VARCHAR(50) | No | — | Length 2–50 | ❌ | Public display name |
| avatar_url | TEXT | Yes | NULL | Valid URL | ❌ | Profile picture |
| onboarding_completed | BOOLEAN | No | FALSE | — | ❌ | Whether onboarding has been completed |
| account_status | ENUM | No | ACTIVE | Allowed values only | ✅ | Current account state |
| created_at | TIMESTAMPTZ | No | NOW() | Immutable | ❌ | Creation timestamp |
| updated_at | TIMESTAMPTZ | No | NOW() | Auto-updated | ❌ | Last profile update |
| last_seen_at | TIMESTAMPTZ | Yes | NULL | — | ✅ | Last overall user activity |

## Notes

### Ownership
- Authentication credentials are managed exclusively by Supabase Auth.
- The users table stores only application-specific profile information.

### One-to-One Relationship
- `users.id` references `auth.users.id`.
- A user profile cannot exist without an authenticated account.

### Account Status
Allowed values:
- `ACTIVE`
- `PENDING_VERIFICATION`
- `SUSPENDED`
- `DELETED`

We won't use all of them immediately, but designing for them now prevents future migrations.

## Open Questions

- Should users be able to change their display name freely?
- Should deleted accounts be soft-deleted or permanently removed?
- Should avatar images be uploaded or only linked?
- Should we reserve display names to prevent impersonation?

---

# 2. Guest Sessions Table

| Column | Type | Nullable | Default | Constraints | Indexed | Description |
|--------|------|----------|---------|-------------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary Key | ✅ | Unique guest session identifier |
| session_token | UUID | No | gen_random_uuid() | Unique | ✅ | Stored securely in browser cookie |
| recommendation_profile_id | UUID | Yes | NULL | FK (Future) | ❌ | Links to recommendation profile |
| created_at | TIMESTAMPTZ | No | NOW() | Immutable | ❌ | Session creation time |
| last_activity_at | TIMESTAMPTZ | No | NOW() | Auto-updated | ✅ | Last recorded activity |
| migrated_to_user_id | UUID | Yes | NULL | FK → users.id | ✅ | User account created from this guest |
| migrated_at | TIMESTAMPTZ | Yes | NULL | — | ❌ | Migration timestamp |

## Notes

### Ownership
- Guest sessions represent anonymous users.
- A guest session may exist without a registered account.
- Guest data is migrated, not copied, when an account is created.

### Expiration
- Sessions expire after 60 consecutive days of inactivity.
- Expiration is calculated dynamically from `last_activity_at` (`last_activity_at + 60 days`) and is not stored in the database.
- Any user activity updates `last_activity_at`.

### Migration
- A guest session can only be migrated once.
- After migration, the session becomes read-only.
- Archived guest sessions are retained for audit purposes before cleanup.

## Open Questions

- Should guests be able to restore expired sessions?
- Should guest sessions survive browser cookie deletion?
- Should inactive guest sessions be cleaned up automatically by a scheduled job?

---

# 3. OAuth Accounts Table

| Column | Type | Nullable | Default | Constraints | Indexed | Description |
|--------|------|----------|---------|-------------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary Key | ✅ | Internal OAuth record ID |
| user_id | UUID | No | — | FK → users.id | ✅ | Owner of this OAuth account |
| provider | ENUM | No | GOOGLE | Allowed providers | ✅ | Authentication provider |
| provider_user_id | TEXT | No | — | Unique per provider | ✅ | User ID assigned by the provider |
| linked_at | TIMESTAMPTZ | No | NOW() | Immutable | ❌ | Link timestamp |
| last_login_at | TIMESTAMPTZ | Yes | NULL | — | ❌ | Last OAuth authentication |

## Notes

### Ownership
- Stores provider-specific information only.
- Authentication credentials remain managed by Supabase Auth.
- Provider access tokens are never stored.

### Current Providers
Supported in V1:
- `GOOGLE`

Future:
- `APPLE`
- `GITHUB`
- `MICROSOFT`

### Security
- One provider account may only be linked to one CineMatch user.
- A user may link multiple providers in future releases.

## Open Questions

- Should users be able to unlink their last authentication provider?
- Should relinking the same provider update the existing record or create a new one?
- Should we retain historical OAuth login timestamps?

---

# 4. User Sessions Table

| Column | Type | Nullable | Default | Constraints | Indexed | Description |
|--------|------|----------|---------|-------------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary Key | ✅ | Unique session record ID (can map to Supabase session ID) |
| user_id | UUID | No | — | FK → users.id | ✅ | Owner of this session |
| device_name | TEXT | Yes | NULL | — | ❌ | User-defined or detected name of the device |
| device_type | VARCHAR(20) | Yes | NULL | Allowed types only | ❌ | Type of device (e.g., MOBILE, DESKTOP, TABLET) |
| browser | VARCHAR(50) | Yes | NULL | — | ❌ | Detected browser name |
| operating_system | VARCHAR(50) | Yes | NULL | — | ❌ | Detected operating system |
| ip_address | INET | Yes | NULL | — | ❌ | IP address of the client connection |
| last_activity_at | TIMESTAMPTZ | No | NOW() | — | ✅ | Last recorded user activity |
| created_at | TIMESTAMPTZ | No | NOW() | Immutable | ❌ | Session creation timestamp |
| revoked_at | TIMESTAMPTZ | Yes | NULL | Must be after created_at | ✅ | Revocation timestamp (NULL means active) |

## Notes

### Ownership
- Supabase Auth manages core authentication states, tokens, and verification.
- The `user_sessions` table stores application-level device metadata and activity tracking.
- Session revocation status is maintained here, allowing users to inspect and revoke active devices.

### Expiration
- Following **Principle 5 (Dynamic over Static)**, we do not store an `expires_at` column. Expiration is calculated at runtime (`last_activity_at + 30 days` of inactivity).
- A session is active if `revoked_at` is `NULL` AND `last_activity_at` is within the active limit.

### Security
- If a user changes their password, all sessions except the current active one must have their `revoked_at` set to `NOW()`.

## Open Questions

- Should we automatically update `last_activity_at` on every single request, or throttle updates (e.g., maximum once per hour) to reduce write load?
- Should we automatically log the approximate physical location (e.g., country/city) based on the `ip_address`?
- Should an administrator be able to revoke sessions, or is this feature restricted to the session owner?

---

# 5. User Preferences Table

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|

## Notes
