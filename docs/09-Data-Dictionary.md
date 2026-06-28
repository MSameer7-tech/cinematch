# CinemaMatch Data Dictionary

Version: 1.0

Status: Draft

---

This document defines every database field used in CinemaMatch. It serves as the authoritative reference for PostgreSQL schema design, Supabase implementation, backend models, API contracts, and frontend integration. Every database column must first be documented here before implementation.

---

# 1. Users Table

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| id | UUID | No | auth.users.id | Primary Key, Foreign Key | References the authenticated user in Supabase Auth |
| display_name | VARCHAR(50) | No | — | Length 2–50 | Public display name shown throughout the application |
| avatar_url | TEXT | Yes | NULL | Valid URL | User profile image |
| created_at | TIMESTAMPTZ | No | NOW() | Immutable | Record creation timestamp |
| updated_at | TIMESTAMPTZ | No | NOW() | Auto-updated | Last profile update timestamp |

## Notes

- Authentication data is managed by Supabase Auth.
- Application-specific profile data is stored in `public.users`.
- `id` is shared with `auth.users` to maintain a one-to-one relationship.
- Email, password hash, and OAuth metadata are not duplicated.

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
