import mongoose from 'mongoose';

const GymSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a gym name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  location: {
    latitude: {
      type: Number,
      required: [true, 'Please add latitude'],
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: [true, 'Please add longitude'],
      min: -180,
      max: 180
    }
  },
  radius: {
    type: Number,
    required: [true, 'Please add check-in radius'],
    default: 100, // in meters
    min: [10, 'Radius must be at least 10 meters'],
    max: [1000, 'Radius cannot be more than 1000 meters']
  },
  address: {
    type: String,
    required: [true, 'Please add gym address'],
    maxlength: [200, 'Address cannot be more than 200 characters']
  },
  phone: {
    type: String,
    required: [true, 'Please add phone number'],
    maxlength: [20, 'Phone cannot be more than 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add email'],
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  operatingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  amenities: [{
    type: String,
    maxlength: [50, 'Amenity cannot be more than 50 characters']
  }],
  membershipPlans: [{
    name: {
      type: String,
      required: true,
      maxlength: [50, 'Plan name cannot be more than 50 characters']
    },
    duration: {
      type: String,
      required: true,
      enum: ['1 Month', '3 Months', '6 Months', '12 Months']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    features: [{
      type: String,
      maxlength: [100, 'Feature cannot be more than 100 characters']
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowCheckIn: { type: Boolean, default: true },
    checkInRadius: { type: Number, default: 100 },
    maxDailyCheckIns: { type: Number, default: 1 }
  }
}, {
  timestamps: true
});

// Instance method to calculate distance from a point
GymSchema.methods.calculateDistance = function(latitude, longitude) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = this.location.latitude * Math.PI / 180;
  const φ2 = latitude * Math.PI / 180;
  const Δφ = (latitude - this.location.latitude) * Math.PI / 180;
  const Δλ = (longitude - this.location.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Instance method to check if a point is within radius
GymSchema.methods.isWithinRadius = function(latitude, longitude, customRadius = null) {
  const distance = this.calculateDistance(latitude, longitude);
  const radius = customRadius || this.radius;
  return distance <= radius;
};

export default mongoose.model('Gym', GymSchema);
