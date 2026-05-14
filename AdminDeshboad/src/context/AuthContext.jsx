import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';

const AuthContext = createContext(null);
const authBasePath = '/auth/admin';

/**
 * AuthProvider — wraps the entire Admin Dashboard app.
 *
 * Provides:
 *   user       — { id, name, email, role } | null
 *   isLoading  — true while bootstrapping session on page load
 *   login()    — POST /api/auth/admin/login, sets adminToken cookie via backend
 *   logout()   — POST /api/auth/admin/logout, clears adminToken via backend
 *   changePassword() — POST /api/auth/admin/change-password
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Bootstrap — called once on app load to restore session from the adminToken cookie
  const bootstrapAuth = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`${authBasePath}/me`);
      setUser(res.data.data);
    } catch {
      // No valid admin session — user must log in
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  /**
   * Login — backend sets the HttpOnly cookie.
   * Returns the user object so the caller can validate the role.
   */
  const login = async (email, password) => {
    const res = await axiosInstance.post(`${authBasePath}/login`, { email, password });
    const userData = res.data.data;
    setUser(userData);
    return userData;
  };

  /**
   * Logout — backend clears the cookie.
   * Resets user state. Navigation to login is handled by ProtectedRoute.
   */
  const logout = async () => {
    try {
      await axiosInstance.post(`${authBasePath}/logout`);
    } catch {
      // Even if the request fails, clear local state
    } finally {
      setUser(null);
    }
  };

  /**
   * Change password — verifies current password then updates.
   * Clears the current session cookie on the backend.
   */
  const changePassword = async (currentPassword, newPassword) => {
    const res = await axiosInstance.post(`${authBasePath}/change-password`, {
      currentPassword,
      newPassword
    });
    setUser(null);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
