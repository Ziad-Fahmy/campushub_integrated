// Complaints routes
const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { check, validationResult } = require('express-validator');

// @route   GET api/complaints
// @desc    Get all complaints for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/complaints/admin
// @desc    Get all complaints (admin only)
// @access  Private/Admin
router.get('/admin', [auth, admin], async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ status: 1, createdAt: -1 })
      .populate('userId', 'name email');
    res.json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/complaints/:id
// @desc    Get complaint by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email');
    
    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }
    
    // Check user authorization
    if (complaint.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Complaint not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/complaints
// @desc    Submit a new complaint
// @access  Private
router.post('/', [auth, [
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('category', 'Category is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { title, description, category } = req.body;
  
  try {
    const newComplaint = new Complaint({
      userId: req.user.id,
      title,
      description,
      category
    });
    
    const complaint = await newComplaint.save();
    
    // Populate user info for response
    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('userId', 'name email');
    
    res.json(populatedComplaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/complaints/:id
// @desc    Update a complaint
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, description, category } = req.body;
  
  // Build complaint object
  const complaintFields = {};
  if (title) complaintFields.title = title;
  if (description) complaintFields.description = description;
  if (category) complaintFields.category = category;
  complaintFields.updatedAt = Date.now();
  
  try {
    let complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }
    
    // Check user authorization
    if (complaint.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Check if complaint is already being processed
    if (complaint.status !== 'pending') {
      return res.status(400).json({ msg: 'Cannot update complaint that is already being processed' });
    }
    
    // Update
    complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: complaintFields },
      { new: true }
    ).populate('userId', 'name email');
    
    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Complaint not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/complaints/:id/respond
// @desc    Respond to a complaint (admin only)
// @access  Private/Admin
router.put('/:id/respond', [auth, admin, [
  check('status', 'Status is required').isIn(['in-progress', 'resolved']),
  check('response', 'Response is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { status, response } = req.body;
  
  try {
    let complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }
    
    // Update complaint
    complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          status,
          response,
          updatedAt: Date.now()
        } 
      },
      { new: true }
    ).populate('userId', 'name email');
    
    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Complaint not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
