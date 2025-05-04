import { io } from 'socket.io-client';

let socket;

// Initialize socket connection
export const initSocket = () => {
  // If socket already exists, return it
  if (socket) return socket;

  // Create new socket connection
  const token = localStorage.getItem('token');
  const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
  
  socket = io(socketUrl, {
    auth: {
      token
    },
    transports: ['websocket', 'polling']
  });

  // Socket connection events
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

// Get the socket instance
export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

// Close socket connection
export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Join a resource room to get real-time updates
export const joinResourceRoom = (resourceId) => {
  const socket = getSocket();
  socket.emit('joinResource', resourceId);
};

// Leave a resource room
export const leaveResourceRoom = (resourceId) => {
  const socket = getSocket();
  socket.emit('leaveResource', resourceId);
};

// Subscribe to booking-related events
export const subscribeToBookingEvents = (resourceId, callbacks) => {
  const socket = getSocket();
  
  // Join the resource room
  joinResourceRoom(resourceId);
  
  // Set up event listeners based on provided callbacks
  if (callbacks.onBookingCreated) {
    socket.on('booking-created', callbacks.onBookingCreated);
  }
  
  if (callbacks.onBookingUpdated) {
    socket.on('booking-updated', callbacks.onBookingUpdated);
  }
  
  if (callbacks.onBookingCancelled) {
    socket.on('booking-cancelled', callbacks.onBookingCancelled);
  }
  
  if (callbacks.onBookingCheckIn) {
    socket.on('booking-check-in', callbacks.onBookingCheckIn);
  }
  
  if (callbacks.onBookingCheckOut) {
    socket.on('booking-check-out', callbacks.onBookingCheckOut);
  }
  
  // Return an unsubscribe function
  return () => {
    socket.off('booking-created');
    socket.off('booking-updated');
    socket.off('booking-cancelled');
    socket.off('booking-check-in');
    socket.off('booking-check-out');
    leaveResourceRoom(resourceId);
  };
};