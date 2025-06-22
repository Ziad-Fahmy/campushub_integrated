const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");

// @route   POST api/events
// @desc    Create a new event
// @access  Private
router.post(
  "/",
  [
    auth,
    check("title", "Title is required").not().isEmpty(),
    check("description", "Description is required").not().isEmpty(),
    check("location", "Location is required").not().isEmpty(),
    check("startDate", "Start date is required").isISO8601().toDate(),
    check("endDate", "End date is required").isISO8601().toDate(),
    check("category", "Category is required").not().isEmpty(),
    check("organizer", "Organizer is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      location,
      startDate,
      endDate,
      category,
      organizer,
      registrationRequired,
      registrationLink,
    } = req.body;

    try {
      const newEvent = new Event({
        title,
        description,
        location,
        startDate,
        endDate,
        category,
        organizer,
        registrationRequired,
        registrationLink: registrationRequired ? registrationLink : undefined,
      });

      const event = await newEvent.save();
      res.json(event);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/events
// @desc    Get all events
// @access  Public
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ startDate: 1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/events/:id
// @desc    Get event by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    res.json(event);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Event not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    await Event.deleteOne({ _id: req.params.id });

    res.json({ msg: "Event removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Event not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   POST api/events/register
// @desc    Register for an event
// @access  Public
router.post(
  "/register",
  [
    check("eventId", "Event ID is required").not().isEmpty(),
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, userId, name, email, additionalInfo } = req.body;

    try {
      // ✅ Validate MongoDB ID
      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ msg: "Invalid Event ID" });
      }

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ msg: "Event not found" });
      }

      const newRegistration = new EventRegistration({
        eventId,
        userId,
        name,
        email,
        additionalInfo,
      });

      const registration = await newRegistration.save();
      res.json(registration);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
