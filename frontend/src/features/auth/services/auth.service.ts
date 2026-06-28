import { supabase } from '../../../lib/supabase';
import type { ServiceResult } from '../../../types/common';
import type { 
  AppUser, 
  GuestUser, 
  AuthState, 
  LoginCredentials, 
  RegisterCredentials 
} from '../types/auth.types';

const mapAuthError = (error: any): Error => {
  const message = error?.message || '';
  if (message.toLowerCase().includes('invalid login credentials')) {
    return new Error('The email or password you entered is incorrect.');
  }
  if (message.toLowerCase().includes('email not confirmed')) {
    return new Error('Please verify your email address before signing in.');
  }
  return new Error(message || 'An unexpected error occurred during sign in.');
};

/**
 * SHA-256 hash helper using Web Crypto API.
 */
const hashToken = async (token: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Authentication service handling Supabase Auth and database operations.
 */
export const authService = {
  /**
   * Log in a user with email and password.
   */
  async login(credentials: LoginCredentials): Promise<ServiceResult<AppUser>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        return { success: false, error: mapAuthError(error).message };
      }

      if (!data.user) {
        return { success: false, error: 'Sign in succeeded but no user was returned.' };
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        return { success: false, error: 'Failed to load your user profile.' };
      }

      const appUser: AppUser = {
        id: profile.id,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        onboardingCompleted: profile.onboarding_completed,
        accountStatus: profile.account_status,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        lastSeenAt: profile.last_seen_at,
        deletionRequestedAt: profile.deletion_requested_at,
        deletedAt: profile.deleted_at
      };

      return { success: true, data: appUser };
    } catch (err: any) {
      console.error('Login service failure:', err);
      return { success: false, error: err?.message || 'An unexpected error occurred during login.' };
    }
  },

  /**
   * Register a new user with email, password, and public display name.
   */
  async register(credentials: RegisterCredentials): Promise<ServiceResult<AppUser>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            display_name: credentials.displayName
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Sign up succeeded but no user details were returned.' };
      }

      const appUser: AppUser = {
        id: data.user.id,
        displayName: credentials.displayName,
        avatarUrl: null,
        onboardingCompleted: false,
        accountStatus: 'ACTIVE',
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at || data.user.created_at,
        lastSeenAt: null,
        deletionRequestedAt: null,
        deletedAt: null
      };

      return { success: true, data: appUser };
    } catch (err: any) {
      console.error('Registration service failure:', err);
      return { success: false, error: err?.message || 'An unexpected error occurred during registration.' };
    }
  },

  /**
   * Resend the email verification link.
   */
  async resendVerificationEmail(email: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: undefined };
    } catch (err: any) {
      console.error('Resend verification failure:', err);
      return { success: false, error: err?.message || 'Failed to resend verification email.' };
    }
  },

  /**
   * Log out the currently authenticated user or clear guest session.
   */
  async logout(): Promise<ServiceResult<void>> {
    try {
      await supabase.auth.signOut();
      document.cookie = 'cinematch_guest_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
      return { success: true, data: undefined };
    } catch (err: any) {
      console.error('Logout error:', err);
      return { success: false, error: err?.message || 'Failed to log out.' };
    }
  },

  /**
   * Initiate Google OAuth sign-in flow.
   */
  async loginWithGoogle(): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: undefined };
    } catch (err: any) {
      console.error('Google login service failure:', err);
      return { success: false, error: err?.message || 'An unexpected error occurred.' };
    }
  },

  /**
   * Create an anonymous guest session.
   */
  async continueAsGuest(): Promise<ServiceResult<GuestUser>> {
    try {
      const rawToken = crypto.randomUUID();
      const hashedToken = await hashToken(rawToken);

      const { data: guestSession, error } = await supabase
        .from('guest_sessions')
        .insert({
          session_token: hashedToken
        })
        .select('*')
        .single();

      if (error) {
        return { success: false, error: error.message || 'Failed to initialize guest session in DB.' };
      }

      // Set cookie valid for 60 days
      document.cookie = `cinematch_guest_token=${rawToken}; path=/; max-age=${60 * 24 * 60 * 60}; SameSite=Lax; Secure`;

      const guestUser: GuestUser = {
        id: guestSession.id,
        sessionToken: guestSession.session_token,
        createdAt: guestSession.created_at,
        lastActivityAt: guestSession.last_activity_at,
        migratedToUserId: guestSession.migrated_to_user_id,
        migratedAt: guestSession.migrated_at
      };

      return { success: true, data: guestUser };
    } catch (err: any) {
      console.error('Guest session failure:', err);
      return { success: false, error: err?.message || 'An unexpected error occurred.' };
    }
  },

  /**
   * Send a password reset link to the user's email.
   */
  async forgotPassword(_email: string): Promise<ServiceResult<void>> {
    throw new Error('Method forgotPassword() not implemented.');
  },

  /**
   * Complete password reset with a new password.
   */
  async resetPassword(_password: string): Promise<ServiceResult<void>> {
    throw new Error('Method resetPassword() not implemented.');
  },

  /**
   * Fetch the active registered user's profile metadata.
   */
  async getCurrentUser(): Promise<ServiceResult<AppUser>> {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (!supabaseUser) {
        return { success: false, error: 'No active session found.' };
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        return { success: false, error: 'Failed to load user profile.' };
      }

      const appUser: AppUser = {
        id: profile.id,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        onboardingCompleted: profile.onboarding_completed,
        accountStatus: profile.account_status,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        lastSeenAt: profile.last_seen_at,
        deletionRequestedAt: profile.deletion_requested_at,
        deletedAt: profile.deleted_at
      };

      return { success: true, data: appUser };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to fetch user profile.' };
    }
  },

  /**
   * Check for an existing active guest session.
   */
  async getGuestSession(): Promise<ServiceResult<GuestUser | null>> {
    try {
      const cookies = document.cookie.split(';');
      const guestCookie = cookies.find(c => c.trim().startsWith('cinematch_guest_token='));
      if (!guestCookie) {
        return { success: true, data: null };
      }

      const rawToken = guestCookie.split('=')[1].trim();
      const hashedToken = await hashToken(rawToken);

      const { data: guestSession, error } = await supabase
        .from('guest_sessions')
        .select('*')
        .eq('session_token', hashedToken)
        .single();

      if (error || !guestSession) {
        // Invalid or missing from DB, clear the cookie
        document.cookie = 'cinematch_guest_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
        return { success: true, data: null };
      }

      // Check 60-day expiration
      const lastActivity = new Date(guestSession.last_activity_at).getTime();
      const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;
      if (Date.now() - lastActivity > sixtyDaysInMs) {
        document.cookie = 'cinematch_guest_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
        return { success: true, data: null };
      }

      // Update activity timestamp in DB
      const now = new Date().toISOString();
      await supabase
        .from('guest_sessions')
        .update({ last_activity_at: now })
        .eq('id', guestSession.id);

      const guestUser: GuestUser = {
        id: guestSession.id,
        sessionToken: guestSession.session_token,
        createdAt: guestSession.created_at,
        lastActivityAt: now,
        migratedToUserId: guestSession.migrated_to_user_id,
        migratedAt: guestSession.migrated_at
      };

      return { success: true, data: guestUser };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to restore guest session.' };
    }
  },

  /**
   * Evaluates the current Supabase and guest sessions to determine the AuthState.
   */
  async initializeSession(): Promise<AuthState> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const result = await this.getCurrentUser();
        if (result.success) {
          return { status: 'AUTHENTICATED', user: result.data, guest: null };
        }
      }

      const guestResult = await this.getGuestSession();
      if (guestResult.success && guestResult.data) {
        return { status: 'GUEST', user: null, guest: guestResult.data };
      }

      return { status: 'UNAUTHENTICATED', user: null, guest: null };
    } catch (err) {
      console.error('Session initialization failure:', err);
      return { status: 'UNAUTHENTICATED', user: null, guest: null };
    }
  }
};
