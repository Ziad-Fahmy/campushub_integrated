// Database models for CampusHub backend

// User model - supports role-based registration
const userSchema = {
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Will be hashed
  role: { type: String, enum: ['student', 'admin'], required: true },
  
  // Student-specific fields
  studentId: { type: String, sparse: true },
  major: String,
  year: String,
  
  // Admin-specific fields
  department: String,
  position: String,
  employeeId: { type: String, sparse: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// Classroom model
const classroomSchema = {
  name: { type: String, required: true },
  building: { type: String, required: true },
  floor: { type: Number, required: true },
  capacity: { type: Number, required: true },
  facilities: [String],
  status: { type: String, enum: ['available', 'occupied'], default: 'available' },
  location: {
    x: Number,
    y: Number
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// Facility model
const facilitySchema = {
  name: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String, required: true },
  capacity: Number,
  description: String,
  openingHours: String,
  status: { type: String, enum: ['available', 'occupied'], default: 'available' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// Event model
const eventSchema = {
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, required: true },
  organizer: { type: String, required: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// Booking model
const bookingSchema = {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resourceType: { type: String, enum: ['classroom', 'facility'], required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  purpose: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// Restaurant model
const restaurantSchema = {
  name: { type: String, required: true },
  location: { type: String, required: true },
  cuisine: String,
  openingHours: String,
  menu: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    category: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// Complaint model
const complaintSchema = {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'resolved'], default: 'pending' },
  response: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};
