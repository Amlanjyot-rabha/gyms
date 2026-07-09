import Member from '../models/Member.js';
import User from '../models/User.js';
import Gym from '../models/Gym.js';
import Attendance from '../models/Attendance.js';
import { sendRenewalNotification } from '../services/notificationService.js';
import { calculateMembershipExpiry, getPlanDurationInMonths } from '../services/membershipService.js';

// @desc    Buy/Activate membership
// @route   POST /api/membership/buy
// @access  Private
export const buyMembership = async (req, res, next) => {
  try {
    const { membershipType, price } = req.body;
    const userId = req.user._id;  // Use ObjectId for consistent type matching
    const user = req.user;

    // We fetch the default gym for pricing
    const gym = await Gym.findOne();
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not properly configured yet' });
    }

    if (!getPlanDurationInMonths(membershipType)) {
      return res.status(400).json({ success: false, message: 'Invalid membership type' });
    }

    const membershipStart = new Date();
    const membershipEnd = calculateMembershipExpiry(membershipStart, membershipType);

    // Find the member record created during registration or an existing one
    let membership = await Member.findOne({ userId });

    if (membership && membership.status === 'active' && membership.membershipEnd > new Date()) {
      return res.status(400).json({ success: false, message: 'Already have an active membership' });
    }

    if (membership) {
      membership.membershipType = membershipType;
      membership.price = price || 0; // Better would be to match it against gym.membershipPlans
      membership.membershipStart = membershipStart;
      membership.membershipEnd = membershipEnd;
      membership.status = 'active';
      membership.paymentStatus = 'paid';
      await membership.save();
    } else {
      membership = await Member.create({
        userId,
        membershipType,
        membershipStart,
        membershipEnd,
        price: price || 0,
        status: 'active',
        paymentStatus: 'paid',
        paymentId: 'PAY_' + Date.now()
      });
    }

      if (membership && membership.paymentStatus === 'paid') {
        // Technically this branch is hit if membership was already created but maybe renewing (though logic above handles renewal)
        // Wait, the logic above sets it. So let's check if we just created it or updated it.
        // We can just send a renewal email, since if we found it, it was an update.
        // Actually, the easiest is to check if we updated or created.
        // For simplicity, we just send renewal email if user is existing, else welcome email.
      }
      
      try {
        const emailPayload = {
        email: user.email,
        name: user.name,
        plan: membershipType,
        amount: price || 0,
        expiryDate: membershipEnd,
        joinDate: membershipStart,
        gymName: gym.name || 'Our Gym',
        phone: user.phoneNumber || ''
      };

      // Since the logic above overwrites `membership` or creates it, we can just send Welcome or Renewal based on if it's their first time.
      // But we don't have a strict flag. Let's send Welcome if they just registered, Renewal otherwise.
      // A quick heuristic: if their old membership was expired, it's a renewal. If they didn't have one, it's a welcome.
      // The old logic above doesn't distinguish easily. Let's just send Renewal since they are buying a membership from the portal.
      await sendRenewalNotification(emailPayload);

    } catch (err) {
      console.log('Email could not be sent: ', err.message);
    }

    // Removed Placeholder WhatsApp Message since notificationService handles it

    res.status(200).json({
      success: true,
      data: {
        membershipStart: membership.membershipStart,
        membershipEnd: membership.membershipEnd,
        status: membership.status,
        remainingDays: membership.getRemainingDays()
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get member profile (status, expiry, attendance history)
// @route   GET /api/member/profile
// @access  Private
export const getMemberProfile = async (req, res, next) => {
  try {
    console.log('[PROFILE] ===== START getMemberProfile =====');
    
    // CRITICAL FIX: Use req.user._id (ObjectId) not req.user.id (String)
    // This ensures type matches Member.userId which is mongoose.Schema.Types.ObjectId
    const userId = req.user._id;
    console.log('[PROFILE] req.user:', { id: req.user._id, email: req.user.email, role: req.user.role });
    console.log('[PROFILE] userId type:', typeof userId, 'value:', userId.toString());

    // DEBUG: Verify linkage lookup (minimal logging for production monitoring)
    console.log('[PROFILE] About to query Member.findOne({ userId })');

    // Fetch the member record using ObjectId (correct type)
    // Add timeout to prevent hanging
    let member;
    try {
      const queryPromise = Member.findOne({ userId }).exec();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Member.findOne timeout')), 3000)
      );
      member = await Promise.race([queryPromise, timeoutPromise]);
      console.log('[PROFILE] After first findOne - member result:', member ? member._id : 'null');
    } catch (queryErr) {
      console.error('[PROFILE] First query error:', queryErr.message);
      member = null;
    }

    if (!member) {
      console.log('[PROFILE] First query returned null, trying with string userId');
      try {
        const queryPromise = Member.findOne({ userId: userId.toString() }).exec();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Member.findOne timeout')), 3000)
        );
        member = await Promise.race([queryPromise, timeoutPromise]);
        console.log('[PROFILE] After second findOne - member result:', member ? member._id : 'null');
      } catch (queryErr) {
        console.error('[PROFILE] Second query error:', queryErr.message);
        member = null;
      }
    }

    // FIX: Auto-create Member document if missing (for orphaned users from old data)
    // This handles users created without corresponding Member documents
    if (!member && req.user.role === 'member') {
      console.log('[PROFILE] No member found - auto-creating for user:', req.user.email);

      const now = new Date();
      member = await Member.create({
        userId: userId,
        membershipType: '1 Month',
        price: 0,
        membershipStart: now,
        membershipEnd: now, // Expired immediately - needs renewal
        status: 'expired',
        paymentStatus: 'pending'
      });

      console.log('[PROFILE] Auto-created Member:', member._id);
    }

    if (!member) {
      // This should not happen if user.role === 'member', but handle edge case
      console.error('[PROFILE] CRITICAL: Member not found and cannot be created for:', req.user.email);
      return res.status(404).json({
        success: false,
        message: 'Member profile not found. Please contact administrator to complete registration.'
      });
    }

    console.log('[PROFILE] About to fetch attendance history');
    // Fetch attendance history using ObjectId
    const rawAttendanceHistory = await Attendance.find({ userId }).sort({ date: -1 }).lean();
    console.log('[PROFILE] Attendance fetched, count:', rawAttendanceHistory.length);

    // Apply 12:00 AM fallback for missing checkouts on past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceHistory = rawAttendanceHistory.map(att => {
      if (!att.checkOut && new Date(att.date) < today) {
        const fallbackExit = new Date(att.date);
        fallbackExit.setHours(23, 59, 59, 999);
        return { ...att, checkOut: fallbackExit, autoFallback: true };
      }
      return att;
    });

    console.log('[PROFILE] About to send JSON response');
    const responsePayload = {
      success: true,
      data: {
        status: member.status,
        expiryDate: member.membershipEnd,
        remainingDays: member.getRemainingDays(),
        attendanceHistory
      }
    };
    console.log('[PROFILE] Response payload:', JSON.stringify(responsePayload));
    console.log('[PROFILE] Response size:', JSON.stringify(responsePayload).length, 'bytes');
    res.status(200).json(responsePayload);
    console.log('[PROFILE] ===== JSON sent successfully =====');
  } catch (error) {
    console.error('[PROFILE] ===== ERROR in getMemberProfile =====', error.message);
    console.error('[PROFILE] Stack:', error.stack);
    next(error);
  }
};
