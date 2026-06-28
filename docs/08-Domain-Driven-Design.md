# Domain-Driven Design (DDD)

**Project:** CineMatch

**Version:** 1.0

**Status:** Draft

---

## 1. Purpose

This document defines the core business domains, business objects, responsibilities, and relationships within CineMatch.

The purpose of this document is to bridge the gap between the Functional Requirements Specification (FRS) and the Database Design.

This document describes what exists in the business, independent of databases, APIs, or implementation details.

It serves as the primary reference for:

- Database Design
- API Design
- Backend Services
- Frontend Data Models
- Future Feature Expansion

---

## 2. Core Domains

### Identity

Responsible for authentication, user accounts, guest sessions, onboarding, and account security.

---

### Catalog

Responsible for movies, genres, actors, directors, production companies, languages, keywords, trailers, and metadata.

---

### Discovery

Responsible for searching, browsing, filtering, sorting, trending, and movie exploration.

---

### Personalization

Responsible for ratings, watchlists, likes, dislikes, watched history, user preferences, recommendations, and recommendation scoring.

---

### Analytics

Responsible for viewing statistics, user insights, recommendation performance, and yearly summaries.

---

### Social

Responsible for reviews, comments, custom lists, user follows, and community interactions.

---

### Platform

Responsible for notifications, administration, synchronization jobs, audit logs, and platform settings.

---

# 3. Business Objects

## 3.1 User

### Purpose

Represents a registered CineMatch user who can interact with the platform through authentication, personalization, and movie discovery features.

The User is the central business object of the system.

### Responsibilities

The User is responsible for:

- Authenticating into CineMatch.
- Managing profile information.
- Completing onboarding.
- Rating movies.
- Managing watchlists.
- Marking movies as watched.
- Receiving personalized recommendations.
- Managing account security.
- Managing connected authentication providers.

### Owned Data

The User owns the following business data:

- Profile Information
- Authentication Credentials
- User Preferences
- Ratings
- Watchlists
- Watch History
- Active Sessions
- Notification Preferences
- Personalized Recommendation Profile

### Domain Events

The User can produce the following business events:

- User Registered
- Email Verified
- User Logged In
- User Logged Out
- Guest Session Migrated
- Password Changed
- Profile Updated
- Onboarding Completed
- Account Scheduled for Deletion
- Account Restored
- Account Permanently Deleted

These events will later trigger recommendation updates, analytics, notifications, and background jobs.

### Collaborates With

The User interacts with:

- Guest Session
- OAuth Account
- User Session
- Movie
- Rating
- Watchlist
- Watch History
- User Preferences
- Recommendation
- Notification

### Lifecycle

Guest
↓
Registered
↓
Verified
↓
Onboarded
↓
Active
↓
Inactive
↓
Scheduled for Deletion
↓
Deleted

### Business Rules

- Every registered user has a unique internal ID.
- Every email address must be unique.
- Users authenticate through Email or Google.
- Guest users can become registered users.
- User activity must be preserved during guest migration.
- Users may remain signed in on multiple devices.
- Password changes invalidate all active sessions except the current session.
- Account deletion enters a 90-day recovery period before permanent deletion.

### Future Extensions

Future versions may support:

- Premium subscriptions.
- Public profiles.
- Friends and followers.
- Movie clubs.
- Shared watchlists.
- Achievement badges.
- AI-powered taste summaries.

---

## 3.2 Guest Session

### Purpose

A Guest Session represents a temporary anonymous identity that allows users to access CineMatch without creating an account. It enables personalized recommendations and preserves user activity until the user registers or the session expires.

### Responsibilities

The Guest Session is responsible for:

- Allowing anonymous access to CineMatch.
- Storing temporary user activity.
- Maintaining a temporary watchlist.
- Storing temporary ratings.
- Generating personalized recommendations.
- Tracking browsing behavior.
- Supporting migration to a registered account.
- Managing guest session lifecycle.

### Owned Data

The Guest Session owns the following business data:

- Watchlist
- Ratings
- Likes
- Dislikes
- Search History
- Click History
- Recommendation Profile
- Recently Viewed
- Search Filters

### Collaborates With

The Guest Session interacts with:

- User
- Movie
- Rating
- Watchlist
- Recommendation Engine
- Search
- Recommendation Profile

### Lifecycle

Created
↓
Active
↓
Inactive
↓
Migrated
↓
Archived
↓
Deleted

A Guest Session expires after 60 consecutive days of inactivity. Any activity resets the inactivity timer.

### Business Rules

- Every Guest Session is identified by a unique UUID.
- The UUID is stored in a secure browser cookie.
- A Guest Session is identified by a secure browser cookie and is intended to be used from a single browser instance. Copying or sharing the cookie is unsupported and may invalidate the session.
- Guest data is moved, not copied, during migration.
- A Guest Session can be migrated only once.
- Expired Guest Sessions are automatically deleted after the retention period.

### Domain Events

- Guest Session Created
- Movie Rated
- Movie Added to Watchlist
- Movie Removed from Watchlist
- Recommendation Updated
- Guest Session Migrated
- Guest Session Expired

### Invariants

- Every Guest Session has exactly one UUID.
- A migrated Guest Session cannot be migrated again.
- An expired Guest Session cannot be restored.
- A Guest Session cannot exist without its browser identifier.
- A Guest Session cannot belong to multiple users.

### Future Extensions

Future versions may support:

- Temporary cloud backup.
- QR-code session transfer.
- Guest-to-guest migration.
- Cross-device guest synchronization (future research).
- Automatic guest profile merging.

---

## 3.3 OAuth Account

### Purpose

Represents an external authentication provider linked to a CineMatch user. It supports Google Sign-In today and is designed to support other providers like Apple, GitHub, and Microsoft in the future, keeping provider-specific information separate from the User object.

### Responsibilities

The OAuth Account is responsible for:

- Authenticating using OAuth providers.
- Linking external accounts.
- Unlinking external accounts.
- Storing provider identity.
- Verify linked providers.
- Record authentication history.

### Owned Data

The OAuth Account owns the following business data:

- Provider Name
- Provider User ID
- Provider Email
- Provider Display Name
- Provider Avatar URL
- Linked Date
- Last Authentication Time
- Verification Status

### Collaborates With

The OAuth Account interacts with:

- User
- User Session
- Authentication Service

### Lifecycle

Linked
↓
Active
↓
Re-authenticated
↓
Unlinked

### Business Rules

- One provider account can only belong to one CineMatch user.
- Multiple providers may be linked to a single user in future versions.
- Provider email must match the authenticated identity.
- Google accounts don't require additional email verification.
- Re-authentication is required before unlinking the last authentication provider.

### Domain Events

- OAuth Account Linked
- OAuth Login Successful
- OAuth Login Failed
- OAuth Account Unlinked
- Provider Re-authenticated

### Invariants

- Every OAuth Account belongs to exactly one User.
- A provider account cannot be linked to multiple users.
- Provider identity cannot change without verification.

### Future Extensions

Future versions may support:

- Apple Sign-In
- GitHub Login
- Microsoft Login
- Discord Login
- Multi-provider authentication

---

## 3.4 User Session

### Purpose

Represents an active, authenticated connection between a registered User and the CineMatch platform. It tracks session details, device context, and expiration to ensure secure, concurrent usage across multiple client applications.

### Responsibilities

The User Session is responsible for:

- Managing user authentication state.
- Validating session activity.
- Tracking device and location context.
- Supporting session revocation.
- Handling idle session timeouts.
- Recording session history and duration.

### Owned Data

The User Session owns the following business data:

- Session ID (UUID)
- User ID
- Auth Provider (Email / Google)
- Device Info (User Agent, OS, Device Type)
- IP Address
- Approximate Location (City/Country)
- Created Timestamp
- Last Active Timestamp
- Expiry Timestamp
- Revocation Status
- Revocation Reason

### Collaborates With

The User Session interacts with:

- User
- OAuth Account
- Authentication Service

### Lifecycle

Created
↓
Active
↓
Idle
↓
Expired
↓
Revoked
↓
Archived

### Business Rules

- A session is identified by a secure, cryptographically random session token.
- Users may have multiple concurrent active sessions.
- Sessions automatically expire after a configurable idle time (e.g., 30 days).
- Modifying a user's password immediately invalidates all active sessions except the current one.
- The session token must be transmitted via secure, HTTP-only, SameSite cookies or bearer headers.

### Domain Events

- User Session Started
- User Session Active
- User Session Expired
- User Session Revoked
- User Session Terminated

### Invariants

- Every User Session must be linked to exactly one registered User.
- A session cannot be active if its expiry timestamp has passed.
- A revoked session cannot be transitioned back to active.

### Future Extensions

Future versions may support:

- Geolocation anomaly detection (e.g., signing in from two distant countries).
- Device fingerprinting and trust scoring.
- WebAuthn / Passkeys authentication.
- Single Sign-Out across federated services.

---

## 3.5 User Preferences

### Purpose

User Preferences represent the explicit choices made by a registered user to personalize their CineMatch experience. These preferences provide the recommendation engine with an initial understanding of the user's interests before sufficient behavioral data has been collected. These are explicit preferences, not learned behaviors.

### Responsibilities

The User Preferences object is responsible for:

- Storing favorite genres.
- Storing preferred languages.
- Storing preferred runtime.
- Storing favorite actors.
- Storing favorite directors.
- Storing content preferences.
- Storing onboarding selections.
- Updating recommendation preferences.
- Supporting preference editing.

### Owned Data

The User Preferences object owns the following business data:

- Favorite Genres
- Preferred Languages
- Preferred Runtime
- Favorite Actors
- Favorite Directors
- Preferred Release Years
- Content Preferences
- Recommendation Settings

### Collaborates With

The User Preferences object interacts with:

- User
- Movie
- Genre
- Actor
- Director
- Recommendation Engine

### Lifecycle

Created
↓
Updated
↓
Optimized
↓
Archived
↓
Deleted

### Business Rules

- Every registered user has one User Preferences object.
- Guest users do not have User Preferences.
- Preferences can be modified at any time.
- Recommendation settings affect future recommendations only.
- Explicit preferences take precedence during cold-start recommendations.

### Domain Events

- Preferences Created
- Genre Added
- Genre Removed
- Language Changed
- Recommendation Settings Updated

### Invariants

- Every User Preferences object belongs to exactly one User.
- Preferences cannot exist without a User.
- A preferred genre must exist in the movie catalog.
- Runtime preferences must fall within supported limits.

### Future Extensions

Future versions may support:

- Mood-based preferences.
- Seasonal preferences.
- Time-of-day preferences.
- Family profiles.
- Regional preferences.
- Privacy controls for recommendation data.
