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

      // Delegate profile fetching/creation to getCurrentUser
      return await this.getCurrentUser();
    } catch (err: any) {
      console.error('Login service failure:', err);
      return { success: false, error: err?.message || 'An unexpected error occurred during login.' };
    }
  },

  /**
   * Register a new user with email, password, and public display name.
   */
  async register(credentials: RegisterCredentials): Promise<ServiceResult<{ user: AppUser; requiresVerification: boolean }>> {
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

      const hasSession = !!data.session;

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

      try {
        await supabase.from('users').upsert({
          id: data.user.id,
          display_name: credentials.displayName,
          avatar_url: null,
          onboarding_completed: false,
          account_status: 'ACTIVE'
        });
      } catch (dbErr) {
        console.warn('User profile upsert warning:', dbErr);
      }

      return { 
        success: true, 
        data: { 
          user: appUser, 
          requiresVerification: !hasSession 
        } 
      };
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
      document.cookie = 'cinematch_guest_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;';
      document.cookie = 'cinematch_guest_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      try {
        localStorage.removeItem('cinematch_auth_cache');
      } catch {}
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

      let guestSession: any = null;

      try {
        const { data, error } = await supabase
          .from('guest_sessions')
          .insert({
            guest_token_hash: hashedToken
          })
          .select('*')
          .single();

        if (!error && data) {
          guestSession = data;
        }
      } catch (e) {
        console.warn('Direct Supabase guest insert error, falling back:', e);
      }

      if (!guestSession) {
        try {
          const res = await fetch('/api/auth/guest', { method: 'POST' });
          if (res.ok) {
            guestSession = await res.json();
          }
        } catch (backendErr) {
          console.warn('Backend guest auth fallback failed:', backendErr);
        }
      }

      if (!guestSession) {
        const now = new Date().toISOString();
        guestSession = {
          id: crypto.randomUUID(),
          guest_token_hash: hashedToken,
          created_at: now,
          last_activity_at: now,
          migrated_to_user_id: null,
          migrated_at: null
        };
      }

      // Set cookie valid for 60 days
      document.cookie = `cinematch_guest_token=${rawToken}; path=/; max-age=${60 * 24 * 60 * 60}; SameSite=Lax;`;

      const guestUser: GuestUser = {
        id: guestSession.id,
        sessionToken: guestSession.guest_token_hash || hashedToken,
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
  async forgotPassword(email: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: undefined };
    } catch (err: any) {
      console.error('Forgot password service failure:', err);
      return { success: false, error: err?.message || 'Failed to send password reset email.' };
    }
  },

  /**
   * Complete password reset with a new password.
   */
  async resetPassword(password: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: undefined };
    } catch (err: any) {
      console.error('Reset password service failure:', err);
      return { success: false, error: err?.message || 'Failed to update password.' };
    }
  },

  /**
   * Fetch the active registered user's profile metadata.
   */
  async getCurrentUser(providedUser?: any): Promise<ServiceResult<AppUser>> {
    try {
      let supabaseUser = providedUser;
      if (!supabaseUser) {
        const { data: { user } } = await supabase.auth.getUser();
        supabaseUser = user;
      }
      if (!supabaseUser) {
        return { success: false, error: 'No active session found.' };
      }

      const displayName = supabaseUser.user_metadata?.display_name || 
                          supabaseUser.user_metadata?.full_name || 
                          supabaseUser.email?.split('@')[0] || 
                          'User';
      const avatarUrl = supabaseUser.user_metadata?.avatar_url || null;

      try {
        const profilePromise = supabase
          .from('users')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        const { data: profile, error: profileError } = await Promise.race([
          profilePromise,
          new Promise<any>((resolve) => setTimeout(() => resolve({ data: null, error: { message: 'Profile fetch timeout' } }), 2500))
        ]);

        if (!profileError && profile) {
          const appUser: AppUser = {
            id: profile.id,
            displayName: profile.display_name || displayName,
            avatarUrl: profile.avatar_url || avatarUrl,
            onboardingCompleted: profile.onboarding_completed ?? false,
            accountStatus: profile.account_status || 'ACTIVE',
            createdAt: profile.created_at || supabaseUser.created_at,
            updatedAt: profile.updated_at || supabaseUser.updated_at || supabaseUser.created_at,
            lastSeenAt: profile.last_seen_at || null,
            deletionRequestedAt: profile.deletion_requested_at || null,
            deletedAt: profile.deleted_at || null
          };
          return { success: true, data: appUser };
        }

        // Try insert fallback
        if (profileError && (profileError.code === 'PGRST116' || profileError.message?.includes('JSON object'))) {
          await supabase.from('users').insert({
            id: supabaseUser.id,
            display_name: displayName,
            avatar_url: avatarUrl,
            onboarding_completed: false,
            account_status: 'ACTIVE'
          });
        }
      } catch (dbErr) {
        console.warn('Profile DB query warning, using auth user metadata:', dbErr);
      }

      // Resilient fallback from verified Supabase session user
      const appUser: AppUser = {
        id: supabaseUser.id,
        displayName,
        avatarUrl,
        onboardingCompleted: false,
        accountStatus: 'ACTIVE',
        createdAt: supabaseUser.created_at,
        updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
        lastSeenAt: null,
        deletionRequestedAt: null,
        deletedAt: null
      };

      return { success: true, data: appUser };
    } catch (err: any) {
      console.error('getCurrentUser unexpected error:', err);
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
      if (!rawToken) {
        return { success: true, data: null };
      }

      const hashedToken = await hashToken(rawToken);

      try {
        const { data: guestSession, error } = await supabase
          .from('guest_sessions')
          .select('*')
          .eq('guest_token_hash', hashedToken)
          .single();

        if (!error && guestSession) {
          const lastActivity = new Date(guestSession.last_activity_at).getTime();
          const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;
          if (Date.now() - lastActivity > sixtyDaysInMs) {
            document.cookie = 'cinematch_guest_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;';
            return { success: true, data: null };
          }

          const now = new Date().toISOString();
          await supabase
            .from('guest_sessions')
            .update({ last_activity_at: now })
            .eq('id', guestSession.id);

          const guestUser: GuestUser = {
            id: guestSession.id,
            sessionToken: guestSession.guest_token_hash,
            createdAt: guestSession.created_at,
            lastActivityAt: now,
            migratedToUserId: guestSession.migrated_to_user_id,
            migratedAt: guestSession.migrated_at
          };

          return { success: true, data: guestUser };
        }
      } catch (dbErr) {
        console.warn('Guest session DB lookup warning:', dbErr);
      }

      const now = new Date().toISOString();
      const guestUser: GuestUser = {
        id: crypto.randomUUID(),
        sessionToken: hashedToken,
        createdAt: now,
        lastActivityAt: now,
        migratedToUserId: null,
        migratedAt: null
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
        const result = await this.getCurrentUser(session.user);
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
