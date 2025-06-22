const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const User = require("../models/User");

// IMPORTANT: Admin routes must come BEFORE parameterized routes to avoid conflicts

// @route   GET api/events/admin/all-registrations
// @desc    Get all event registrations across all events (Admin only)
// @access  Private (Admin only)
router.get("/admin/all-registrations", [auth, admin], async (req, res) => {
  try {
    const registrations = await EventRegistration.find()
      .populate('eventId', 'title startDate location')
      .populate('userId', 'name email role studentId')
      .sort({ registeredAt: -1 });

    const formattedRegistrations = registrations.map(reg => ({
      id: reg._id,
      eventTitle: reg.eventId?.title || 'Unknown Event',
      eventDate: reg.eventId?.startDate,
      eventLocation: reg.eventId?.location,
      studentName: reg.name,
      studentEmail: reg.email,
      studentId: reg.userId?.studentId || 'N/A',
      role: reg.userId?.role || 'student',
      additionalInfo: reg.additionalInfo,
      registeredAt: reg.registeredAt,
    }));

    res.json({
      totalRegistrations: formattedRegistrations.length,
      registrations: formattedRegistrations,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/events/admin/registration/:registrationId
// @desc    Delete a specific registration (Admin only)
// @access  Private (Admin only)
router.delete("/admin/registration/:registrationId", [auth, admin], async (req, res) => {
  try {
    const registration = await EventRegistration.findById(req.params.registrationId);
    
    if (!registration) {
      return res.status(404).json({ msg: "Registration not found" });
    }

    await EventRegistration.deleteOne({ _id: req.params.registrationId });
    res.json({ msg: "Registration removed successfully" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Registration not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   GET api/events/my-registrations
// @desc    Get user's event registrations
// @access  Private (Authenticated users)
router.get("/my-registrations", auth, async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ userId: req.user.id })
      .populate('eventId', 'title description location startDate endDate category organizer')
      .sort({ registeredAt: -1 });

    res.json(registrations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/events
// @desc    Create a new event
// @access  Private (Admin only)
router.post(
  "/",
  [
    auth,
    admin,
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
      maxParticipants,
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
        registrationRequired: registrationRequired || true,
        registrationLink: registrationRequired ? registrationLink : undefined,
        maxParticipants: maxParticipants || 100,
        createdBy: req.user.id,
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
    
    // Add registration count for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await EventRegistration.countDocuments({
          eventId: event._id,
        });
        return {
          ...event.toObject(),
          registrationCount,
          spotsRemaining: event.maxParticipants ? event.maxParticipants - registrationCount : null,
        };
      })
    );
    
    res.json(eventsWithCounts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/events/register
// @desc    Register for an event
// @access  Private (Authenticated users)
router.post(
  "/register",
  [
    auth,
    check("eventId", "Event ID is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, additionalInfo } = req.body;

    try {
      // Validate MongoDB ID
      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ msg: "Invalid Event ID" });
      }

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ msg: "Event not found" });
      }

      // Check if user already registered
      const existingRegistration = await EventRegistration.findOne({
        eventId,
        userId: req.user.id,
      });

      if (existingRegistration) {
        return res.status(400).json({ msg: "You are already registered for this event" });
      }

      // Check if event is full
      if (event.maxParticipants) {
        const currentRegistrations = await EventRegistration.countDocuments({ eventId });
        if (currentRegistrations >= event.maxParticipants) {
          return res.status(400).json({ msg: "Event is full" });
        }
      }

      // Get user details
      const user = await User.findById(req.user.id).select("-password");

      const newRegistration = new EventRegistration({
        eventId,
        userId: req.user.id,
        name: user.name,
        email: user.email,
        additionalInfo,
      });

      const registration = await newRegistration.save();
      
      // Populate event details in response
      await registration.populate('eventId', 'title startDate location');
      
      res.json({
        msg: "Successfully registered for event",
        registration,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   DELETE api/events/register/:eventId
// @desc    Unregister from an event
// @access  Private (Authenticated users)
router.delete("/register/:eventId", auth, async (req, res) => {
  try {
    const registration = await EventRegistration.findOneAndDelete({
      eventId: req.params.eventId,
      userId: req.user.id,
    });

    if (!registration) {
      return res.status(404).json({ msg: "Registration not found" });
    }

    res.json({ msg: "Successfully unregistered from event" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/events/:id
// @desc    Get event by ID with registration details
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Get registration count
    const registrationCount = await EventRegistration.countDocuments({
      eventId: event._id,
    });

    const eventWithDetails = {
      ...event.toObject(),
      registrationCount,
      spotsRemaining: event.maxParticipants ? event.maxParticipants - registrationCount : null,
    };

    res.json(eventWithDetails);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Event not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   GET api/events/:id/registrations
// @desc    Get all registrations for a specific event (Admin only)
// @access  Private (Admin only)
router.get("/:id/registrations", [auth, admin], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    const registrations = await EventRegistration.find({ eventId: req.params.id })
      .populate('userId', 'name email role studentId')
      .sort({ registeredAt: -1 });

    const registrationData = {
      event: {
        id: event._id,
        title: event.title,
        startDate: event.startDate,
        location: event.location,
        maxParticipants: event.maxParticipants,
      },
      totalRegistrations: registrations.length,
      spotsRemaining: event.maxParticipants ? event.maxParticipants - registrations.length : null,
      registrations: registrations.map(reg => ({
        id: reg._id,
        name: reg.name,
        email: reg.email,
        studentId: reg.userId?.studentId || 'N/A',
        role: reg.userId?.role || 'student',
        additionalInfo: reg.additionalInfo,
        registeredAt: reg.registeredAt,
        userId: reg.userId?._id,
      })),
    };

    res.json(registrationData);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Event not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private (Admin only)
router.put("/:id", [auth, admin], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
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
      maxParticipants,
    } = req.body;

    // Update event fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (location) event.location = location;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (category) event.category = category;
    if (organizer) event.organizer = organizer;
    if (registrationRequired !== undefined) event.registrationRequired = registrationRequired;
    if (registrationLink) event.registrationLink = registrationLink;
    if (maxParticipants) event.maxParticipants = maxParticipants;

    await event.save();
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private (Admin only)
router.delete("/:id", [auth, admin], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Also delete all registrations for this event
    await EventRegistration.deleteMany({ eventId: req.params.id });
    await Event.deleteOne({ _id: req.params.id });

    res.json({ msg: "Event and all registrations removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Event not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;

