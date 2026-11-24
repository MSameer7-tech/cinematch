import { createContext, useState, useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../features/auth/services/auth.service';
import type { 
  AppUser, 
  GuestUser, 
  AuthState, 
  LoginCredentials, 
  RegisterCredentials 
} from '../features/auth/types/auth.types';

export interface AuthContextType {
  user: AppUser | null;
  guest: GuestUser | null;
  authState: AuthState;
  isInitializing: boolean;
  isSubmitting: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<{ requiresVerification: boolean }>;
  logout: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_CACHE_KEY = 'cinematch_auth_cache';

const getInitialAuthState = (): AuthState => {
  try {
    const cached = localStorage.getItem(AUTH_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && (parsed.user || parsed.guest)) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse error
  }
  return { 
    status: 'LOADING', 
    user: null, 
    guest: null 
  };
};

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthStateInternal] = useState<AuthState>(getInitialAuthState);
  const [isInitializing, setIsInitializing] = useState(() => authState.status === 'LOADING');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setAuthState = (state: AuthState) => {
    setAuthStateInternal(state);
    try {
      if (state.status === 'AUTHENTICATED' || state.status === 'GUEST') {
        localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(state));
      } else if (state.status === 'UNAUTHENTICATED') {
        localStorage.removeItem(AUTH_CACHE_KEY);
      }
    } catch {
      // Ignore storage error
    }
  };

  const user = authState.user;
  const guest = authState.guest;

  const initializeAuth = async () => {
    try {
      // 1.2-second safety timeout race so slow network checks never block the UI
      const timeoutPromise = new Promise<AuthState>((resolve) => 
        setTimeout(() => resolve(
          authState.user || authState.guest
            ? authState
            : { status: 'UNAUTHENTICATED', user: null, guest: null }
        ), 1200)
      );
      const state = await Promise.race([authService.initializeSession(), timeoutPromise]);
      setAuthState(state);
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      if (!authState.user && !authState.guest) {
        setAuthState({ status: 'UNAUTHENTICATED', user: null, guest: null });
      }
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initializeAuth();

    // Listen for real-time auth changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;
      if (event === 'SIGNED_OUT') {
        try {
          localStorage.removeItem(AUTH_CACHE_KEY);
          sessionStorage.clear();
        } catch {}
        setAuthState({ status: 'UNAUTHENTICATED', user: null, guest: null });
        setIsInitializing(false);
        return;
      }
      if (event === 'SIGNED_IN' && session?.user) {
        initializeAuth();
        return;
      }
      initializeAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsSubmitting(true);
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        setAuthState({ status: 'AUTHENTICATED', user: result.data, guest: null });
      } else {
        throw new Error(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsSubmitting(true);
    try {
      const result = await authService.register(credentials);
      if (result.success) {
        if (!result.data.requiresVerification) {
          setAuthState({ status: 'AUTHENTICATED', user: result.data.user, guest: null });
        } else {
          setAuthState({ status: 'UNAUTHENTICATED', user: null, guest: null });
        }
        return { requiresVerification: result.data.requiresVerification };
      } else {
        throw new Error(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    setIsSubmitting(true);
    try {
      try {
        localStorage.removeItem(AUTH_CACHE_KEY);
        sessionStorage.clear();
        document.cookie = 'cinematch_guest_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;';
        document.cookie = 'cinematch_guest_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      } catch {}
      setAuthState({ status: 'UNAUTHENTICATED', user: null, guest: null });
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const continueAsGuest = async () => {
    setIsSubmitting(true);
    try {
      const result = await authService.continueAsGuest();
      if (result.success) {
        setAuthState({ status: 'GUEST', user: null, guest: result.data });
      } else {
        setAuthState({ status: 'UNAUTHENTICATED', user: null, guest: null });
        throw new Error(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsSubmitting(true);
    try {
      const result = await authService.loginWithGoogle();
      if (!result.success) {
        throw new Error(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshSession = async () => {
    await initializeAuth();
  };

  return (
    <AuthContext.Provider value={{
      user,
      guest,
      authState,
      isInitializing,
      isSubmitting,
      login,
      loginWithGoogle,
      register,
      logout,
      continueAsGuest,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};
