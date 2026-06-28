# Requirement Traceability Matrix (RTM)

**Project:** CineMatch

**Version:** 1.0

**Status:** Draft

---

## Purpose

The Requirement Traceability Matrix (RTM) maps every functional requirement to its corresponding database tables, API endpoints, backend services, frontend screens, test cases, and implementation status.

The RTM ensures that every requirement can be traced throughout the entire software development lifecycle.

---

# Authentication Module

| Requirement | Priority | Feature | Database | API | Backend Service | Frontend | Test Case | Status | GitHub Issue |
|-------------|----------|---------|----------|-----|-----------------|----------|-----------|--------|--------------|
| FR-001 | High | Guest Mode | guest_sessions | POST /auth/guest | GuestService | Welcome Screen | TC-001 | 🟡 Planned | - |
| FR-002 | High | Email Registration | users | POST /auth/register | AuthService | Register Screen | TC-002 | 🟡 Planned | - |
| FR-003 | High | Google Sign-In | oauth_accounts | POST /auth/google | OAuthService | Login Screen | TC-003 | 🟡 Planned | - |
| FR-004 | High | Guest Migration | guest_sessions, users | POST /auth/migrate | GuestMigrationService | Login Flow | TC-004 | 🟡 Planned | - |
| FR-005 | Medium | Session Management | user_sessions | GET /auth/sessions | SessionService | Account Settings | TC-005 | 🟡 Planned | - |
| FR-006 | High | Password Recovery | password_reset_tokens | POST /auth/forgot-password | PasswordService | Forgot Password | TC-006 | 🟡 Planned | - |
| FR-007 | Medium | Profile Management | users, user_preferences | PATCH /users/profile | ProfileService | Profile Screen | TC-007 | 🟡 Planned | - |
| FR-008 | Medium | Account Deletion | users | DELETE /users/account | AccountService | Settings Screen | TC-008 | 🟡 Planned | - |
| FR-009 | High | User Onboarding | user_preferences | POST /users/onboarding | OnboardingService | Onboarding Flow | TC-009 | 🟡 Planned | - |
| FR-010 | Low | Google Account Management | oauth_accounts | PATCH /auth/google | OAuthService | Connected Accounts | TC-010 | 🟡 Planned | - |
