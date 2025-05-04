const express = require('express');
const { check } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All booking routes require authentication
router.use(authMiddleware);

// Get all bookings and create new booking
router.route('/')
  .get(bookingController.getBookings)
  .post(
    [
      check('resource', 'Resource ID is required').not().isEmpty(),
      check('startTime', 'Start time is required').not().isEmpty().isISO8601(),
      check('endTime', 'End time is required').not().isEmpty().isISO8601(),
      check('purpose', 'Purpose is required').not().isEmpty()
    ],
    bookingController.createBooking
  );

// Get, update and delete single booking
router.route('/:id')
  .get(bookingController.getBooking)
  .put(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

// Check in for booking
router.put('/:id/checkin', bookingController.checkIn);

// Check out from booking
router.put('/:id/checkout', bookingController.checkOut);

// Submit feedback for a booking
router.put(
  '/:id/feedback',
  [
    check('rating', 'Rating is required and must be between 1 and 5').isInt({ min: 1, max: 5 })
  ],
  bookingController.submitFeedback
);

module.exports = router;