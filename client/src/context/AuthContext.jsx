import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('sf_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('sf_token'));
  const [loading, setLoading] = useState(false);

  const login = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('sf_user', JSON.stringify(userData));
    localStorage.setItem('sf_token', jwt);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sf_user');
    localStorage.removeItem('sf_token');
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem('sf_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
