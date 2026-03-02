import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUserSession = useCallback(async () => {
    try {
      const response = await api.get('/users/me');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  const login = async (loginIdentifier, password) => {
    const response = await api.post('/auth/login', { login: loginIdentifier, password });
    setUser(response.data.user); // Cập nhật state user ngay lập tức
    return response.data;
  }

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null); // Xóa user khỏi state
  };

  const register = async (username, email, password) => {
    return await api.post('/auth/register', { username, email, password });
  };
  
  const value = {
    user,
    setUser, // Export setUser để có thể cập nhật thông tin user từ các component khác
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};