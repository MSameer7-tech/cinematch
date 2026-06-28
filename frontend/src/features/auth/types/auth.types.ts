export type AccountStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'DELETED';

/**
 * Represents a registered authenticated CineMatch user.
 * Aligns with public.users schema.
 */
export interface AppUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string | null;
  deletionRequestedAt: string | null;
  deletedAt: string | null;
}

/**
 * Represents an anonymous guest session.
 * Aligns with public.guest_sessions schema.
 */
export interface GuestUser {
  id: string;
  sessionToken: string; // SHA-256 hash of browser cookie token stored on DB
  createdAt: string;
  lastActivityAt: string;
  migratedToUserId: string | null;
  migratedAt: string | null;
}

/**
 * Represents the unified application authentication state.
 */
export type AuthState =
  | { status: 'LOADING'; user: null; guest: null }
  | { status: 'UNAUTHENTICATED'; user: null; guest: null }
  | { status: 'GUEST'; user: null; guest: GuestUser }
  | { status: 'AUTHENTICATED'; user: AppUser; guest: null };

/**
 * Credentials required for standard Email + Password login.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Credentials required for standard Email + Password registration.
 */
export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
}
