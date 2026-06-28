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
| id | UUID | No | gen_random_uuid() | Primary Key | ✅ | Internal UUID representing this session record |
| user_id | UUID | No | — | FK → users.id | ✅ | Owner of this session |
| device_label | TEXT | Yes | NULL | — | ❌ | User-friendly device name (e.g., 'Dad's Laptop') |
| device_type | VARCHAR(20) | Yes | NULL | MOBILE / DESKTOP / TABLET | ❌ | Categorized hardware format |
| user_agent | TEXT | Yes | NULL | — | ❌ | Raw User-Agent string from browser/client |
| last_ip_address | INET | Yes | NULL | — | ❌ | IP address of the most recent connection |
| trusted | BOOLEAN | No | FALSE | — | ❌ | True if the device has completed full verification |
| last_activity_at | TIMESTAMPTZ | No | NOW() | — | ✅ | Timestamp of the last user action in CineMatch |
| created_at | TIMESTAMPTZ | No | NOW() | Immutable | ❌ | Session metadata record creation timestamp |
| revoked_at | TIMESTAMPTZ | Yes | NULL | Must be after created_at | ✅ | Revocation timestamp (NULL means active) |

## Notes

### Ownership & Separation of Concerns
- **Core Authentication:** Handled exclusively by Supabase Auth (tokens, credentials, verification, actual login session).
- **Application Session Metadata:** The `user_sessions` table tracks application-level metadata (device naming, device trust state, security audits, active device list) rather than replacing or duplicating Supabase's authentication state.
- Decoupling `id` (using `gen_random_uuid()`) ensures our application schema is independent of Supabase's internal session ID formats.

### Expiration
- Following **Principle 5 (Dynamic over Static)**, we calculate expiration dynamically (`last_activity_at + 90 days`). We do not store a static `expires_at` column.
- The inactivity timeout is set to **90 days** to accommodate devices that are accessed less frequently (e.g., home desktops or secondary laptops) without forcing premature logouts.

### Security & Privacy
- `last_ip_address` is retained strictly for security audit purposes (e.g., detecting impossible travel anomalies between logins) and must never be used for recommendations.
- Retaining session records via `revoked_at` instead of hard deleting allows CineMatch to maintain security logs and let users inspect their active/past device history.

## Open Questions

- Should we automatically update `last_activity_at` on every single request, or throttle updates (e.g., maximum once per hour) to reduce write load?
- Should we automatically log the approximate physical location (e.g., country/city) based on the `last_ip_address`?
- Should an administrator be able to revoke sessions, or is this feature restricted to the session owner?

---

# 5. User Preferences Table

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|

## Notes
