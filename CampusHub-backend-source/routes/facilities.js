const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { check, validationResult } = require('express-validator');

// @route   GET api/facilities
// @desc    Get all facilities
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const facilities = await Facility.find().sort({ type: 1, name: 1 });
    res.json(facilities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/facilities/:id
// @desc    Get facility by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({ msg: 'Facility not found' });
    }

    res.json(facility);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Facility not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/facilities
// @desc    Create a facility
// @access  Private/Admin
router.post(
  '/',
  [auth, admin, [
    check('name', 'Name is required').not().isEmpty(),
    check('type', 'Type is required').not().isEmpty(),
    check('location', 'Location is required').not().isEmpty()
  ]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, location, capacity, description, openingHours } = req.body;

    try {
      const newFacility = new Facility({
        name,
        type,
        location,
        capacity,
        description,
        openingHours
      });

      const facility = await newFacility.save();
      res.json(facility);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/facilities/:id
// @desc    Update a facility
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  const { name, type, location, capacity, description, openingHours, status } = req.body;

  const facilityFields = {};
  if (name) facilityFields.name = name;
  if (type) facilityFields.type = type;
  if (location) facilityFields.location = location;
  if (capacity) facilityFields.capacity = capacity;
  if (description) facilityFields.description = description;
  if (openingHours) facilityFields.openingHours = openingHours;
  if (status) facilityFields.status = status;
  facilityFields.updatedAt = Date.now();

  try {
    let facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({ msg: 'Facility not found' });
    }

    facility = await Facility.findByIdAndUpdate(
      req.params.id,
      { $set: facilityFields },
      { new: true }
    );

    res.json(facility);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Facility not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/facilities/:id
// @desc    Delete a facility
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({ msg: 'Facility not found' });
    }

    await facility.remove();
    res.json({ msg: 'Facility removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Facility not found' });
    }
    res.status(500).send('Server error');
  }
});

// ✅ NEW ROUTE: Book a facility
const FacilityBooking = require("../models/FacilityBooking");

// @route   POST api/facilities/book
// @desc    Book a facility
// @access  Private
router.post('/book', auth, [
  check('facilityId', 'Facility ID is required').not().isEmpty(),
  check('userId', 'User ID is required').not().isEmpty(),
  check('date', 'Date is required').not().isEmpty(),
  check('purpose', 'Purpose is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { facilityId, userId, date, purpose } = req.body;

  try {
    const booking = new FacilityBooking({ facilityId, userId, date, purpose });
    await booking.save();
    res.status(201).json({ msg: 'Facility booked successfully', booking });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
