// Run this with: node seedEvent.js
const mongoose = require('mongoose');

// MongoDB connection string — replace with your actual connection string
const MONGO_URI = 'mongodb://localhost:27017/campushub'; // or Atlas connection string


mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

const eventSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  title: String,
  description: String,
  location: String,
  startDate: Date,
  endDate: Date,
  category: String,
  organizer: String,
  registrationRequired: Boolean,
  registrationLink: String,
}, { collection: 'events' });

const Event = mongoose.model('Event', eventSchema);

const event = new Event({
  _id: new mongoose.Types.ObjectId("665cbf114bbddf67864cd0ad"),
  title: "Annual Science Fair",
  description: "Showcase your scientific projects and innovations at the university's annual science fair.",
  location: "Science Building, Main Hall",
  startDate: new Date("2025-05-25T07:00:00Z"),
  endDate: new Date("2025-05-25T13:00:00Z"),
  category: "academic",
  organizer: "Science Department",
  registrationRequired: true,
  registrationLink: "https://university.edu/events/science-fair"
});

async function seed() {
  try {
    const exists = await Event.findById(event._id);
    if (exists) {
      console.log("Event already exists.");
    } else {
      await event.save();
      console.log("✅ Event inserted.");
    }
  } catch (err) {
    console.error("❌ Error inserting event:", err);
  } finally {
    mongoose.disconnect();
  }
}

seed();