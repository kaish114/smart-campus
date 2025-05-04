import api from './api';

// Get all resources with optional filtering
export const getResources = async (params = {}) => {
  try {
    const response = await api.get('/api/resources', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
};

// Get a single resource by ID
export const getResourceById = async (id) => {
  try {
    const response = await api.get(`/api/resources/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching resource with ID ${id}:`, error);
    throw error;
  }
};

// Create a new resource (admin only)
export const createResource = async (resourceData) => {
  try {
    const response = await api.post('/api/resources', resourceData);
    return response.data;
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
};

// Update a resource (admin only)
export const updateResource = async (id, resourceData) => {
  try {
    const response = await api.put(`/api/resources/${id}`, resourceData);
    return response.data;
  } catch (error) {
    console.error(`Error updating resource with ID ${id}:`, error);
    throw error;
  }
};

// Delete a resource (admin only)
export const deleteResource = async (id) => {
  try {
    const response = await api.delete(`/api/resources/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting resource with ID ${id}:`, error);
    throw error;
  }
};

// Get resource availability for a specific date
export const getResourceAvailability = async (id, date) => {
  try {
    const params = date ? { date: date.toISOString() } : {};
    const response = await api.get(`/api/resources/${id}/availability`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching availability for resource with ID ${id}:`, error);
    throw error;
  }
};