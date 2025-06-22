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
    
    res.json(restaurant.menu || []);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/restaurants/menu/all
// @desc    Get all menu items from all restaurants (Admin)
// @access  Private/Admin
router.get('/menu/all', [auth, admin], async (req, res) => {
  try {
    const restaurants = await Restaurant.find().select('name menu');
    
    let allMenuItems = [];
    restaurants.forEach(restaurant => {
      if (restaurant.menu && restaurant.menu.length > 0) {
        restaurant.menu.forEach(item => {
          allMenuItems.push({
            ...item.toObject(),
            restaurantId: restaurant._id,
            restaurantName: restaurant.name
          });
        });
      }
    });
    
    res.json(allMenuItems);
  } catch (err) {
    console.error(err.message);
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
    // Check if restaurant already exists
    let existingRestaurant = await Restaurant.findOne({ name });
    if (existingRestaurant) {
      return res.status(400).json({ msg: 'Restaurant with this name already exists' });
    }
    
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

// @route   POST api/restaurants/:id/menu
// @desc    Add menu item to restaurant
// @access  Private/Admin
router.post('/:id/menu', [auth, admin, [
  check('name', 'Menu item name is required').not().isEmpty(),
  check('price', 'Price is required').isNumeric()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name, description, price, category } = req.body;
  
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    
    const newMenuItem = {
      name,
      description,
      price: parseFloat(price),
      category: category || 'General'
    };
    
    restaurant.menu.push(newMenuItem);
    restaurant.updatedAt = Date.now();
    
    await restaurant.save();
    
    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/restaurants/:id/menu/:menuId
// @desc    Update specific menu item
// @access  Private/Admin
router.put('/:id/menu/:menuId', [auth, admin], async (req, res) => {
  const { name, description, price, category } = req.body;
  
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    
    const menuItem = restaurant.menu.id(req.params.menuId);
    
    if (!menuItem) {
      return res.status(404).json({ msg: 'Menu item not found' });
    }
    
    // Update menu item fields
    if (name) menuItem.name = name;
    if (description !== undefined) menuItem.description = description;
    if (price) menuItem.price = parseFloat(price);
    if (category) menuItem.category = category;
    
    restaurant.updatedAt = Date.now();
    
    await restaurant.save();
    
    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Restaurant or menu item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/restaurants/:id/menu/:menuId
// @desc    Delete specific menu item
// @access  Private/Admin
router.delete('/:id/menu/:menuId', [auth, admin], async (req, res) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    
    const menuItem = restaurant.menu.id(req.params.menuId);
    
    if (!menuItem) {
      return res.status(404).json({ msg: 'Menu item not found' });
    }
    
    restaurant.menu.pull(req.params.menuId);
    restaurant.updatedAt = Date.now();
    
    await restaurant.save();
    
    res.json({ msg: 'Menu item removed', restaurant });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Restaurant or menu item not found' });
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
    
    // Calculate total price
    let totalPrice = 0;
    const orderItems = items.map(item => {
      const menuItem = restaurant.menu.find(m => m._id.toString() === item.menuItemId);
      if (menuItem) {
        totalPrice += menuItem.price * item.quantity;
        return {
          name: menuItem.name,
          price: menuItem.price,
          quantity: item.quantity,
          subtotal: menuItem.price * item.quantity
        };
      }
      return null;
    }).filter(item => item !== null);
    
    res.json({ 
      msg: 'Order placed successfully',
      order: {
        restaurant: restaurant.name,
        items: orderItems,
        totalPrice,
        deliveryLocation,
        specialInstructions,
        estimatedDelivery: new Date(Date.now() + 30 * 60000), // 30 minutes from now
        orderTime: new Date()
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
    
    await Restaurant.findByIdAndDelete(req.params.id);
    
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

