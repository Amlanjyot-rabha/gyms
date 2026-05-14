import Member from '../models/Member.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Gym from '../models/Gym.js';
import { sendWelcomeEmail, sendRenewalEmail } from '../services/emailService.js';

// @desc    Add member manually (Admin)
// @route   POST /api/admin/members
// @access  Private/Admin
export const addMember = async (req, res, next) => {
  let createdUser = null;

  try {
    const { name, email, password, membershipType, price } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user first
    createdUser = await User.create({
      name,
      email,
      password,
      role: 'member'
    });

    console.log('[LINKAGE] Created User:', createdUser.email, 'userId:', createdUser._id.toString());

    const planDurationMap = {
      '1 Month': 1,
      '3 Months': 3,
      '6 Months': 6,
      '12 Months': 12
    };

    const duration = planDurationMap[membershipType] || 1;
    const membershipStart = new Date();
    const membershipEnd = new Date(membershipStart);
    membershipEnd.setMonth(membershipEnd.getMonth() + duration);

    // Create member with correct userId linkage
    const membership = await Member.create({
      userId: createdUser._id,  // ObjectId reference to User
      membershipType: membershipType || '1 Month',
      price: price || 0,
      membershipStart,
      membershipEnd,
      status: 'active',
      paymentStatus: 'paid'
    });

    console.log('[LINKAGE] Created Member for:', createdUser.email, 'memberId:', membership._id.toString(), 'linked userId:', membership.userId.toString());

    // Fetch gym name for email
    const gym = await Gym.findOne();
    const gymName = gym ? gym.name : 'Our Gym';

    // Send Welcome Email
    await sendWelcomeEmail({
      email: createdUser.email,
      name: createdUser.name,
      plan: membershipType || '1 Month',
      joinDate: membershipStart,
      expiryDate: membershipEnd,
      amount: price || 0,
      gymName
    });

    // Account created — member must log in separately to get their own session.
    // We do NOT generate a token or set a cookie here.
    res.status(201).json({
      success: true,
      data: {
        user: { id: createdUser._id, name: createdUser.name, email: createdUser.email, role: createdUser.role },
        membership
      }
    });
  } catch (error) {
    // If member creation failed, clean up the created user
    if (createdUser) {
      try {
        await User.findByIdAndDelete(createdUser._id);
        console.log(`[LINKAGE] Rolled back orphaned user: ${createdUser.email}`);
      } catch (rollbackError) {
        console.error('[LINKAGE] Failed to rollback user creation:', rollbackError);
      }
    }

    // Return the actual validation error to frontend
    next(error);
  }
};

// @desc    Cancel membership
// @route   PUT /api/admin/members/:id/cancel
// @access  Private/Admin
export const cancelMembership = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }

    member.status = 'cancelled';
    await member.save();

    res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all members
// @route   GET /api/admin/members
// @access  Private/Admin
export const getMembers = async (req, res, next) => {
  try {
    const members = await Member.find().populate('userId', 'name email').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: members
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendance records
// @route   GET /api/admin/attendance
// @access  Private/Admin
export const getAllAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find().populate('userId', 'name email').sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new admin (Super Admin restricts normal admins to max 3)
// @route   POST /api/admin/admins
// @access  Private/SuperAdmin
export const addAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const normalAdminCount = await User.countDocuments({ role: 'admin' });

    if (normalAdminCount >= 3) {
      return res.status(400).json({ success: false, message: 'Maximum limit of 3 normal admins reached.' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    user = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update Gym Configuration (lat, lng, radius)
// @route   PUT /api/admin/gym
// @access  Private/Admin
export const updateGym = async (req, res, next) => {
  try {
    const { latitude, longitude, radius, name, address, phone, email } = req.body;

    let gym = await Gym.findOne();
    if (!gym) {
       gym = new Gym({ name: 'Default' });
    }

    if (latitude !== undefined && longitude !== undefined) {
      gym.location = { latitude, longitude };
    }
    if (radius !== undefined) gym.radius = radius;
    if (name) gym.name = name;
    if (address) gym.address = address;
    if (phone) gym.phone = phone;
    if (email) gym.email = email;

    await gym.save();

    res.status(200).json({
      success: true,
      data: gym
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Renew membership
// @route   POST /api/admin/members/:id/renew
// @access  Private/Admin
export const renewMembership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const planDurationMap = {
      '1 Month': 30,
      '3 Months': 90,
      '6 Months': 180,
      '12 Months': 365
    };
    const durationDays = planDurationMap[plan] || 30;

    const currentExpiry = new Date(member.membershipEnd);
    const today = new Date();

    let newExpiry;
    if (member.status === 'active' && currentExpiry > today) {
      newExpiry = new Date(currentExpiry);
      newExpiry.setDate(newExpiry.getDate() + durationDays);
    } else {
      newExpiry = new Date(today);
      newExpiry.setDate(newExpiry.getDate() + durationDays);
    }

    member.membershipEnd = newExpiry;
    member.status = 'active';
    member.membershipType = plan;
    member.paymentStatus = 'paid';

    await member.save();

    // Fetch user and gym to send email
    const user = await User.findById(member.userId);
    const gym = await Gym.findOne();
    const gymName = gym ? gym.name : 'Our Gym';

    if (user && user.email) {
      await sendRenewalEmail({
        email: user.email,
        name: user.name,
        plan: plan,
        amount: member.price || 0, // In reality, we'd fetch price from gym or body
        expiryDate: newExpiry,
        gymName
      });
    }

    res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalMembers = await Member.countDocuments();
    const activeMembers = await Member.countDocuments({ status: 'active' });
    const expiredMembers = await Member.countDocuments({ status: 'expired' });
    const totalAttendance = await Attendance.countDocuments();

    res.status(200).json({
      success: true,
      data: { totalMembers, activeMembers, expiredMembers, totalAttendance }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Private/Admin
export const getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.status(200).json({
      success: true,
      data: admins
    });
  } catch (error) {
    next(error);
  }
};
