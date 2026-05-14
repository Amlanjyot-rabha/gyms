import User from '../models/User.js';
import Member from '../models/Member.js';
import Gym from '../models/Gym.js';
import { sendWelcomeEmail } from '../services/emailService.js';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
});

const setAuthCookie = (res, cookieName, token) => {
  res.cookie(cookieName, token, getCookieOptions());
};

const clearAuthCookie = (res, cookieName) => {
  res.clearCookie(cookieName, getCookieOptions());
};

const sendUserResponse = (res, user) => {
  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

const loginUser = async (req, res, next, allowedRoles, cookieName, roleLabel) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated.' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${roleLabel} role required.`
      });
    }

    const token = user.getSignedJwtToken();
    setAuthCookie(res, cookieName, token);

    return sendUserResponse(res, user);
  } catch (error) {
    next(error);
  }
};

export const loginAdmin = async (req, res, next) => {
  return loginUser(req, res, next, ['admin', 'super_admin'], 'adminToken', 'Admin or super_admin');
};

export const loginMember = async (req, res, next) => {
  return loginUser(req, res, next, ['member'], 'memberToken', 'Member');
};

export const logout = async (req, res, next) => {
  try {
    if (req.authCookieName) {
      clearAuthCookie(res, req.authCookieName);
    }

    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return sendUserResponse(res, req.user);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    user.password = newPassword; // Pre-save hook will hash this
    await user.save();

    if (req.authCookieName) {
      clearAuthCookie(res, req.authCookieName);
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully. Please log in again.'
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: 'member'
    });

    console.log('[LINKAGE] Self-registration - Created User:', user.email, 'userId:', user._id.toString());

    await Member.create({
      userId: user._id,
      membershipType: '1 Month',
      price: 0,
      membershipStart: new Date(),
      membershipEnd: new Date(),
      status: 'expired',
      paymentStatus: 'pending'
    });

    console.log('[LINKAGE] Self-registration - Created Member for:', user.email);

    const gym = await Gym.findOne();
    const gymName = gym ? gym.name : 'Our Gym';

    await sendWelcomeEmail({
      email: user.email,
      name: user.name,
      plan: '1 Month', // Default plan assigned on registration
      joinDate: new Date(),
      expiryDate: new Date(), // It starts expired
      amount: 0,
      gymName
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please log in to continue.'
    });
  } catch (error) {
    next(error);
  }
};
