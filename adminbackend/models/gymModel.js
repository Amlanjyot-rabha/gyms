import mongoose from 'mongoose';
import validator from 'validator';

const gymSchema = new mongoose.Schema(
  {
    gymName: {
      type: String,
      required: [true, 'Please add a gym name'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Please add an owner name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      validate: [validator.isEmail, 'Please add a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    planDuration: {
      type: String,
      required: [true, 'Please select a plan duration'],
      enum: ['1 Month', '3 Months', '6 Months', '12 Months'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    address: {
      type: String,
      required: [true, 'Please add a gym address'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Gym = mongoose.models.Gym || mongoose.model("Gym", gymSchema);

export default Gym;
