// Authentication and role-based registration endpoints

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", [
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").exists()
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user by email
    let user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };

    // Sign and return JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/auth/register
// @desc    Register a user with role-based fields
// @access  Public
router.post("/register", [
  // Common validation for all users
  check("name", "Name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  check("role", "Role is required").isIn(["student", "admin"]),
  
  // Custom validation based on role
  (req, res, next) => {
    const { role } = req.body;
    
    if (role === "student") {
      // Student-specific validation
      check("studentId", "Student ID is required").not().isEmpty()(req, res, () => {});
      check("major", "Major is required").not().isEmpty()(req, res, () => {});
      check("year", "Year is required").not().isEmpty()(req, res, () => {});
    } else if (role === "admin") {
      // Admin-specific validation
      check("department", "Department is required").not().isEmpty()(req, res, () => {});
      check("position", "Position is required").not().isEmpty()(req, res, () => {});
      check("employeeId", "Employee ID is required").not().isEmpty()(req, res, () => {});
    }
    
    next();
  }
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { 
    name, 
    email, 
    password, 
    role,
    // Student fields
    studentId,
    major,
    year,
    // Admin fields
    department,
    position,
    employeeId
  } = req.body;
  
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }
    
    // Create user object based on role
    user = new User({
      name,
      email,
      password,
      role,
      ...(role === "student" 
        ? { studentId, major, year } 
        : { department, position, employeeId })
    });
    
    // Save user to database (password hashing is handled by pre-save hook)
    await user.save();
    
    // Create JWT payload
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };
    
    // Sign and return JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/auth/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", auth, async (req, res) => {
  try {
    // Get user without password
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, async (req, res) => {
  const { 
    name, 
    // Student fields
    major,
    year,
    // Admin fields
    department,
    position
  } = req.body;
  
  try {
    // Get user
    const user = await User.findById(req.user.id);
    
    // Update fields
    if (name) user.name = name;
    
    // Update role-specific fields
    if (user.role === "student") {
      if (major) user.major = major;
      if (year) user.year = year;
    } else if (user.role === "admin") {
      if (department) user.department = department;
      if (position) user.position = position;
    }
    
    user.updatedAt = Date.now();
    
    // Save user
    await user.save();
    
    // Return updated user without password
    res.json(await User.findById(req.user.id).select("-password"));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/auth/logout
// @desc    Logout user (client-side only in JWT)
// @access  Public
router.post("/logout", (req, res) => {
  // JWT is stateless, so logout is handled client-side
  // This endpoint is for consistency and future extensions
  res.json({ msg: "Logout successful" });
});

// @route   POST api/auth/check-auth-status
// @desc    Check if user is authenticated
// @access  Private
router.get("/check-auth-status", auth, async (req, res) => {
  try {
    // Get user without password
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      isAuthenticated: true,
      user: user
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;


