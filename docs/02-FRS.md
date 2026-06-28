# Functional Requirements Specification (FRS)

**Project:** CineMatch

**Version:** 1.0

**Status:** Draft

---

# 1. Introduction

## 1.1 Purpose

This document defines the functional requirements for CineMatch. It describes the features, behaviors, and capabilities that the system must provide to users and administrators.

The Functional Requirements Specification serves as the primary reference for database design, API development, frontend implementation, backend development, testing, and future product enhancements.

## 1.2 Scope

CineMatch is a movie discovery and recommendation platform designed to help users discover movies through intelligent recommendations based on their preferences and interactions.

The platform supports guest users, registered users, and administrators while providing personalized recommendations, watchlists, ratings, analytics, and advanced search capabilities.

---

# 2. User Roles

## 2.1 Guest User

A visitor who accesses CineMatch without creating an account.

Guests can browse movies, search the catalog, receive basic recommendations, and create a temporary watchlist. Guest data is stored temporarily and can later be transferred to a registered account.

---

## 2.2 Registered User

A user who has created an account using email or Google Sign-In.

Registered users receive personalized recommendations and can rate movies, maintain watchlists, mark movies as watched, create custom lists, view personal analytics, and manage their profile.

---

## 2.3 Administrator

Administrators manage the platform.

They can synchronize movie data, moderate content, manage users, monitor system health, configure platform settings, and access administrative analytics.

---

# 3. Functional Modules

The CineMatch platform is divided into the following functional modules.

## 3.1 Authentication

Responsible for user registration, login, guest sessions, account management, and authentication.

---

## 3.2 Movie Catalog

Responsible for storing and presenting movie information including metadata, genres, actors, directors, languages, production companies, and trailers.

---

## 3.3 Search & Discovery

Responsible for movie search, filtering, sorting, trending content, and fuzzy search.

---

## 3.4 Personalization

Responsible for ratings, likes, dislikes, watchlists, watched history, recommendations, and user preferences.

---

## 3.5 Analytics

Responsible for user statistics, viewing history, recommendation insights, and yearly viewing summaries.

---

## 3.6 Social (Future)

Responsible for reviews, comments, following users, shared lists, and community features.

---

## 3.7 Notifications

Responsible for system notifications, reminders, recommendation alerts, and watchlist updates.

---

## 3.8 Administration

Responsible for movie synchronization, user moderation, audit logs, monitoring, and platform configuration.

---

# 4. Functional Requirements

---

## Authentication Module

### FR-001 - Continue as Guest

**Priority:** High

**Description**

The system shall allow users to access CineMatch without creating an account.

Guest users can browse movies, search the catalog, receive recommendations, create a temporary watchlist, rate movies, and mark movies as watched.

Guest activity shall be stored temporarily and linked to a guest session.

**Preconditions**

- User has not signed in.
- Guest session does not already exist.

**Flow**

1. User selects **Continue as Guest**.
2. System creates a Guest Session.
3. Guest enters the application.
4. User interactions are stored against the Guest Session.

**Success Criteria**

- Guest can immediately use CineMatch.
- Guest preferences begin influencing recommendations.

**Business Rules**

- Guest data is temporary.
- Guest data can later be migrated to a registered account.
- Guest sessions expire after a configurable period of inactivity.

### FR-002 - Email Registration

**Priority:** High

**Description**

Users shall be able to create an account using an email address and password.

Email verification is mandatory before accessing the application.

**Preconditions**

- Email is not already registered.

**Flow**

1. User enters Display Name.
2. User enters Email.
3. User creates Password.
4. System sends verification email.
5. User verifies email.
6. Account becomes active.

**Success Criteria**

- Verified account is created.
- User can sign in.

**Business Rules**

- Email must be unique.
- Password must satisfy security requirements.
- Unverified accounts cannot access CineMatch.

### FR-003 - Google Sign-In

**Priority:** High

**Description**

Users shall be able to authenticate using their Google account.

Google authenticated users do not require separate email verification.

**Preconditions**

- User has a valid Google account.

**Flow**

1. User selects Continue with Google.
2. Google authentication is completed.
3. CineMatch creates or links the account.
4. User enters the onboarding flow.

**Success Criteria**

- User is signed in successfully.

**Business Rules**

- Google email must remain verified.
- One Google account can only be linked to one CineMatch account.

### FR-004 - Guest Account Migration

**Priority:** High

**Description**

When a guest user registers or signs in, the system shall migrate all guest activity to the registered account.

**Data to Migrate**

- Watchlist
- Ratings
- Likes
- Dislikes
- Watched History
- Search History
- Recommendation Profile

**Success Criteria**

No guest activity is lost during migration.

**Business Rules**

Migration shall occur only once for each guest session.

### FR-005 - Session Management

**Priority:** Medium

**Description**

Registered users shall be able to remain signed in on multiple devices simultaneously.

Each device shall have its own independent authenticated session.

**Business Rules**

- Each login creates a new session.
- Users may revoke individual sessions.
- Password changes invalidate all existing sessions except the current one.

### FR-006 - Password Recovery

**Priority:** High

**Description**

Users shall be able to reset their password through a secure email verification process.

**Flow**

1. User selects Forgot Password.
2. User enters email.
3. System sends password reset link.
4. User creates a new password.
5. Previous sessions are invalidated.
6. User signs in again.

**Business Rules**

Password reset links expire after a limited time.

### FR-007 - Profile Management

**Priority:** Medium

Users shall be able to update:

- Display Name
- Email Address
- Password
- Profile Picture
- Favorite Genres
- Preferred Languages

Changing an email address requires password confirmation or Google re-authentication.

### FR-008 - Account Deletion

**Priority:** Medium

Users shall be be able to permanently delete their account.

**Flow**

1. User requests account deletion.
2. Account becomes inactive.
3. A 90-day recovery period begins.
4. User may restore the account during this period.
5. After 90 days, all personal data is permanently deleted.

**Business Rules**

The deletion timer cannot be bypassed by administrators except in legal or security-related situations.

### FR-009 - User Onboarding

**Priority:** High

After successful registration, users shall complete a short onboarding process.

**Required**

- Select at least 3 favorite genres.

**Optional**

- Preferred Languages
- Favorite Actors
- Favorite Directors

Users may skip all optional steps.

The onboarding information shall be used to generate initial recommendations before sufficient behavioral data is available.

### FR-010 - Google Account Management

**Priority:** Low

Users shall be able to replace their linked Google account.

**Flow**

1. Add new Google account.
2. Complete Google authentication.
3. Set new account as primary.
4. Remove previous account.

Direct replacement without verification shall not be allowed.

---

# 5. Business Rules

---

# 6. Validation Rules

---

# 7. Future Requirements
