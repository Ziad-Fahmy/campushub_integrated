// Core backend features for CampusHub

// Classrooms routes
const express = require('express');
const router = express.Router();
const Classroom = require('../models/Classroom');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { check, validationResult } = require('express-validator');

// @route   GET api/classrooms
// @desc    Get all classrooms
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const classrooms = await Classroom.find().sort({ building: 1, floor: 1, name: 1 });
    res.json(classrooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/classrooms/:id
// @desc    Get classroom by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    
    if (!classroom) {
      return res.status(404).json({ msg: 'Classroom not found' });
    }
    
    res.json(classroom);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Classroom not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/classrooms
// @desc    Create a classroom
// @access  Private/Admin
router.post('/', [auth, admin, [
  check('name', 'Name is required').not().isEmpty(),
  check('building', 'Building is required').not().isEmpty(),
  check('floor', 'Floor is required').isNumeric(),
  check('capacity', 'Capacity is required').isNumeric()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name, building, floor, capacity, facilities, location } = req.body;
  
  try {
    const newClassroom = new Classroom({
      name,
      building,
      floor,
      capacity,
      facilities,
      location
    });
    
    const classroom = await newClassroom.save();
    res.json(classroom);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/classrooms/:id
// @desc    Update a classroom
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  const { name, building, floor, capacity, facilities, status, location } = req.body;
  
  // Build classroom object
  const classroomFields = {};
  if (name) classroomFields.name = name;
  if (building) classroomFields.building = building;
  if (floor) classroomFields.floor = floor;
  if (capacity) classroomFields.capacity = capacity;
  if (facilities) classroomFields.facilities = facilities;
  if (status) classroomFields.status = status;
  if (location) classroomFields.location = location;
  classroomFields.updatedAt = Date.now();
  
  try {
    let classroom = await Classroom.findById(req.params.id);
    
    if (!classroom) {
      return res.status(404).json({ msg: 'Classroom not found' });
    }
    
    // Update
    classroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      { $set: classroomFields },
      { new: true }
    );
    
    res.json(classroom);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Classroom not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/classrooms/:id
// @desc    Delete a classroom
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    
    if (!classroom) {
      return res.status(404).json({ msg: 'Classroom not found' });
    }
    
    await classroom.remove();
    
    res.json({ msg: 'Classroom removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Classroom not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
