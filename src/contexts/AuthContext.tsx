import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GoogleAuthState } from '../types/auth';
import { googleAuthService } from '../services/googleAuthService';

interface AuthContextType {
  authState: GoogleAuthState;
  login: () => void;
  logout: () => void;
  updateAuthState: (state: Partial<GoogleAuthState>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<GoogleAuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
  });

  useEffect(() => {
    // Check for stored authentication on app load
    const storedAuth = googleAuthService.getStoredAuth();
    if (storedAuth.isAuthenticated) {
      setAuthState(storedAuth);
    }

    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      handleOAuthCallback(code);
      // Clean up URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    try {
      const tokenData = await googleAuthService.exchangeCodeForTokens(code);
      const userInfo = await googleAuthService.getUserInfo(tokenData.access_token);
      
      googleAuthService.storeAuth(
        tokenData.access_token,
        tokenData.refresh_token || '',
        userInfo
      );

      setAuthState({
        isAuthenticated: true,
        user: {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        },
        accessToken: tokenData.access_token,
      });

      console.log('Google Calendar connected successfully!');
    } catch (error) {
      console.error('OAuth callback error:', error);
      alert('Failed to connect to Google Calendar. Please try again.');
    }
  };

  const login = () => {
    googleAuthService.initiateGoogleAuth();
  };

  const logout = () => {
    googleAuthService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
    });
  };

  const updateAuthState = (newState: Partial<GoogleAuthState>) => {
    setAuthState(prev => ({ ...prev, ...newState }));
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, updateAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};