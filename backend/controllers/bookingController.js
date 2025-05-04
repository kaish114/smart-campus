const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const qrcode = require('qrcode');
const nodemailer = require('nodemailer');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin sees all, Users see only their own)
exports.getBookings = async (req, res, next) => {
  try {
    // Build query
    let query;
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // If not admin, user can only see their own bookings
    if (req.user.role !== 'admin') {
      reqQuery.user = req.user.id;
    }

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, $lt, $lte, $in)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding bookings
    query = Booking.find(JSON.parse(queryStr))
      .populate({
        path: 'resource',
        select: 'name type location'
      })
      .populate({
        path: 'user',
        select: 'firstName lastName email'
      });

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-startTime');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    let total;
    if (req.user.role !== 'admin') {
      total = await Booking.countDocuments({ user: req.user.id });
    } else {
      total = await Booking.countDocuments();
    }

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const bookings = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      pagination,
      data: bookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private (Admin or booking owner)
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'resource',
        select: 'name type location images'
      })
      .populate({
        path: 'user',
        select: 'firstName lastName email'
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Make sure user is booking owner or admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error(err);
    
    // Handle invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Add user to req.body
    req.body.user = req.user.id;

    // Check if resource exists
    const resource = await Resource.findById(req.body.resource);
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    // Validate booking time
    const startTime = new Date(req.body.startTime);
    const endTime = new Date(req.body.endTime);
    
    // Check if the booking is in the past
    const now = new Date();
    if (startTime < now) {
      return res.status(400).json({
        success: false,
        error: 'Cannot book in the past'
      });
    }
    
    // Check if endTime is after startTime
    if (endTime <= startTime) {
      return res.status(400).json({
        success: false,
        error: 'End time must be after start time'
      });
    }
    
    // Check if booking duration exceeds max allowed
    const durationInMinutes = (endTime - startTime) / (1000 * 60);
    if (durationInMinutes > resource.maxBookingDuration) {
      return res.status(400).json({
        success: false,
        error: `Booking duration cannot exceed ${resource.maxBookingDuration} minutes for this resource`
      });
    }
    
    // Check if booking conflicts with other bookings
    const isAvailable = await Booking.checkAvailability(
      req.body.resource, 
      startTime, 
      endTime
    );
    
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        error: 'This time slot is already booked'
      });
    }
    
    // Check resource restrictions
    if (resource.restrictions && resource.restrictions.userRoles && 
        resource.restrictions.userRoles.length > 0) {
      if (!resource.restrictions.userRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to book this resource'
        });
      }
    }
    
    if (resource.restrictions && resource.restrictions.departments && 
        resource.restrictions.departments.length > 0) {
      const user = await User.findById(req.user.id);
      if (!resource.restrictions.departments.includes(user.department)) {
        return res.status(403).json({
          success: false,
          error: 'This resource is restricted to certain departments'
        });
      }
    }

    // Generate QR code
    const bookingData = {
      user: req.user.id,
      resource: req.body.resource,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };
    
    const qrCodeData = JSON.stringify(bookingData);
    const qrCodeImage = await qrcode.toDataURL(qrCodeData);

    // Create booking with QR code
    req.body.qrCode = qrCodeImage;
    const booking = await Booking.create(req.body);

    // Add a confirmation notification
    booking.notificationsSent.push({
      type: 'confirmation',
      sentAt: new Date(),
      success: true
    });
    
    await booking.save();

    // Send email notification
    try {
      // Create email transport
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const user = await User.findById(req.user.id);
      
      // Format dates for email
      const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      };
      
      const formattedDate = startTime.toLocaleDateString('en-US', dateOptions);
      const formattedStartTime = startTime.toLocaleTimeString('en-US', timeOptions);
      const formattedEndTime = endTime.toLocaleTimeString('en-US', timeOptions);

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Booking Confirmation - Smart Campus',
        html: `
          <h2>Booking Confirmation</h2>
          <p>Dear ${user.firstName},</p>
          <p>Your booking has been confirmed:</p>
          <ul>
            <li><strong>Resource:</strong> ${resource.name}</li>
            <li><strong>Location:</strong> ${resource.location.building}, Room ${resource.location.roomNumber}</li>
            <li><strong>Date:</strong> ${formattedDate}</li>
            <li><strong>Time:</strong> ${formattedStartTime} - ${formattedEndTime}</li>
          </ul>
          <p>Please use the attached QR code for check-in.</p>
          <img src="${qrCodeImage}" alt="QR Code" width="200" />
          <p>Thank you for using Smart Campus!</p>
        `
      });
    } catch (err) {
      console.error('Email notification error:', err);
      // We don't fail the booking if email fails, just log it
    }

    // Get the IO instance from app settings to emit real-time update
    const io = req.app.get('io');
    io.to(`resource-${req.body.resource}`).emit('booking-created', {
      resourceId: req.body.resource,
      booking: {
        id: booking._id,
        startTime,
        endTime
      }
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private (Admin or booking owner)
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Make sure user is booking owner or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this booking'
      });
    }

    // If changing time, validate the new booking time
    if (req.body.startTime || req.body.endTime) {
      const startTime = new Date(req.body.startTime || booking.startTime);
      const endTime = new Date(req.body.endTime || booking.endTime);
      
      // Check if the booking is in the past
      const now = new Date();
      if (startTime < now) {
        return res.status(400).json({
          success: false,
          error: 'Cannot update to a time in the past'
        });
      }
      
      // Check if endTime is after startTime
      if (endTime <= startTime) {
        return res.status(400).json({
          success: false,
          error: 'End time must be after start time'
        });
      }
      
      // Get resource details
      const resource = await Resource.findById(booking.resource);
      
      // Check if booking duration exceeds max allowed
      const durationInMinutes = (endTime - startTime) / (1000 * 60);
      if (durationInMinutes > resource.maxBookingDuration) {
        return res.status(400).json({
          success: false,
          error: `Booking duration cannot exceed ${resource.maxBookingDuration} minutes for this resource`
        });
      }
      
      // Check if booking conflicts with other bookings
      const isAvailable = await Booking.checkAvailability(
        booking.resource, 
        startTime, 
        endTime,
        booking._id // Exclude current booking from conflict check
      );
      
      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          error: 'This time slot conflicts with another booking'
        });
      }
    }

    // Update booking
    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Add an update notification
    booking.notificationsSent.push({
      type: 'update',
      sentAt: new Date(),
      success: true
    });
    
    await booking.save();

    // Notify via socket.io
    const io = req.app.get('io');
    io.to(`resource-${booking.resource}`).emit('booking-updated', {
      resourceId: booking.resource,
      booking: {
        id: booking._id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status
      }
    });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private (Admin or booking owner)
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Make sure user is booking owner or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this booking'
      });
    }

    // Update status to cancelled instead of deleting
    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'User cancelled';
    
    // Add a cancellation notification
    booking.notificationsSent.push({
      type: 'cancellation',
      sentAt: new Date(),
      success: true
    });
    
    await booking.save();

    // Notify via socket.io
    const io = req.app.get('io');
    io.to(`resource-${booking.resource}`).emit('booking-cancelled', {
      resourceId: booking.resource,
      bookingId: booking._id
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Check in for booking
// @route   PUT /api/bookings/:id/checkin
// @access  Private (Booking owner only)
exports.checkIn = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Make sure user is booking owner
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to check in for this booking'
      });
    }

    // Check if booking is confirmed
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        error: `Cannot check in for a booking with status: ${booking.status}`
      });
    }

    // Check if already checked in
    if (booking.checkInTime) {
      return res.status(400).json({
        success: false,
        error: 'Already checked in for this booking'
      });
    }

    // Validate check-in time
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    
    // Allow check-in 15 minutes before start time
    const earliestCheckIn = new Date(startTime);
    earliestCheckIn.setMinutes(earliestCheckIn.getMinutes() - 15);
    
    if (now < earliestCheckIn) {
      return res.status(400).json({
        success: false,
        error: 'Too early to check in. Check-in opens 15 minutes before your booking starts.'
      });
    }
    
    if (now > endTime) {
      return res.status(400).json({
        success: false,
        error: 'Cannot check in after the booking has ended.'
      });
    }

    // Update booking
    booking.checkInTime = now;
    booking.notificationsSent.push({
      type: 'check_in',
      sentAt: now,
      success: true
    });
    
    await booking.save();

    // Notify via socket.io
    const io = req.app.get('io');
    io.to(`resource-${booking.resource}`).emit('booking-check-in', {
      resourceId: booking.resource,
      bookingId: booking._id,
      checkInTime: booking.checkInTime
    });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Check out from booking
// @route   PUT /api/bookings/:id/checkout
// @access  Private (Booking owner only)
exports.checkOut = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Make sure user is booking owner
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to check out from this booking'
      });
    }

    // Check if already checked in
    if (!booking.checkInTime) {
      return res.status(400).json({
        success: false,
        error: 'Must check in before checking out'
      });
    }

    // Check if already checked out
    if (booking.checkOutTime) {
      return res.status(400).json({
        success: false,
        error: 'Already checked out from this booking'
      });
    }

    // Update booking
    const now = new Date();
    booking.checkOutTime = now;
    booking.status = 'completed';
    booking.notificationsSent.push({
      type: 'check_out',
      sentAt: now,
      success: true
    });
    
    await booking.save();

    // Notify via socket.io
    const io = req.app.get('io');
    io.to(`resource-${booking.resource}`).emit('booking-check-out', {
      resourceId: booking.resource,
      bookingId: booking._id,
      checkOutTime: booking.checkOutTime
    });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Submit feedback for a booking
// @route   PUT /api/bookings/:id/feedback
// @access  Private (Booking owner only)
exports.submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Make sure user is booking owner
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to submit feedback for this booking'
      });
    }

    // Check if already submitted feedback
    if (booking.feedback && booking.feedback.submittedAt) {
      return res.status(400).json({
        success: false,
        error: 'Feedback already submitted for this booking'
      });
    }

    // Add feedback
    booking.feedback = {
      rating,
      comment,
      submittedAt: new Date()
    };
    
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};