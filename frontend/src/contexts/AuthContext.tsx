import { createContext, useState, useEffect, useRef } from 'react';
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
  const authStateRef = useRef<AuthState>(authState);
  const isOAuthCallback =
    typeof window !== 'undefined' &&
    (window.location.search.includes('code=') ||
      window.location.hash.includes('access_token=') ||
      window.location.hash.includes('refresh_token='));

  const [isInitializing, setIsInitializing] = useState(
    () => authState.status === 'LOADING' || isOAuthCallback
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setAuthState = (state: AuthState) => {
    authStateRef.current = state;
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

  const syncUserFromSession = async (sessionUser: any) => {
    try {
      const result = await authService.getCurrentUser(sessionUser);
      if (result.success) {
        setAuthState({ status: 'AUTHENTICATED', user: result.data, guest: null });
      }
    } catch (err) {
      console.error('Failed to sync user from session:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  const initializeAuth = async () => {
    try {
      const timeoutMs = isOAuthCallback ? 10000 : 3000;
      const timeoutPromise = new Promise<AuthState>((resolve) =>
        setTimeout(() => {
          const current = authStateRef.current;
          resolve(
            current.user || current.guest
              ? current
              : { status: 'UNAUTHENTICATED', user: null, guest: null }
          );
        }, timeoutMs)
      );
      const state = await Promise.race([authService.initializeSession(), timeoutPromise]);
      // Only apply if we didn't already authenticate via onAuthStateChange
      if (state.status === 'AUTHENTICATED' || authStateRef.current.status !== 'AUTHENTICATED') {
        setAuthState(state);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      const current = authStateRef.current;
      if (!current.user && !current.guest) {
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
      if (event === 'SIGNED_OUT') {
        try {
          localStorage.removeItem(AUTH_CACHE_KEY);
          sessionStorage.clear();
        } catch {}
        setAuthState({ status: 'UNAUTHENTICATED', user: null, guest: null });
        setIsInitializing(false);
        return;
      }

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session?.user) {
        syncUserFromSession(session.user);
        return;
      }

      if (event === 'INITIAL_SESSION') return;
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
