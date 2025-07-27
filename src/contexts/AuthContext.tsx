import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { login as loginService, register as registerService, logout as logoutService, refreshToken as refreshTokenService } from '../services/auth';

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  emailVerified: boolean;
  driverLicense?: string;
  dateOfBirth?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to check token expiration
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Function to handle token refresh
  const handleTokenRefresh = async () => {
    try {
      const success = await refreshTokenService();
      if (!success) {
        // If refresh failed, clear auth state
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      return success;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const storedUser = localStorage.getItem('user');

        if (!accessToken || !refreshToken || !storedUser) {
          setIsLoading(false);
          return;
        }

        // Check if access token is expired
        if (isTokenExpired(accessToken)) {
          console.log('Access token expired, attempting refresh');
          const refreshSuccess = await handleTokenRefresh();
          if (!refreshSuccess) {
            setIsLoading(false);
            return;
          }
        }

        // Parse and set user data
        const parsedUser = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          userId: String(parsedUser.userId),
          name: `${parsedUser.firstName} ${parsedUser.lastName}`
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Set up periodic token refresh
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken && isTokenExpired(accessToken)) {
        console.log('Refreshing token...');
        const success = await handleTokenRefresh();
        if (!success) {
          clearInterval(refreshInterval);
        }
      }
    }, 4 * 60 * 1000); // Check every 4 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginService(email, password);
      
      if (result.success && result.user) {
        setUser({ ...result.user, userId: String(result.user.userId) });
        return { success: true };
      } else {
        const errorMessage = result.error || 'Login failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await registerService(firstName, lastName, email, password);
      
      if (result.success && result.user) {
        setUser({ ...result.user, userId: String(result.user.userId) });
        return { success: true };
      } else {
        const errorMessage = result.error || 'Registration failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};