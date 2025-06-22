// This file will connect our frontend to the backend API
// It will handle API calls for all features

import apiClient from './apiClient';

// Auth API calls
export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Register API calls
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Forgot Password API calls
export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post('/auth/forgotpassword', { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Reset Password API calls
export const logout = async () => {
  try {
    const response = await apiClient.get('/auth/logout');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Facilities API calls
export const getFacilities = async () => {
  try {
    const response = await apiClient.get('/facilities');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get a specific facility by ID
export const getFacility = async (id) => {
  try {
    const response = await apiClient.get(`/facilities/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await apiClient.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get all bookings for the user
export const getUserBookings = async () => {
  try {
    const response = await apiClient.get('/bookings');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get all bookings (Admin only)
export const getAllBookings = async () => {
  try {
    const response = await apiClient.get('/bookings/all');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Cancel/Delete a booking
export const cancelBooking = async (id) => {
  try {
    const response = await apiClient.delete(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Update booking status (Admin only)
export const updateBookingStatus = async (id, status) => {
  try {
    const response = await apiClient.put(`/bookings/${id}`, { status });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Classrooms API calls
export const getClassrooms = async () => {
  try {
    const response = await apiClient.get('/classrooms');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get a specific classroom by ID
export const getClassroom = async (id) => {
  try {
    const response = await apiClient.get(`/classrooms/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get available classrooms
export const getAvailableClassrooms = async () => {
  try {
    const response = await apiClient.get('/classrooms/available');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Events API calls
export const getEvents = async () => {
  try {
    const response = await apiClient.get('/events');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get a specific event by ID
export const getEvent = async (id) => {
  try {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Register for an event
export const registerForEvent = async (eventId, additionalInfo = '') => {
  try {
    const response = await apiClient.post('/events/register', { eventId, additionalInfo });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get registered events for the user
export const getUserEventRegistrations = async () => {
  try {
    const response = await apiClient.get('/events/my-registrations');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Unregister from an event
export const unregisterFromEvent = async (eventId) => {
  try {
    const response = await apiClient.delete(`/events/unregister/${eventId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Create a new event (Admin only)
export const createEvent = async (eventData) => {
  try {
    const response = await apiClient.post('/events', eventData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Update an event (Admin only)
export const updateEvent = async (id, eventData) => {
  try {
    const response = await apiClient.put(`/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Delete an event (Admin only)
export const deleteEvent = async (id) => {
  try {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get all event registrations (Admin only)
export const getAllEventRegistrations = async () => {
  try {
    const response = await apiClient.get('/events/admin/all-registrations');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Delete a specific registration (Admin only)
export const deleteEventRegistration = async (registrationId) => {
  try {
    const response = await apiClient.delete(`/events/admin/registration/${registrationId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Food API calls
export const getRestaurants = async () => {
  try {
    const response = await apiClient.get('/restaurants');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get restaurant details
export const getRestaurant = async (id) => {
  try {
    const response = await apiClient.get(`/restaurants/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get menu items for a specific restaurant
export const getMenuItems = async (id) => {
  try {
    const response = await apiClient.get(`/restaurants/${id}/menu`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Add menu item (Admin only)
export const addMenuItem = async (restaurantId, menuItemData) => {
  try {
    const response = await apiClient.post(`/restaurants/${restaurantId}/menu`, menuItemData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Update menu item (Admin only)
export const updateMenuItem = async (restaurantId, itemId, menuItemData) => {
  try {
    const response = await apiClient.put(`/restaurants/${restaurantId}/menu/${itemId}`, menuItemData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Delete menu item (Admin only)
export const deleteMenuItem = async (restaurantId, itemId) => {
  try {
    const response = await apiClient.delete(`/restaurants/${restaurantId}/menu/${itemId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Complaints API calls
export const getComplaints = async () => {
  try {
    const response = await apiClient.get('/complaints');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get all complaints (Admin only)
export const getAllComplaints = async () => {
  try {
    const response = await apiClient.get('/complaints/admin');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get a specific complaint by ID
export const getComplaint = async (id) => {
  try {
    const response = await apiClient.get(`/complaints/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Create a new complaint
export const createComplaint = async (complaintData) => {
  try {
    const response = await apiClient.post('/complaints', complaintData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Update complaint status (Admin only)
export const updateComplaintStatus = async (id, statusData) => {
  try {
    const response = await apiClient.put(`/complaints/${id}/respond`, statusData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Chatbot API calls
export const getChatHistory = async () => {
  try {
    const response = await apiClient.get('/chatbot/history');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Send a chat message to the chatbot
export const sendChatMessage = async (message) => {
  try {
    const response = await apiClient.post('/chatbot/message', { message });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

