const mongoose = require("mongoose");

const FacilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
  },
  description: {
    type: String,
  },
  openingHours: {
    type: String,
  },
  status: {
    type: String,
    enum: ["available", "unavailable", "maintenance"],
    default: "available",
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

module.exports = mongoose.model("Facility", FacilitySchema);

