// Restaurants routes
const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { check, validationResult } = require('express-validator');

// @route   GET api/restaurants
// @desc    Get all restaurants
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ name: 1 });
    res.json(restaurants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/restaurants/:id
// @desc    Get restaurant by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/restaurants/:id/menu
// @desc    Get restaurant menu
// @access  Private
router.get('/:id/menu', auth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    
    res.json(restaurant.menu);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/restaurants
// @desc    Create a restaurant
// @access  Private/Admin
router.post('/', [auth, admin, [
  check('name', 'Name is required').not().isEmpty(),
  check('location', 'Location is required').not().isEmpty(),
  check('cuisine', 'Cuisine is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name, location, cuisine, openingHours, menu } = req.body;
  
  try {
    const newRestaurant = new Restaurant({
      name,
      location,
      cuisine,
      openingHours,
      menu: menu || []
    });
    
    const restaurant = await newRestaurant.save();
    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/restaurants/:id
// @desc    Update a restaurant
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  const { name, location, cuisine, openingHours } = req.body;
  
  // Build restaurant object
  const restaurantFields = {};
  if (name) restaurantFields.name = name;
  if (location) restaurantFields.location = location;
  if (cuisine) restaurantFields.cuisine = cuisine;
  if (openingHours) restaurantFields.openingHours = openingHours;
  restaurantFields.updatedAt = Date.now();
  
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    
    // Update
    restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: restaurantFields },
      { new: true }
    );
    
    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/restaurants/:id/menu
// @desc    Update restaurant menu
// @access  Private/Admin
router.put('/:id/menu', [auth, admin], async (req, res) => {
  const { menu } = req.body;
  
  if (!menu || !Array.isArray(menu)) {
    return res.status(400).json({ msg: 'Menu must be an array' });
  }
  
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    
    // Update menu
    restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          menu,
          updatedAt: Date.now()
        } 
      },
      { new: true }
    );
    
    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/restaurants/:id/order
// @desc    Place a food order
// @access  Private
router.post('/:id/order', [auth, [
  check('items', 'Items are required').isArray(),
  check('deliveryLocation', 'Delivery location is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { items, deliveryLocation, specialInstructions } = req.body;
  
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    
    // In a real app, this would create an order in a separate collection
    // For this demo, we'll just return a success message
    
    res.json({ 
      msg: 'Order placed successfully',
      order: {
        restaurant: restaurant.name,
        items,
        deliveryLocation,
        specialInstructions,
        estimatedDelivery: new Date(Date.now() + 30 * 60000) // 30 minutes from now
      }
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/restaurants/:id
// @desc    Delete a restaurant
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    
    await restaurant.remove();
    
    res.json({ msg: 'Restaurant removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
