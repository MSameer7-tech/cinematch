import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
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
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({ 
    status: 'LOADING', 
    user: null, 
    guest: null 
  });

  const loading = authState.status === 'LOADING';
  const user = authState.user;
  const guest = authState.guest;

  const initializeAuth = async () => {
    try {
      const state = await authService.initializeSession();
      setAuthState(state);
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setAuthState({ status: 'UNAUTHENTICATED', user: null, guest: null });
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
    setAuthState({ status: 'LOADING', user: null, guest: null });
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        setAuthState({ status: 'AUTHENTICATED', user: result.data, guest: null });
      } else {
        await initializeAuth();
        throw new Error(result.error);
      }
    } catch (error) {
      await initializeAuth();
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setAuthState({ status: 'LOADING', user: null, guest: null });
    try {
      const result = await authService.register(credentials);
      if (result.success) {
        setAuthState({ status: 'AUTHENTICATED', user: result.data, guest: null });
      } else {
        await initializeAuth();
        throw new Error(result.error);
      }
    } catch (error) {
      await initializeAuth();
      throw error;
    }
  };

  const logout = async () => {
    setAuthState({ status: 'LOADING', user: null, guest: null });
    try {
      const result = await authService.logout();
      if (result.success) {
        setAuthState({ status: 'UNAUTHENTICATED', user: null, guest: null });
      } else {
        await initializeAuth();
        throw new Error(result.error);
      }
    } catch (error) {
      await initializeAuth();
      throw error;
    }
  };

  const continueAsGuest = async () => {
    setAuthState({ status: 'LOADING', user: null, guest: null });
    try {
      const result = await authService.continueAsGuest();
      if (result.success) {
        setAuthState({ status: 'GUEST', user: null, guest: result.data });
      } else {
        setAuthState({ status: 'UNAUTHENTICATED', user: null, guest: null });
        throw new Error(result.error);
      }
    } catch (error) {
      setAuthState({ status: 'UNAUTHENTICATED', user: null, guest: null });
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setAuthState({ status: 'LOADING', user: null, guest: null });
    try {
      const result = await authService.loginWithGoogle();
      if (!result.success) {
        await initializeAuth();
        throw new Error(result.error);
      }
    } catch (error) {
      await initializeAuth();
      throw error;
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
      loading,
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
