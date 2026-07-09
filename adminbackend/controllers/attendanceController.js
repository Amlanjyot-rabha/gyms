import Attendance from '../models/Attendance.js';
import Member from '../models/Member.js';
import Gym from '../models/Gym.js';

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private
export const markAttendance = async (req, res, next) => {
  try {
    const { location } = req.body;
    const userId = req.user.id;

    let lat = location?.lat;
    let lng = location?.lng;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    // 1. Check if user membership is active
    const member = await Member.findOne({ userId });
    
    if (!member || member.status !== 'active' || member.membershipEnd < new Date()) {
      return res.status(403).json({ success: false, message: 'Active membership required to mark attendance' });
    }

    // 2. Gym check-in logic and Distance check
    const gym = await Gym.findOne();
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym location not configured' });
    }

    const isWithinRadius = gym.isWithinRadius(lat, lng);
    if (!isWithinRadius) {
      return res.status(403).json({ success: false, message: 'You are not within the gym radius' });
    }

    // 4. One attendance per day logic or Checkout logic
    const existingAttendance = await Attendance.checkTodayAttendance(userId);
    if (existingAttendance) {
      if (!existingAttendance.checkOut) {
        existingAttendance.checkOut = new Date();
        await existingAttendance.save();
        return res.status(200).json({ success: true, message: 'Checked out successfully', data: existingAttendance });
      }
      return res.status(400).json({ success: false, message: 'Attendance already completed for today' });
    }

    // Create the attendance record
    const attendance = await Attendance.create({
      userId,
      date: new Date(),
      location: { latitude: lat, longitude: lng },
      isWithinRadius: true,
      status: 'approved'
    });

    res.status(201).json({
      success: true,
      data: attendance
    });

  } catch (error) {
    // If we trigger the unique constraint of MongoDB, it might throw 11000
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Attendance already marked for today' });
    }
    next(error);
  }
};
