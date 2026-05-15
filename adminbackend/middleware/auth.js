import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: true,
  sameSite:'none',
  path: '/'
});

const clearAuthCookie = (res, cookieName) => {
  res.clearCookie(cookieName, getCookieOptions());
};

const sendAuthError = (res, status, message, cookieName) => {
  // ONLY clear cookie on 401 Unauthorized (invalid/expired session)
  // 403 Forbidden (wrong role) should NOT clear cookie - user has valid session
  if (cookieName && status === 401) {
    clearAuthCookie(res, cookieName);
  }
  return res.status(status).json({ success: false, message });
};

const protectSession = async (req, res, next, cookieName, allowedRoles, roleErrorMessage) => {
  const token = req.cookies?.[cookieName];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendAuthError(res, 401, 'User account no longer exists.', cookieName);
    }

    if (!user.isActive) {
      return sendAuthError(res, 401, 'Account is deactivated. Contact your administrator.', cookieName);
    }

    if (!allowedRoles.includes(user.role)) {
      return sendAuthError(res, 403, roleErrorMessage, cookieName);
    }

    req.user = user;
    req.authCookieName = cookieName;
    console.log('[MIDDLEWARE] req.user set, calling next():', { id: user._id, email: user.email });
    next();
    console.log('[MIDDLEWARE] next() returned');
  } catch (error) {
    return sendAuthError(
      res,
      401,
      error.name === 'TokenExpiredError'
        ? 'Session expired. Please log in again.'
        : 'Invalid session. Please log in again.',
      cookieName
    );
  }
};

export const protectAdmin = async (req, res, next) => {
  await protectSession(req, res, next, 'adminToken', ['admin', 'super_admin'], 'Access denied. Admin or super_admin role required.');
};

export const protectMember = async (req, res, next) => {
  console.log('[AUTH] protectMember called');
  await protectSession(req, res, next, 'memberToken', ['member'], 'Access denied. Member role required.');
};

/**
 * authorize — checks req.user.role against the allowed roles list.
 * Must be used after a protectAdmin or protectMember middleware.
 *
 * Usage:
 *   authorize('super_admin')
 *   authorize('admin', 'super_admin')
 *   authorize('member')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`
      });
    }
    next();
  };
};
