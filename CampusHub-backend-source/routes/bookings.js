// Bookings routes
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Classroom = require('../models/Classroom');
const Facility = require('../models/Facility');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { check, validationResult } = require('express-validator');

// @route   GET api/bookings
// @desc    Get all bookings for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .sort({ startTime: 1 })
      .populate('resourceId', 'name location');
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/bookings/all
// @desc    Get all bookings (admin only)
// @access  Private/Admin
router.get('/all', [auth, admin], async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ startTime: 1 })
      .populate('userId', 'name email')
      .populate('resourceId', 'name location');
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('resourceId', 'name location');
    
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    
    // Check user authorization
    if (booking.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/bookings
// @desc    Create a booking
// @access  Private
router.post('/', [auth, [
  check('resourceType', 'Resource type is required').isIn(['classroom', 'facility']),
  check('resourceId', 'Resource ID is required').not().isEmpty(),
  check('startTime', 'Start time is required').not().isEmpty(),
  check('endTime', 'End time is required').not().isEmpty(),
  check('purpose', 'Purpose is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { resourceType, resourceId, startTime, endTime, purpose } = req.body;
  
  try {
    // Check if resource exists
    let resource;
    if (resourceType === 'classroom') {
      resource = await Classroom.findById(resourceId);
    } else {
      resource = await Facility.findById(resourceId);
    }
    
    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    
    // Check if resource is available for the requested time
    const conflictingBooking = await Booking.findOne({
      resourceId,
      $or: [
        {
          startTime: { $lte: new Date(startTime) },
          endTime: { $gt: new Date(startTime) }
        },
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gte: new Date(endTime) }
        },
        {
          startTime: { $gte: new Date(startTime) },
          endTime: { $lte: new Date(endTime) }
        }
      ],
      status: { $ne: 'rejected' }
    });
    
    if (conflictingBooking) {
      return res.status(400).json({ msg: 'Resource is not available for the requested time' });
    }
    
    const newBooking = new Booking({
      userId: req.user.id,
      resourceType,
      resourceId,
      startTime,
      endTime,
      purpose,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });
    
    const booking = await newBooking.save();
    
    // Populate user and resource info for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email')
      .populate('resourceId', 'name location');
    
    res.json(populatedBooking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/bookings/:id
// @desc    Update booking status
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  const { status } = req.body;
  
  // Validate status
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid status' });
  }
  
  try {
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    
    booking.status = status;
    booking.updatedAt = Date.now();
    
    await booking.save();
    
    // Populate user and resource info for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email')
      .populate('resourceId', 'name location');
    
    res.json(populatedBooking);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/bookings/:id
// @desc    Cancel a booking
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    
    // Check user authorization
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await booking.remove();
    
    res.json({ msg: 'Booking cancelled' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/bookings/resource/:resourceId
// @desc    Get bookings for a specific resource
// @access  Private
router.get('/resource/:resourceId', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      resourceId: req.params.resourceId,
      status: { $ne: 'rejected' }
    })
      .sort({ startTime: 1 })
      .populate('userId', 'name');
    
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
