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

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|

## Notes

---

# 4. User Sessions Table

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|

## Notes

---

# 5. User Preferences Table

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|

## Notes
