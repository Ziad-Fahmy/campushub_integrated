const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    default: 'General',
    enum: ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Snacks', 'General']
  },
  available: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
    default: '',
  },
  preparationTime: {
    type: Number, // in minutes
    default: 15,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  cuisine: {
    type: String,
    required: true,
    trim: true,
  },
  openingHours: {
    type: String,
    default: '9:00 AM - 10:00 PM',
  },
  contactNumber: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  image: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  menu: [MenuItemSchema],
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
RestaurantSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for menu count
RestaurantSchema.virtual('menuCount').get(function() {
  return this.menu ? this.menu.length : 0;
});

// Virtual for available menu items
RestaurantSchema.virtual('availableMenuItems').get(function() {
  return this.menu ? this.menu.filter(item => item.available) : [];
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);

