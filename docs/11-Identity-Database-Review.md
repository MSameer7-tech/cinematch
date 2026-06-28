# Identity Database Review

## Review Status

In Progress

---

## 1. Users

### Review Checklist
- [x] Satisfies business rules
- [x] No duplicated authentication data
- [x] Derived values avoided
- [x] Clear ownership for every column
- [x] Relationships properly defined
- [x] Scalable for millions of users
- [x] Supports future features

### Changes Made
- Added `deletion_requested_at`
- Added `deleted_at`
- Clarified `last_seen_at` semantics
- Clarified `updated_at` behavior
- Defined avatar ownership

### Status
✅ Approved

## 2. Guest Sessions

### Review Checklist
- [x] Satisfies business rules
- [x] No duplicated authentication data
- [x] Derived values avoided
- [x] Clear ownership for every column
- [x] Relationships properly defined
- [x] Scalable for millions of users
- [x] Supports future features

### Changes Made
- Hashed `session_token` with SHA-256 for secure DB storage
- Removed obsolete `expires_at` column (calculated dynamically)
- Removed `recommendation_profile_id` placeholder
- Configured `ON DELETE SET NULL` on `migrated_to_user_id` to preserve guest records if user accounts are deleted
- Defined daily cleanup policy for inactive sessions (>60 days)
- Updated DDD business rules to reflect browser cookie limitations instead of rigid single-device restriction

### Status
✅ Approved

## 3. OAuth Accounts

### Review Checklist
- [x] Business rules satisfied
- [x] No duplicated authentication data
- [x] Composite unique constraint defined
- [x] Proper foreign key behavior
- [x] Secure token handling
- [x] Scalable design

### Notes
- Composite unique constraint on `(provider, provider_user_id)` ensures data integrity.
- `ON DELETE CASCADE` is set on the user relationship to cleanly delete OAuth records upon permanent user deletion.
- OAuth tokens remain managed exclusively by Supabase Auth (no token storage in public schema).
- Re-authentication before unlinking the last login provider is enforced at the application service layer.

### Status
✅ Approved

## 4. User Sessions

## 5. User Preferences

## 6. Relationships

## 7. Security

## 8. Performance

## 9. Final Decision
