const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a resource name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    required: [true, 'Please specify the resource type'],
    enum: ['study_room', 'lab_equipment', 'sports_facility', 'conference_room', 'library_resource', 'other'],
  },
  location: {
    building: {
      type: String,
      required: [true, 'Please provide a building name'],
      trim: true
    },
    floor: {
      type: Number,
      required: [true, 'Please provide a floor number']
    },
    roomNumber: {
      type: String,
      required: [true, 'Please provide a room number'],
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Please provide latitude coordinates']
      },
      longitude: {
        type: Number,
        required: [true, 'Please provide longitude coordinates']
      }
    }
  },
  capacity: {
    type: Number,
    min: [1, 'Capacity must be at least 1'],
    required: function() {
      return ['study_room', 'conference_room', 'sports_facility'].includes(this.type);
    }
  },
  availableTimeSlots: {
    weekdays: {
      start: {
        type: String, // Format: "HH:MM" in 24-hour format
        default: "08:00"
      },
      end: {
        type: String, // Format: "HH:MM" in 24-hour format
        default: "20:00"
      }
    },
    weekends: {
      start: {
        type: String, // Format: "HH:MM" in 24-hour format
        default: "10:00"
      },
      end: {
        type: String, // Format: "HH:MM" in 24-hour format
        default: "18:00"
      }
    },
    exceptions: [{
      date: {
        type: Date,
        required: true
      },
      available: {
        type: Boolean,
        default: false
      },
      customHours: {
        start: String, // Format: "HH:MM" in 24-hour format
        end: String // Format: "HH:MM" in 24-hour format
      }
    }]
  },
  images: [{
    type: String,
    default: 'default-resource.jpg'
  }],
  amenities: [{
    type: String,
    trim: true
  }],
  maxBookingDuration: {
    type: Number, // in minutes
    default: 120,
    min: [15, 'Minimum booking duration must be at least 15 minutes']
  },
  bookingInterval: {
    type: Number, // in minutes
    default: 15,
    enum: [15, 30, 60]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  restrictions: {
    userRoles: [{
      type: String,
      enum: ['student', 'faculty', 'admin']
    }],
    departments: [{
      type: String,
      trim: true
    }]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current availability status
ResourceSchema.virtual('currentlyAvailable').get(function() {
  // This would be a placeholder - real implementation would check current bookings
  return true;
});

// Index for faster geographic searches
ResourceSchema.index({ 'location.coordinates': '2dsphere' });

// Index for faster type-based queries
ResourceSchema.index({ type: 1 });

module.exports = mongoose.model('Resource', ResourceSchema);