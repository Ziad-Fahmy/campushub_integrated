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
    const response = await apiClient.get('/booking/facilities');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get a specific facility by ID
export const getFacility = async (id) => {
  try {
    const response = await apiClient.get(`/booking/facilities/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await apiClient.post('/booking/create', bookingData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};


// Get all bookings for the user
export const getUserBookings = async () => {
  try {
    const response = await apiClient.get('/booking/user');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get a specific booking by ID
export const cancelBooking = async (id) => {
  try {
    const response = await apiClient.put(`/booking/cancel/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Classrooms API calls
export const getClassrooms = async () => {
  try {
    const response = await apiClient.get('/classroom');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get a specific classroom by ID
export const getClassroom = async (id) => {
  try {
    const response = await apiClient.get(`/classroom/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Create a new classroom booking
export const getAvailableClassrooms = async () => {
  try {
    const response = await apiClient.get('/classroom/available');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Events API calls
export const getEvents = async () => {
  try {
    const response = await apiClient.get('/event');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get a specific event by ID
export const getEvent = async (id) => {
  try {
    const response = await apiClient.get(`/event/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Create a new event
export const registerForEvent = async (id) => {
  try {
    const response = await apiClient.post(`/event/register/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get registered events for the user
export const unregisterFromEvent = async (id) => {
  try {
    const response = await apiClient.delete(`/event/unregister/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Food API calls
export const getRestaurants = async () => {
  try {
    const response = await apiClient.get('/food');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get restaurant details
export const getRestaurant = async (id) => {
  try {
    const response = await apiClient.get(`/food/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get menu items for a specific restaurant
export const getMenuItems = async (id) => {
  try {
    const response = await apiClient.get(`/food/${id}/menu`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Complaints API calls
export const getComplaints = async () => {
  try {
    const response = await apiClient.get('/complaint');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get a specific complaint by ID
export const getComplaint = async (id) => {
  try {
    const response = await apiClient.get(`/complaint/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Create a new complaint
export const createComplaint = async (complaintData) => {
  try {
    const response = await apiClient.post('/complaint', complaintData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Update complaint status
export const updateComplaintStatus = async (id, statusData) => {
  try {
    const response = await apiClient.put(`/complaint/${id}/status`, statusData);
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
