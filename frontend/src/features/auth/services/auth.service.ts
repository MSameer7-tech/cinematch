import { supabase } from '../../../lib/supabase';
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
 * Authentication service stub handling Supabase Auth and database operations.
 */
export const authService = {
  /**
   * Log in a user with email and password.
   */
  async login(credentials: LoginCredentials): Promise<AppUser> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        throw mapAuthError(error);
      }

      if (!data.user) {
        throw new Error('Sign in succeeded but no user was returned.');
      }

      // Fetch the public profile from public.users
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw new Error('Failed to load your user profile.');
      }

      return {
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
    } catch (err: any) {
      console.error('Login service failure:', err);
      throw err;
    }
  },

  /**
   * Register a new user with email, password, and public display name.
   */
  async register(_credentials: RegisterCredentials): Promise<AppUser> {
    throw new Error('Method register() not implemented.');
  },

  /**
   * Log out the currently authenticated user or clear guest session.
   */
  async logout(): Promise<void> {
    throw new Error('Method logout() not implemented.');
  },

  /**
   * Initiate Google OAuth sign-in flow.
   */
  async loginWithGoogle(): Promise<void> {
    throw new Error('Method loginWithGoogle() not implemented.');
  },

  /**
   * Create an anonymous guest session.
   */
  async continueAsGuest(): Promise<GuestUser> {
    throw new Error('Method continueAsGuest() not implemented.');
  },

  /**
   * Send a password reset link to the user's email.
   */
  async forgotPassword(_email: string): Promise<void> {
    throw new Error('Method forgotPassword() not implemented.');
  },

  /**
   * Complete password reset with a new password.
   */
  async resetPassword(_password: string): Promise<void> {
    throw new Error('Method resetPassword() not implemented.');
  },

  /**
   * Fetch the active registered user's profile metadata.
   */
  async getCurrentUser(): Promise<AppUser> {
    throw new Error('Method getCurrentUser() not implemented.');
  },

  /**
   * Check for an existing active guest session.
   */
  async getGuestSession(): Promise<GuestUser | null> {
    throw new Error('Method getGuestSession() not implemented.');
  },

  /**
   * Evaluates the current Supabase and guest sessions to determine the AuthState.
   */
  async initializeSession(): Promise<AuthState> {
    throw new Error('Method initializeSession() not implemented.');
  }
};
