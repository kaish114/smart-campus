import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Chip,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import {
  ArrowBack,
  CalendarToday,
  Schedule,
  Person,
  LocationOn,
  Add as AddIcon,
  Remove as RemoveIcon,
  Info as InfoIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getResourceById, getResourceAvailability } from '../services/resourceService';
import { createBooking } from '../services/bookingService';
import { format, addMinutes, isAfter, isBefore, startOfDay, endOfDay, setHours, setMinutes } from 'date-fns';
import { toast } from 'react-toastify';

// Steps for the booking process
const steps = ['Select Date & Time', 'Booking Details', 'Review & Confirm'];

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  
  // Get initial date and time from query params if available
  const initialStartTime = queryParams.get('start') ? new Date(queryParams.get('start')) : null;
  const initialEndTime = queryParams.get('end') ? new Date(queryParams.get('end')) : null;
  
  // State for resource and booking details
  const [resource, setResource] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  
  // State for form values
  const [selectedDate, setSelectedDate] = useState(initialStartTime ? initialStartTime : new Date());
  const [startTime, setStartTime] = useState(initialStartTime ? initialStartTime : null);
  const [endTime, setEndTime] = useState(initialEndTime ? initialEndTime : null);
  const [purpose, setPurpose] = useState('');
  const [attendeesCount, setAttendeesCount] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  
  // Fetch resource data
  useEffect(() => {
    const fetchResourceData = async () => {
      try {
        setLoading(true);
        
        // Fetch resource details
        const resourceResponse = await getResourceById(id);
        
        if (resourceResponse.success) {
          setResource(resourceResponse.data);
          
          // Set default end time if start time is already selected
          if (initialStartTime && !initialEndTime) {
            const defaultEndTime = addMinutes(initialStartTime, resourceResponse.data.bookingInterval);
            setEndTime(defaultEndTime);
          }
          
          // Fetch availability for selected date
          await fetchAvailability(selectedDate);
        } else {
          setError('Failed to load resource details');
        }
      } catch (error) {
        console.error('Error fetching resource details:', error);
        setError('An error occurred while loading resource details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResourceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  
  // Fetch availability for the selected date
  const fetchAvailability = async (date) => {
    try {
      const availabilityResponse = await getResourceAvailability(id, date);
      
      if (availabilityResponse.success) {
        setAvailability(availabilityResponse.data);
        setTimeSlots(availabilityResponse.data.timeSlots);
      } else {
        setError('Failed to load availability information');
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      setError('Failed to load availability information');
    }
  };
  
  // Handle date change
  const handleDateChange = async (newDate) => {
    setSelectedDate(newDate);
    setStartTime(null);
    setEndTime(null);
    await fetchAvailability(newDate);
  };
  
  // Handle start time change
  const handleStartTimeChange = (newTime) => {
    setStartTime(newTime);
    
    // Auto-suggest end time based on selected start time
    if (resource && newTime) {
      const suggestedEndTime = addMinutes(newTime, resource.bookingInterval);
      const maxEndTime = addMinutes(newTime, resource.maxBookingDuration);
      
      // Find a valid end time from available time slots
      let validEndTime = null;
      
      for (const slot of timeSlots) {
        const slotEndTime = new Date(slot.end);
        if (
          slot.isAvailable && 
          isAfter(slotEndTime, newTime) && 
          isBefore(slotEndTime, maxEndTime)
        ) {
          validEndTime = slotEndTime;
          break;
        }
      }
      
      setEndTime(validEndTime || suggestedEndTime);
    }
  };
  
  // Check if selected time range is available
  const isTimeRangeAvailable = () => {
    if (!startTime || !endTime || !timeSlots.length) return false;
    
    // Check if all time slots in the range are available
    for (const slot of timeSlots) {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      
      // If any part of the slot overlaps with our booking range and is not available
      if (
        !slot.isAvailable &&
        ((isAfter(slotStart, startTime) && isBefore(slotStart, endTime)) ||
        (isAfter(slotEnd, startTime) && isBefore(slotEnd, endTime)) ||
        (isBefore(slotStart, startTime) && isAfter(slotEnd, endTime)))
      ) {
        return false;
      }
    }
    
    return true;
  };
  
  // Validate current step
  const validateStep = () => {
    if (activeStep === 0) {
      // Validate date & time
      if (!startTime || !endTime) {
        toast.error('Please select start and end times');
        return false;
      }
      
      if (!isTimeRangeAvailable()) {
        toast.error('The selected time range is not available');
        return false;
      }
    } else if (activeStep === 1) {
      // Validate booking details
      if (!purpose.trim()) {
        toast.error('Please provide a purpose for your booking');
        return false;
      }
      
      if (attendeesCount < 1) {
        toast.error('Number of attendees must be at least 1');
        return false;
      }
      
      if (resource.capacity && attendeesCount > resource.capacity) {
        toast.error(`The maximum capacity for this resource is ${resource.capacity} people`);
        return false;
      }
    }
    
    return true;
  };
  
  // Handle step navigation
  const handleNext = () => {
    if (!validateStep()) return;
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle booking submission
  const handleSubmitBooking = async () => {
    try {
      setSubmitting(true);
      
      const bookingData = {
        resource: id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        purpose,
        attendees: {
          count: attendeesCount
        }
      };
      
      const response = await createBooking(bookingData);
      
      if (response.success) {
        setBookingSuccess(true);
        setBookingReference(response.data._id);
      } else {
        throw new Error(response.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.message || 'An error occurred while creating your booking');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle view booking after successful creation
  const handleViewBooking = () => {
    navigate(`/bookings/${bookingReference}`);
  };
  
  // Calculate duration in minutes
  const getDurationMinutes = () => {
    if (!startTime || !endTime) return 0;
    return Math.round((endTime - startTime) / (1000 * 60));
  };
  
  // Get formatted time range
  const getFormattedTimeRange = () => {
    if (!startTime || !endTime) return '';
    return `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !resource) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Resource not found'}
        </Alert>
        <Button
          variant="contained"
          component={RouterLink}
          to="/resources"
        >
          Browse Resources
        </Button>
      </Box>
    );
  }

  // Render booking success view
  if (bookingSuccess) {
    return (
      <Box>
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              sx={{
                backgroundColor: 'success.light',
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CheckIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
          </Box>
          
          <Typography variant="h5" gutterBottom>
            Booking Confirmed!
          </Typography>
          
          <Typography variant="body1" paragraph>
            Your booking for {resource.name} has been confirmed.
          </Typography>
          
          <Typography variant="body2" paragraph>
            Reference: {bookingReference}
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/resources')}
              sx={{ mr: 2 }}
            >
              Browse More Resources
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleViewBooking}
            >
              View Booking Details
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Resource
      </Button>
      
      {/* Page Header */}
      <Typography variant="h4" component="h1" gutterBottom>
        Book {resource.name}
      </Typography>
      
      <Typography color="text.secondary" paragraph>
        Select a date and time to book this resource
      </Typography>
      
      {/* Booking Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Step Content */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Step 1: Select Date & Time */}
        {activeStep === 0 && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Select Date & Time
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <DatePicker
                    label="Date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <TimePicker
                      label="Start Time"
                      value={startTime}
                      onChange={handleStartTimeChange}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                    
                    <TimePicker
                      label="End Time"
                      value={endTime}
                      onChange={setEndTime}
                      minTime={startTime ? addMinutes(startTime, resource.bookingInterval) : null}
                      maxTime={startTime ? addMinutes(startTime, resource.maxBookingDuration) : null}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                  <InfoIcon color="info" fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Maximum booking duration: {resource.maxBookingDuration} minutes
                  </Typography>
                </Box>
                
                {startTime && endTime && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Selected duration: {getDurationMinutes()} minutes
                    </Typography>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Available Time Slots
                </Typography>
                
                {availability ? (
                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {timeSlots.map((slot, index) => {
                      const slotStart = new Date(slot.start);
                      const slotEnd = new Date(slot.end);
                      
                      return (
                        <Paper 
                          key={index}
                          variant="outlined"
                          sx={{ 
                            mb: 1, 
                            p: 1.5,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: slot.isAvailable ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                            cursor: slot.isAvailable ? 'pointer' : 'default',
                            opacity: slot.isAvailable ? 1 : 0.7,
                            '&:hover': {
                              backgroundColor: slot.isAvailable ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.1)',
                            }
                          }}
                          onClick={() => {
                            if (slot.isAvailable) {
                              setStartTime(slotStart);
                              setEndTime(slotEnd);
                            }
                          }}
                        >
                          <Box>
                            <Typography variant="body1">
                              {format(slotStart, 'h:mm a')} - {format(slotEnd, 'h:mm a')}
                            </Typography>
                            
                            <Chip 
                              size="small"
                              label={slot.isAvailable ? 'Available' : 'Booked'}
                              color={slot.isAvailable ? 'success' : 'error'}
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    Select a date to view available time slots
                  </Typography>
                )}
              </Grid>
            </Grid>
          </LocalizationProvider>
        )}
        
        {/* Step 2: Booking Details */}
        {activeStep === 1 && (
          <>
            <Typography variant="h6" gutterBottom>
              Booking Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Purpose of Booking"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="E.g., Study group meeting, Project discussion, etc."
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    Number of Attendees:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton 
                      size="small"
                      onClick={() => setAttendeesCount(Math.max(1, attendeesCount - 1))}
                      disabled={attendeesCount <= 1}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    
                    <Typography sx={{ mx: 2, minWidth: '30px', textAlign: 'center' }}>
                      {attendeesCount}
                    </Typography>
                    
                    <IconButton 
                      size="small"
                      onClick={() => setAttendeesCount(attendeesCount + 1)}
                      disabled={resource.capacity && attendeesCount >= resource.capacity}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                {resource.capacity && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Maximum capacity: {resource.capacity} people
                  </Typography>
                )}
              </Grid>
            </Grid>
          </>
        )}
        
        {/* Step 3: Review & Confirm */}
        {activeStep === 2 && (
          <>
            <Typography variant="h6" gutterBottom>
              Review Booking Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Resource Information
                    </Typography>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">
                        {resource.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {resource.location.building}, Room {resource.location.roomNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Booking Information
                    </Typography>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          Date:
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ ml: 3 }}>
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Schedule fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          Time:
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ ml: 3 }}>
                        {getFormattedTimeRange()} ({getDurationMinutes()} minutes)
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          Attendees:
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ ml: 3 }}>
                        {attendeesCount} {attendeesCount === 1 ? 'person' : 'people'}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Purpose:
                      </Typography>
                      <Typography variant="body1">
                        {purpose}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Booking Policies
                    </Typography>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Typography variant="body2" paragraph>
                      By confirming this booking, you agree to the following terms:
                    </Typography>
                    
                    <Box component="ul" sx={{ pl: 2 }}>
                      <Box component="li" sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          You must check in within 15 minutes of your booking start time, or your reservation may be cancelled.
                        </Typography>
                      </Box>
                      
                      <Box component="li" sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          If you need to cancel, please do so at least 2 hours before your reservation.
                        </Typography>
                      </Box>
                      
                      <Box component="li" sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          You are responsible for the resource during your booking period.
                        </Typography>
                      </Box>
                      
                      <Box component="li">
                        <Typography variant="body2">
                          Please leave the resource in the same condition you found it.
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Booking as: {user?.email}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>
      
      {/* Stepper Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="outlined"
          onClick={activeStep === 0 ? () => navigate(-1) : handleBack}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={activeStep === steps.length - 1 ? handleSubmitBooking : handleNext}
          disabled={submitting}
        >
          {activeStep === steps.length - 1 ? (
            submitting ? 'Submitting...' : 'Confirm Booking'
          ) : (
            'Next'
          )}
          {submitting && <CircularProgress size={24} sx={{ ml: 1 }} />}
        </Button>
      </Box>
    </Box>
  );
};

export default BookingForm;