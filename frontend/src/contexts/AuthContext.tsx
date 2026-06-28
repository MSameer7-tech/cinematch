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
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({ 
    status: 'LOADING', 
    user: null, 
    guest: null 
  });
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = authState.user;
  const guest = authState.guest;

  const initializeAuth = async () => {
    try {
      const state = await authService.initializeSession();
      setAuthState(state);
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setAuthState({ status: 'UNAUTHENTICATED', user: null, guest: null });
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initializeAuth();

    // Listen for real-time auth changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async () => {
      await initializeAuth();
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
        setAuthState({ status: 'AUTHENTICATED', user: result.data, guest: null });
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
      const result = await authService.logout();
      if (result.success) {
        setAuthState({ status: 'UNAUTHENTICATED', user: null, guest: null });
      } else {
        throw new Error(result.error);
      }
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
