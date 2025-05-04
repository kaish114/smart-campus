const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  startTime: {
    type: Date,
    required: [true, 'Please provide a start time']
  },
  endTime: {
    type: Date,
    required: [true, 'Please provide an end time']
  },
  purpose: {
    type: String,
    required: [true, 'Please provide a purpose for booking'],
    trim: true,
    maxlength: [200, 'Purpose cannot be more than 200 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'confirmed'
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  attendees: {
    count: {
      type: Number,
      default: 1,
      min: [1, 'Number of attendees must be at least 1']
    },
    list: [{
      name: {
        type: String,
        trim: true
      },
      email: {
        type: String,
        match: [
          /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
          'Please provide a valid email'
        ]
      }
    }]
  },
  qrCode: {
    type: String
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Feedback cannot be more than 500 characters']
    },
    submittedAt: {
      type: Date
    }
  },
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot be more than 200 characters']
  },
  notificationsSent: [{
    type: {
      type: String,
      enum: ['confirmation', 'reminder', 'check_in', 'check_out', 'cancellation', 'update']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    success: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create compound index to ensure no double bookings
BookingSchema.index(
  { resource: 1, startTime: 1, endTime: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } }
  }
);

// Method to check for booking conflicts
BookingSchema.statics.checkAvailability = async function(resourceId, startTime, endTime, excludeBookingId = null) {
  const query = {
    resource: resourceId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      // New booking starts during an existing booking
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      // New booking contains an existing booking
      { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
    ]
  };

  // Exclude the current booking if we're updating
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBookings = await this.find(query);
  return conflictingBookings.length === 0;
};

// Virtual for booking duration in minutes
BookingSchema.virtual('durationMinutes').get(function() {
  return (this.endTime - this.startTime) / (1000 * 60);
});

// Virtual for whether the booking can be checked in (within 15 mins of start time)
BookingSchema.virtual('canCheckIn').get(function() {
  if (this.status !== 'confirmed') return false;
  
  const now = new Date();
  const bufferTime = 15 * 60 * 1000; // 15 minutes in milliseconds
  
  return (now >= new Date(this.startTime.getTime() - bufferTime)) && 
         (now <= this.endTime) && 
         !this.checkInTime;
});

module.exports = mongoose.model('Booking', BookingSchema);