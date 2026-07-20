import Member from '../models/Member.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Gym from '../models/Gym.js';
import crypto from 'crypto';
import { sendWelcomeNotification, sendRenewalNotification } from '../services/notificationService.js';
import { calculateMembershipExpiry, calculateRenewalExpiry, getPlanDurationInMonths } from '../services/membershipService.js';
import * as whatsappService from '../services/whatsappService.js';
import { getComputedMemberStatus } from '../utils/memberStatus.js';

// @desc    Add member manually (Admin)
// @route   POST /api/admin/members
// @access  Private/Admin
export const addMember = async (req, res, next) => {
  let createdUser = null;

  try {
    const { name, email, membershipType, price, phoneNumber, membershipStart: customMembershipStart, joiningFee } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const tempPassword = crypto.randomBytes(4).toString('hex');

    // Create user first
    createdUser = await User.create({
      name,
      email,
      password: tempPassword,
      phoneNumber,
      role: 'member'
    });

    console.log('[LINKAGE] Created User:', createdUser.email, 'userId:', createdUser._id.toString());

    if (!getPlanDurationInMonths(membershipType)) {
      return res.status(400).json({ success: false, message: 'Invalid membership type' });
    }

    const membershipStart = customMembershipStart ? new Date(customMembershipStart) : new Date();
    const membershipEnd = calculateMembershipExpiry(membershipStart, membershipType);

    const parsedJoiningFee = Number(joiningFee) || 0;
    const parsedPrice = Number(price) || 0;
    const totalPaid = parsedPrice + parsedJoiningFee;

    // Create member with correct userId linkage
    const membership = await Member.create({
      userId: createdUser._id,  // ObjectId reference to User
      membershipType: membershipType || '1 Month',
      price: parsedPrice,
      joiningFee: parsedJoiningFee,
      membershipStart,
      membershipEnd,
      status: 'active',
      paymentStatus: 'paid'
    });

    console.log('[LINKAGE] Created Member for:', createdUser.email, 'memberId:', membership._id.toString(), 'linked userId:', membership.userId.toString());

    // Fetch gym name for email
    const gym = await Gym.findOne();
    const gymName = gym ? gym.name : 'Our Gym';

    // Send Welcome Notification
    await sendWelcomeNotification({
      email: createdUser.email,
      name: createdUser.name,
      plan: membershipType || '1 Month',
      joinDate: membershipStart,
      expiryDate: membershipEnd,
      amount: parsedPrice,
      joiningFee: parsedJoiningFee,
      totalPaid: totalPaid,
      gymName,
      phone: createdUser.phoneNumber || '',
      tempPassword
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

// @desc    Delete member permanently
// @route   DELETE /api/admin/members/:id
// @access  Private/Admin
export const deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }

    // Delete associated User and Attendance records
    if (member.userId) {
      await Attendance.deleteMany({ userId: member.userId });
      await User.findByIdAndDelete(member.userId);
    }

    // Delete the Member record
    await Member.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Member deleted successfully'
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
    const members = await Member.find().populate('userId', 'name email phoneNumber').sort({ createdAt: -1 });

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
    const attendance = await Attendance.find().populate('userId', 'name email phoneNumber').sort({ date: -1 });

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
    const { name, email, password, phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Please provide a phone number.' });
    }

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
      phoneNumber,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber
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

    if (!getPlanDurationInMonths(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid membership type' });
    }

    const currentExpiry = new Date(member.membershipEnd);
    const newExpiry = calculateRenewalExpiry(currentExpiry, plan);

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
      await sendRenewalNotification({
        email: user.email,
        name: user.name,
        plan: plan,
        amount: member.price || 0, // In reality, we'd fetch price from gym or body
        expiryDate: newExpiry,
        gymName,
        phone: user.phoneNumber || '',
        joinDate: member.membershipStart
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
    const members = await Member.find().lean();
    const totalMembers = members.length;

    const activeMembers = members.filter((member) => getComputedMemberStatus(member) === 'active').length;
    const expiredMembers = members.filter((member) => getComputedMemberStatus(member) === 'expired').length;
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

// WhatsApp Integration
export const getWhatsAppStatus = (req, res) => { 
  res.status(200).json(whatsappService.getWhatsAppStatus()); 
};

export const connectWhatsApp = async (req, res) => { 
  try {
    if (!req.body.phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required for pairing' });
    }
    await whatsappService.connectWhatsApp(req.body.phone); 
    res.status(200).json({ success: true, message: 'Connecting...' }); 
  } catch (error) {
    res.status(500).json({ success:'yeah here is the problem', message: error.message });
  }
};

export const disconnectWhatsApp = async (req, res) => { 
  await whatsappService.disconnectWhatsApp(); 
  res.status(200).json({ success: true, message: 'Disconnected' }); 
};

export const sendWhatsAppTestMessage = async (req, res) => { 
  try { 
    await whatsappService.sendTestMessage(req.body.phone); 
    res.status(200).json({ success: true, message: 'Test message sent' }); 
  } catch (error) { 
    res.status(500).json({ success: false, message: error.message }); 
  } 
};
