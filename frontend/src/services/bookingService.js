import api from './api';

// Get all bookings for current user or all bookings for admin
export const getBookings = async (params = {}) => {
  try {
    const response = await api.get('/api/bookings', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

// Get a single booking by ID
export const getBookingById = async (id) => {
  try {
    const response = await api.get(`/api/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking with ID ${id}:`, error);
    throw error;
  }
};

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/api/bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Update a booking
export const updateBooking = async (id, bookingData) => {
  try {
    const response = await api.put(`/api/bookings/${id}`, bookingData);
    return response.data;
  } catch (error) {
    console.error(`Error updating booking with ID ${id}:`, error);
    throw error;
  }
};

// Cancel a booking
export const cancelBooking = async (id, reason) => {
  try {
    const response = await api.delete(`/api/bookings/${id}`, {
      data: { reason }
    });
    return response.data;
  } catch (error) {
    console.error(`Error cancelling booking with ID ${id}:`, error);
    throw error;
  }
};

// Check in for a booking
export const checkInBooking = async (id) => {
  try {
    const response = await api.put(`/api/bookings/${id}/checkin`);
    return response.data;
  } catch (error) {
    console.error(`Error checking in for booking with ID ${id}:`, error);
    throw error;
  }
};

// Check out from a booking
export const checkOutBooking = async (id) => {
  try {
    const response = await api.put(`/api/bookings/${id}/checkout`);
    return response.data;
  } catch (error) {
    console.error(`Error checking out from booking with ID ${id}:`, error);
    throw error;
  }
};

// Submit feedback for a booking
export const submitBookingFeedback = async (id, feedback) => {
  try {
    const response = await api.put(`/api/bookings/${id}/feedback`, feedback);
    return response.data;
  } catch (error) {
    console.error(`Error submitting feedback for booking with ID ${id}:`, error);
    throw error;
  }
};