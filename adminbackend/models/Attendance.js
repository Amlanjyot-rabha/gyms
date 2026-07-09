import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    type: Date,
    default: Date.now
  },
  checkOut: {
    type: Date
  },
  location: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  isWithinRadius: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'approved'
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot be more than 200 characters']
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance for same user on same date
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Pre-save middleware to calculate duration if checkOut is provided
AttendanceSchema.pre('save', function(next) {
  if (this.checkOut && this.checkIn) {
    const diffTime = this.checkOut - this.checkIn;
    this.duration = Math.round(diffTime / (1000 * 60)); // Convert to minutes
  }
  next();
});

// Static method to check if user already marked attendance for today
AttendanceSchema.statics.checkTodayAttendance = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const attendance = await this.findOne({
    userId,
    date: {
      $gte: today,
      $lt: tomorrow
    }
  });
  
  return attendance;
};

export default mongoose.model('Attendance', AttendanceSchema);
