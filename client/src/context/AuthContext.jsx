import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getAuthMe, updateUserProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dastaan_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await getAuthMe();
          setUser(userData);
        } catch (err) {
          console.error('Failed to restore auth session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    localStorage.setItem('dastaan_token', data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await registerUser({ name, email, password });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('dastaan_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const updatedUser = await updateUserProfile(profileData);
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
