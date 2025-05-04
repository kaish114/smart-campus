import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  Rating,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  Schedule,
  LocationOn,
  Person,
  AccessTime,
  QrCode2 as QrCodeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import QRCode from 'qrcode.react';
import { getBookingById, cancelBooking, checkInBooking, checkOutBooking, submitBookingFeedback } from '../services/bookingService';
import { format, isPast, isFuture, isToday } from 'date-fns';
import { toast } from 'react-toastify';

// Status styles mapping
const statusStyles = {
  pending: {
    color: '#ff9800',
    label: 'Pending'
  },
  confirmed: {
    color: '#2196f3',
    label: 'Confirmed'
  },
  cancelled: {
    color: '#f44336',
    label: 'Cancelled'
  },
  completed: {
    color: '#4caf50',
    label: 'Completed'
  },
  no_show: {
    color: '#9e9e9e',
    label: 'No Show'
  }
};

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Fetch booking data
  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  // Fetch booking details from API
  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await getBookingById(id);
      
      if (response.success) {
        setBooking(response.data);
      } else {
        setError('Failed to load booking details');
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('An error occurred while loading booking details');
    } finally {
      setLoading(false);
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    try {
      setProcessing(true);
      
      const response = await cancelBooking(id, cancelReason);
      
      if (response.success) {
        // Update booking status
        setBooking({ ...booking, status: 'cancelled', cancellationReason: cancelReason });
        toast.success('Booking cancelled successfully');
        setCancelDialogOpen(false);
      } else {
        throw new Error(response.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || 'An error occurred while cancelling your booking');
    } finally {
      setProcessing(false);
    }
  };

  // Handle check-in
  const handleCheckIn = async () => {
    try {
      setProcessing(true);
      
      const response = await checkInBooking(id);
      
      if (response.success) {
        // Update booking check-in time
        setBooking({ ...booking, checkInTime: new Date().toISOString() });
        toast.success('Check-in successful');
      } else {
        throw new Error(response.error || 'Failed to check in');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error(error.message || 'An error occurred while checking in');
    } finally {
      setProcessing(false);
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    try {
      setProcessing(true);
      
      const response = await checkOutBooking(id);
      
      if (response.success) {
        // Update booking check-out time and status
        setBooking({ 
          ...booking, 
          checkOutTime: new Date().toISOString(),
          status: 'completed'
        });
        toast.success('Check-out successful');
      } else {
        throw new Error(response.error || 'Failed to check out');
      }
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error(error.message || 'An error occurred while checking out');
    } finally {
      setProcessing(false);
    }
  };

  // Handle feedback submission
  const handleSubmitFeedback = async () => {
    try {
      setProcessing(true);
      
      const feedbackData = {
        rating: feedbackRating,
        comment: feedbackComment
      };
      
      const response = await submitBookingFeedback(id, feedbackData);
      
      if (response.success) {
        // Update booking feedback
        setBooking({ 
          ...booking, 
          feedback: {
            rating: feedbackRating,
            comment: feedbackComment,
            submittedAt: new Date().toISOString()
          }
        });
        toast.success('Feedback submitted successfully');
        setFeedbackDialogOpen(false);
      } else {
        throw new Error(response.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error.message || 'An error occurred while submitting your feedback');
    } finally {
      setProcessing(false);
    }
  };

  // Check if booking can be cancelled
  const canCancel = () => {
    if (!booking) return false;
    return ['pending', 'confirmed'].includes(booking.status) && isFuture(new Date(booking.startTime));
  };

  // Check if booking can be checked in
  const canCheckIn = () => {
    if (!booking) return false;
    
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const bufferTime = 15 * 60 * 1000; // 15 minutes in milliseconds
    
    return booking.status === 'confirmed' && 
           !booking.checkInTime && 
           now >= new Date(startTime.getTime() - bufferTime) && 
           isToday(startTime);
  };

  // Check if booking can be checked out
  const canCheckOut = () => {
    if (!booking) return false;
    return booking.status === 'confirmed' && 
           booking.checkInTime && 
           !booking.checkOutTime && 
           (isToday(new Date(booking.startTime)) || isToday(new Date(booking.endTime)));
  };

  // Check if feedback can be submitted
  const canSubmitFeedback = () => {
    if (!booking) return false;
    return booking.status === 'completed' && 
           (!booking.feedback || !booking.feedback.submittedAt);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !booking) {
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
          {error || 'Booking not found'}
        </Alert>
        <Button
          variant="contained"
          component={RouterLink}
          to="/bookings"
        >
          View All Bookings
        </Button>
      </Box>
    );
  }

  // Format dates
  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  const formattedDate = format(startDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
  const durationMinutes = Math.round((endDate - startDate) / (1000 * 60));
  
  // Get status styling
  const statusStyle = statusStyles[booking.status] || statusStyles.pending;

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/bookings')}
        sx={{ mb: 2 }}
      >
        Back to Bookings
      </Button>
      
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1">
          Booking Details
        </Typography>
        
        <Chip 
          label={statusStyle.label}
          sx={{ 
            backgroundColor: `${statusStyle.color}15`, 
            color: statusStyle.color,
            fontWeight: 'medium',
            mt: { xs: 1, sm: 0 }
          }}
        />
      </Box>
      
      <Grid container spacing={3}>
        {/* Booking Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                {booking.resource.name}
              </Typography>
              
              <Typography variant="body1" color="text.secondary">
                Reference ID: {booking._id}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <CalendarToday fontSize="small" sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Date
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {formattedDate}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Schedule fontSize="small" sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Time
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {formattedTime} ({durationMinutes} minutes)
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Person fontSize="small" sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Attendees
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {booking.attendees ? booking.attendees.count : 1} {booking.attendees && booking.attendees.count === 1 ? 'person' : 'people'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <LocationOn fontSize="small" sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Location
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {booking.resource.location.building}, Room {booking.resource.location.roomNumber}
                  </Typography>
                </Box>
                
                {(booking.checkInTime || booking.checkOutTime) && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <AccessTime fontSize="small" sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Check-in/out
                      </Typography>
                    </Box>
                    
                    {booking.checkInTime && (
                      <Typography variant="body2">
                        Checked in: {format(new Date(booking.checkInTime), 'h:mm a')}
                      </Typography>
                    )}
                    
                    {booking.checkOutTime && (
                      <Typography variant="body2">
                        Checked out: {format(new Date(booking.checkOutTime), 'h:mm a')}
                      </Typography>
                    )}
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Purpose:
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {booking.purpose}
                  </Typography>
                </Box>
                
                {booking.cancellationReason && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Cancellation Reason:
                    </Typography>
                    <Typography variant="body1" color="error">
                      {booking.cancellationReason}
                    </Typography>
                  </Box>
                )}
                
                {booking.notes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Notes:
                    </Typography>
                    <Typography variant="body1">
                      {booking.notes}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
          
          {/* Feedback Section */}
          {(booking.feedback?.submittedAt || canSubmitFeedback()) && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Feedback
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              {booking.feedback?.submittedAt ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={booking.feedback.rating} readOnly precision={0.5} />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      Submitted on {format(new Date(booking.feedback.submittedAt), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                  
                  {booking.feedback.comment && (
                    <Typography variant="body1">
                      "{booking.feedback.comment}"
                    </Typography>
                  )}
                </>
              ) : (
                <>
                  <Typography variant="body2" paragraph>
                    Please rate your experience with this resource:
                  </Typography>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setFeedbackDialogOpen(true)}
                  >
                    Submit Feedback
                  </Button>
                </>
              )}
            </Paper>
          )}
        </Grid>
        
        {/* Action Sidebar */}
        <Grid item xs={12} md={4}>
          {/* QR Code Card */}
          {booking.status === 'confirmed' && !isPast(new Date(booking.endTime)) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Check-in Code
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<QrCodeIcon />}
                    onClick={() => setShowQrCode(true)}
                  >
                    Show QR Code
                  </Button>
                </Box>
                
                <Typography variant="body2" color="text.secondary" align="center">
                  Use this QR code at the resource location for check-in.
                </Typography>
              </CardContent>
            </Card>
          )}
          
          {/* Actions Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {canCheckIn() && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<CheckIcon />}
                    onClick={handleCheckIn}
                    disabled={processing}
                    fullWidth
                  >
                    Check In
                  </Button>
                )}
                
                {canCheckOut() && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<CloseIcon />}
                    onClick={handleCheckOut}
                    disabled={processing}
                    fullWidth
                  >
                    Check Out
                  </Button>
                )}
                
                {canCancel() && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setCancelDialogOpen(true)}
                    disabled={processing}
                    fullWidth
                  >
                    Cancel Booking
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<EditIcon />}
                  component={RouterLink}
                  to={`/resources/${booking.resource._id}/book`}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Book Again
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* QR Code Dialog */}
      <Dialog open={showQrCode} onClose={() => setShowQrCode(false)}>
        <DialogTitle>Check-in QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, mb: 2 }}>
              {booking.qrCode ? (
                <img src={booking.qrCode} alt="QR Code" style={{ width: 200, height: 200 }} />
              ) : (
                <QRCode
                  value={JSON.stringify({
                    bookingId: booking._id,
                    resourceId: booking.resource._id,
                    startTime: booking.startTime,
                    endTime: booking.endTime
                  })}
                  size={200}
                  level="H"
                />
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary" align="center">
              Show this QR code at the resource location to check in.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQrCode(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this booking? Please provide a reason:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Cancellation Reason"
            fullWidth
            variant="outlined"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Go Back
          </Button>
          <Button 
            onClick={handleCancelBooking} 
            color="error" 
            variant="contained"
            disabled={processing}
          >
            {processing ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onClose={() => setFeedbackDialogOpen(false)}>
        <DialogTitle>Submit Feedback</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please rate your experience with this resource:
          </DialogContentText>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <Rating
              value={feedbackRating}
              onChange={(event, newValue) => {
                setFeedbackRating(newValue);
              }}
              size="large"
              precision={0.5}
            />
          </Box>
          
          <TextField
            margin="dense"
            label="Comments (Optional)"
            fullWidth
            variant="outlined"
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
            multiline
            rows={4}
            placeholder="Tell us about your experience with this resource..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitFeedback} 
            color="primary" 
            variant="contained"
            disabled={processing || !feedbackRating}
          >
            {processing ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingDetails;