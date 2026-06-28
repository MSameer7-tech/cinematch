import type { 
  AppUser, 
  GuestUser, 
  AuthState, 
  LoginCredentials, 
  RegisterCredentials 
} from '../types/auth.types';

/**
 * Authentication service stub handling Supabase Auth and database operations.
 */
export const authService = {
  /**
   * Log in a user with email and password.
   */
  async login(_credentials: LoginCredentials): Promise<AppUser> {
    throw new Error('Method login() not implemented.');
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
