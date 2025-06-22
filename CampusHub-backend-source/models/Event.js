const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add an event title"],
    trim: true,
    maxlength: [100, "Title can not be more than 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
    maxlength: [500, "Description can not be more than 500 characters"],
  },
  location: {
    type: String,
    required: [true, "Please add a location"],
    maxlength: [100, "Location can not be more than 100 characters"],
  },
  startDate: {
    type: Date,
    required: [true, "Please add a start date and time"],
  },
  endDate: {
    type: Date,
    required: [true, "Please add an end date and time"],
  },
  category: {
    type: String,
    enum: ["academic", "cultural", "sports", "social", "workshop", "seminar", "conference", "other"],
    default: "other",
  },
  organizer: {
    type: String,
    required: [true, "Please add an organizer"],
    maxlength: [100, "Organizer can not be more than 100 characters"],
  },
  registrationRequired: {
    type: Boolean,
    default: true,
  },
  registrationLink: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      "Please use a valid URL with HTTP or HTTPS",
    ],
  },
  maxParticipants: {
    type: Number,
    min: [1, "Maximum participants must be at least 1"],
    max: [1000, "Maximum participants cannot exceed 1000"],
    default: 100,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: false,
  },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed", "cancelled"],
    default: "upcoming",
  },
  imageUrl: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      "Please use a valid URL with HTTP or HTTPS",
    ],
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, "Tag cannot be more than 30 characters"],
  }],
  requirements: {
    type: String,
    maxlength: [300, "Requirements cannot be more than 300 characters"],
  },
  contactEmail: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email",
    ],
  },
  contactPhone: {
    type: String,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      "Please provide a valid phone number",
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
EventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for registration count
EventSchema.virtual('registrationCount', {
  ref: 'EventRegistration',
  localField: '_id',
  foreignField: 'eventId',
  count: true,
});

// Ensure virtual fields are serialized
EventSchema.set('toJSON', { virtuals: true });
EventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Event", EventSchema);

