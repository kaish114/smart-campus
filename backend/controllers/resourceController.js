const Resource = require('../models/Resource');
const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
exports.getResources = async (req, res, next) => {
  try {
    // Build query
    let query;
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, $lt, $lte, $in)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resources
    query = Resource.find(JSON.parse(queryStr));

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
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Resource.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const resources = await query;

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
      count: resources.length,
      pagination,
      data: resources
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
exports.getResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (err) {
    console.error(err);
    
    // Handle invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private (Admin only)
exports.createResource = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Add user to req.body for createdBy field
    req.body.createdBy = req.user.id;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can create resources'
      });
    }

    const resource = await Resource.create(req.body);

    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Admin only)
exports.updateResource = async (req, res, next) => {
  try {
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can update resources'
      });
    }

    // Update resource
    resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin only)
exports.deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can delete resources'
      });
    }

    // Check for existing bookings
    const bookings = await Booking.find({ 
      resource: req.params.id,
      status: { $in: ['pending', 'confirmed'] },
      startTime: { $gt: new Date() }
    });

    if (bookings.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete resource with active future bookings'
      });
    }

    await resource.remove();

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

// @desc    Get resource availability
// @route   GET /api/resources/:id/availability
// @access  Public
exports.getResourceAvailability = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    // Get date from query or use today
    const date = req.query.date ? new Date(req.query.date) : new Date();
    
    // Set to start of day
    date.setHours(0, 0, 0, 0);
    
    // Set end of day
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Find all bookings for this resource on the specified date
    const bookings = await Booking.find({
      resource: req.params.id,
      status: { $in: ['pending', 'confirmed'] },
      startTime: { $gte: date, $lt: endDate }
    }).sort('startTime');

    // Get the resource's available hours for the requested day
    const dayOfWeek = date.getDay();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    
    let hours = isWeekend 
      ? resource.availableTimeSlots.weekends 
      : resource.availableTimeSlots.weekdays;
    
    // Check if this date is an exception
    const exception = resource.availableTimeSlots.exceptions.find(
      exc => new Date(exc.date).toDateString() === date.toDateString()
    );
    
    if (exception) {
      if (!exception.available) {
        return res.status(200).json({
          success: true,
          data: {
            date: date.toISOString().split('T')[0],
            isAvailable: false,
            message: 'This resource is not available on this date.'
          }
        });
      }
      
      if (exception.customHours) {
        hours = exception.customHours;
      }
    }
    
    // Generate time slots based on the resource's booking interval
    const timeSlots = [];
    const [startHour, startMinute] = hours.start.split(':').map(Number);
    const [endHour, endMinute] = hours.end.split(':').map(Number);
    
    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    const interval = resource.bookingInterval;
    let currentSlot = new Date(startTime);
    
    while (currentSlot < endTime) {
      const slotEnd = new Date(currentSlot);
      slotEnd.setMinutes(slotEnd.getMinutes() + interval);
      
      if (slotEnd > endTime) {
        break;
      }
      
      // Check if this time slot overlaps with any booking
      const isBooked = bookings.some(booking => {
        return (
          (new Date(booking.startTime) < slotEnd && 
           new Date(booking.endTime) > currentSlot)
        );
      });
      
      timeSlots.push({
        start: currentSlot.toISOString(),
        end: slotEnd.toISOString(),
        isAvailable: !isBooked
      });
      
      // Move to next slot
      currentSlot = new Date(slotEnd);
    }
    
    res.status(200).json({
      success: true,
      data: {
        date: date.toISOString().split('T')[0],
        operatingHours: {
          start: hours.start,
          end: hours.end
        },
        timeSlots
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};