import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';

const AuthContext = createContext(null);
const authBasePath = '/auth/member';

/**
 * AuthProvider — Centralized authentication state management for Member Portal.
 *
 * SINGLE SOURCE OF TRUTH for:
 *   user              — { id, name, email, role } | null
 *   isLoading         — true while bootstrapping session
 *   isAuthError       — true when session invalid/expired
 *   login()           — Authenticate and set user
 *   logout()          — Clear session
 *   invalidateSession() — Mark session as invalid (for 401/403 handling)
 *
 * IMPORTANT: This is the ONLY place that manages auth state transitions.
 * Components react to auth state but do NOT manage auth transitions independently.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthError, setIsAuthError] = useState(false);

  /**
   * Bootstrap — called once on app load to restore session from cookie.
   * If session invalid, sets isAuthError=true so ProtectedRoute redirects.
   */
  const bootstrapAuth = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`${authBasePath}/me`);
      setUser(res.data.data);
      setIsAuthError(false);
    } catch (err) {
      // 401 means invalid/expired session - this is expected for logged-out users
      setUser(null);
      setIsAuthError(err.response?.status === 401);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  /**
   * Login — Authenticate and verify session before setting auth state.
   *
   * CRITICAL FLOW:
   *   1. Call /auth/member/login - backend sets cookie
   *   2. Verify session by calling /auth/member/me
   *   3. ONLY set user state if /me succeeds
   *   4. Return user data for role validation in component
   *
   * This ensures frontend/backend auth state is ALWAYS synchronized.
   * Frontend NEVER trusts raw login response alone.
   */
  const login = useCallback(async (email, password) => {
    // Step 1: Authenticate - backend sets memberToken cookie
    const loginRes = await axiosInstance.post(`${authBasePath}/login`, { email, password });
    const loginUserData = loginRes.data.data;

    // If role is not member, don't verify session (wrong portal)
    // Component will handle role error
    if (loginUserData.role !== 'member') {
      return loginUserData;
    }

    // Step 2: VERIFY session - ensures cookie is actually persisted and valid
    // This is the ONLY way auth state should be set
    try {
      const verifyRes = await axiosInstance.get(`${authBasePath}/me`);
      const verifiedUser = verifyRes.data.data;

      // Step 3: Session verified - safe to set auth state
      setUser(verifiedUser);
      setIsAuthError(false);

      return verifiedUser;
    } catch (verifyErr) {
      // Session verification failed - cookie not working
      // Clear any partial state and propagate error
      setUser(null);
      setIsAuthError(true);
      throw verifyErr;
    }
  }, []);

  /**
   * Logout — backend clears the cookie, frontend clears state.
   */
  const logout = useCallback(async () => {
    try {
      await axiosInstance.post(`${authBasePath}/logout`);
    } catch {
      // Even if the request fails, clear local state
    } finally {
      setUser(null);
      setIsAuthError(false);
    }
  }, []);

  /**
   * Centralized session invalidation — called when any component receives 401/403.
   * This is the ONLY way auth errors should be handled.
   * Prevents multiple components from fighting over auth state.
   */
  const invalidateSession = useCallback(() => {
    setUser(null);
    setIsAuthError(true);
  }, []);

  /**
   * Change password — clears session after successful change.
   */
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const res = await axiosInstance.post(`${authBasePath}/change-password`, {
      currentPassword,
      newPassword
    });
    // Password changed - session cleared by backend, clear frontend state
    setUser(null);
    setIsAuthError(true);
    return res.data;
  }, []);

  const value = {
    user,
    isLoading,
    isAuthError,
    login,
    logout,
    invalidateSession,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
