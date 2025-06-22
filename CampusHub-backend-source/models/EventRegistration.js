const mongoose = require("mongoose");

const EventRegistrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.ObjectId,
    ref: "Event",
    required: true,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Please provide your name"],
    trim: true,
    maxlength: [100, "Name cannot be more than 100 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email",
    ],
  },
  phone: {
    type: String,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      "Please provide a valid phone number",
    ],
  },
  additionalInfo: {
    type: String,
    maxlength: [500, "Additional information cannot be more than 500 characters"],
  },
  registrationStatus: {
    type: String,
    enum: ["confirmed", "pending", "cancelled", "attended"],
    default: "confirmed",
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  attendanceMarked: {
    type: Boolean,
    default: false,
  },
  attendanceTime: {
    type: Date,
  },
  specialRequirements: {
    type: String,
    maxlength: [200, "Special requirements cannot be more than 200 characters"],
  },
  emergencyContact: {
    name: {
      type: String,
      maxlength: [100, "Emergency contact name cannot be more than 100 characters"],
    },
    phone: {
      type: String,
      match: [
        /^[\+]?[1-9][\d]{0,15}$/,
        "Please provide a valid emergency contact phone number",
      ],
    },
    relationship: {
      type: String,
      maxlength: [50, "Relationship cannot be more than 50 characters"],
    },
  },
});

// Update the updatedAt field before saving
EventRegistrationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index to prevent duplicate registrations
EventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

// Index for efficient queries
EventRegistrationSchema.index({ eventId: 1, registeredAt: -1 });
EventRegistrationSchema.index({ userId: 1, registeredAt: -1 });

module.exports = mongoose.model("EventRegistration", EventRegistrationSchema);

