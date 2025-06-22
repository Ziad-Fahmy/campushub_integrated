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
    enum: ["academic", "cultural", "sports", "social", "other"],
    default: "other",
  },
  organizer: {
    type: String,
    required: [true, "Please add an organizer"],
    maxlength: [100, "Organizer can not be more than 100 characters"],
  },
  registrationRequired: {
    type: Boolean,
    default: false,
  },
  registrationLink: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      "Please use a valid URL with HTTP or HTTPS",
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Event", EventSchema);


