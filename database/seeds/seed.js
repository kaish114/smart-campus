const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../../backend/.env' });

// Import models
const User = require('../../backend/models/User');
const Resource = require('../../backend/models/Resource');
const Booking = require('../../backend/models/Booking');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-campus', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Seed data function
const seedData = async () => {
  try {
    // Clean up database
    await User.deleteMany();
    await Resource.deleteMany();
    await Booking.deleteMany();
    
    console.log('Previous data cleared');
    
    // Create admin user
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@smartcampus.com',
      password: 'password123',
      role: 'admin',
      department: 'Administration'
    });

    console.log('Admin user created');
    
    // Create sample faculty user
    const facultyUser = await User.create({
      firstName: 'Faculty',
      lastName: 'Member',
      email: 'faculty@smartcampus.com',
      password: 'password123',
      role: 'faculty',
      department: 'Computer Science'
    });
    
    console.log('Faculty user created');
    
    // Create sample student users
    const studentUser1 = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@student.com',
      password: 'password123',
      role: 'student',
      studentId: 'S12345',
      department: 'Computer Science'
    });
    
    const studentUser2 = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@student.com',
      password: 'password123',
      role: 'student',
      studentId: 'S67890',
      department: 'Electrical Engineering'
    });
    
    console.log('Student users created');
    
    // Create sample resources
    
    // Study Room
    const studyRoom = await Resource.create({
      name: 'Group Study Room 101',
      description: 'A spacious room equipped with a whiteboard, projector, and comfortable seating for group study sessions.',
      type: 'study_room',
      location: {
        building: 'Library',
        floor: 1,
        roomNumber: '101',
        coordinates: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      },
      capacity: 8,
      availableTimeSlots: {
        weekdays: {
          start: '08:00',
          end: '22:00'
        },
        weekends: {
          start: '10:00',
          end: '18:00'
        }
      },
      amenities: ['Whiteboard', 'Projector', 'Wi-Fi', 'Power outlets'],
      maxBookingDuration: 120,
      bookingInterval: 30,
      createdBy: adminUser._id
    });
    
    // Lab Equipment
    const labEquipment = await Resource.create({
      name: 'Microscope Set A',
      description: 'High-precision digital microscope for advanced laboratory research.',
      type: 'lab_equipment',
      location: {
        building: 'Science Building',
        floor: 2,
        roomNumber: '205',
        coordinates: {
          latitude: 40.7130,
          longitude: -74.0065
        }
      },
      availableTimeSlots: {
        weekdays: {
          start: '09:00',
          end: '17:00'
        },
        weekends: {
          start: '10:00',
          end: '15:00'
        }
      },
      amenities: ['Digital interface', 'Camera attachment', 'Adjustable lighting'],
      maxBookingDuration: 180,
      bookingInterval: 60,
      restrictions: {
        userRoles: ['faculty', 'student'],
        departments: ['Biology', 'Chemistry', 'Medical Sciences']
      },
      createdBy: adminUser._id
    });
    
    // Sports Facility
    const sportsFacility = await Resource.create({
      name: 'Tennis Court 1',
      description: 'Professional-grade outdoor tennis court with lighting for evening play.',
      type: 'sports_facility',
      location: {
        building: 'Sports Complex',
        floor: 0,
        roomNumber: 'TC1',
        coordinates: {
          latitude: 40.7135,
          longitude: -74.0070
        }
      },
      capacity: 4,
      availableTimeSlots: {
        weekdays: {
          start: '07:00',
          end: '21:00'
        },
        weekends: {
          start: '08:00',
          end: '20:00'
        }
      },
      amenities: ['Lighting', 'Water fountain', 'Equipment rental'],
      maxBookingDuration: 90,
      bookingInterval: 30,
      createdBy: adminUser._id
    });
    
    // Conference Room
    const conferenceRoom = await Resource.create({
      name: 'Executive Conference Room',
      description: 'Formal conference room with high-end AV equipment for meetings and presentations.',
      type: 'conference_room',
      location: {
        building: 'Administration Building',
        floor: 3,
        roomNumber: '315',
        coordinates: {
          latitude: 40.7140,
          longitude: -74.0075
        }
      },
      capacity: 20,
      availableTimeSlots: {
        weekdays: {
          start: '08:30',
          end: '18:00'
        },
        weekends: {
          start: '09:00',
          end: '15:00'
        }
      },
      amenities: ['Video conferencing', 'Projector', 'Surround sound', 'Interactive whiteboard'],
      maxBookingDuration: 240,
      bookingInterval: 60,
      restrictions: {
        userRoles: ['admin', 'faculty']
      },
      createdBy: adminUser._id
    });
    
    console.log('Resources created');
    
    // Create sample bookings (current date + 1 day for start time)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const bookingEndTime = new Date(tomorrow);
    bookingEndTime.setHours(bookingEndTime.getHours() + 1);
    
    // Create a booking for the study room
    const studyRoomBooking = await Booking.create({
      user: studentUser1._id,
      resource: studyRoom._id,
      startTime: tomorrow,
      endTime: bookingEndTime,
      purpose: 'Group project meeting',
      status: 'confirmed',
      attendees: {
        count: 4,
        list: [
          { name: 'Alice Johnson', email: 'alice@student.com' },
          { name: 'Bob Wilson', email: 'bob@student.com' }
        ]
      },
      qrCode: 'data:image/png;base64,fakeQRCodeDataForDemo'
    });
    
    // Create a booking for the lab equipment
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(13, 0, 0, 0);
    
    const labEndTime = new Date(nextWeek);
    labEndTime.setHours(labEndTime.getHours() + 2);
    
    const labBooking = await Booking.create({
      user: facultyUser._id,
      resource: labEquipment._id,
      startTime: nextWeek,
      endTime: labEndTime,
      purpose: 'Research experiment',
      status: 'confirmed',
      attendees: {
        count: 2
      },
      qrCode: 'data:image/png;base64,fakeQRCodeDataForDemo'
    });
    
    console.log('Bookings created');
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed function
seedData();