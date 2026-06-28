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

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|

## Notes

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
