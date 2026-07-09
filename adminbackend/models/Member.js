import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  membershipType: {
    type: String,
    required: [true, 'Please select a membership type'],
    enum: ['1 Month', '3 Months', '6 Months', '12 Months'],
    default: '1 Month'
  },
  membershipStart: {
    type: Date,
    default: Date.now
  },
  membershipEnd: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  joiningFee: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  lastReminderSent: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Calculate remaining days
MemberSchema.methods.getRemainingDays = function() {
  const now = new Date();
  const endDate = new Date(this.membershipEnd);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Check if membership is active
MemberSchema.methods.isMembershipActive = function() {
  const now = new Date();
  return this.status === 'active' && new Date(this.membershipEnd) > now;
};

export default mongoose.model('Member', MemberSchema);
