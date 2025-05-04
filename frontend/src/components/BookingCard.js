import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CardActionArea,
  CardActions,
  Divider,
} from '@mui/material';
import {
  LocationOn,
  Schedule,
  CheckCircle,
  Cancel,
  Event,
  Info,
} from '@mui/icons-material';
import { format, isFuture, isPast, isToday } from 'date-fns';

// Status styles mapping
const statusStyles = {
  pending: {
    color: '#ff9800',
    icon: <Info fontSize="small" />,
    label: 'Pending'
  },
  confirmed: {
    color: '#2196f3',
    icon: <Event fontSize="small" />,
    label: 'Confirmed'
  },
  cancelled: {
    color: '#f44336',
    icon: <Cancel fontSize="small" />,
    label: 'Cancelled'
  },
  completed: {
    color: '#4caf50',
    icon: <CheckCircle fontSize="small" />,
    label: 'Completed'
  },
  no_show: {
    color: '#9e9e9e',
    icon: <Cancel fontSize="small" />,
    label: 'No Show'
  }
};

const BookingCard = ({ booking, onCancelBooking, onCheckIn, onCheckOut }) => {
  // Get status styling
  const statusStyle = statusStyles[booking.status] || statusStyles.pending;
  
  // Format dates
  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  
  const dateStr = isToday(startDate) 
    ? 'Today' 
    : format(startDate, 'EEE, MMM d, yyyy');
  
  const timeStr = `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
  
  // Determine if booking can be checked in
  const canCheckIn = booking.status === 'confirmed' && !booking.checkInTime && isToday(startDate);
  
  // Determine if booking can be checked out
  const canCheckOut = booking.status === 'confirmed' && booking.checkInTime && !booking.checkOutTime && (isToday(startDate) || isToday(endDate));
  
  // Determine if booking can be cancelled
  const canCancel = ['pending', 'confirmed'].includes(booking.status) && isFuture(startDate);
  
  // Determine if feedback can be submitted
  const canSubmitFeedback = booking.status === 'completed' && (!booking.feedback || !booking.feedback.submittedAt);

  return (
    <Card 
      elevation={1} 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardActionArea component={RouterLink} to={`/bookings/${booking._id}`}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 0 }}>
              {booking.resource.name}
            </Typography>
            
            <Chip 
              icon={statusStyle.icon}
              label={statusStyle.label}
              size="small"
              sx={{ 
                backgroundColor: `${statusStyle.color}15`, 
                color: statusStyle.color,
                fontWeight: 'medium'
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {booking.resource.location.building}, Room {booking.resource.location.roomNumber}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Schedule fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {dateStr}, {timeStr}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 1.5 }} />
          
          <Typography variant="body2" fontWeight="medium" color="text.primary">
            Purpose:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {booking.purpose}
          </Typography>
          
          {booking.attendees && booking.attendees.count > 1 && (
            <Typography variant="body2" color="text.secondary">
              {booking.attendees.count} attendees
            </Typography>
          )}
          
          {booking.checkInTime && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CheckCircle fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
              <Typography variant="body2" color="success.main">
                Checked in: {format(new Date(booking.checkInTime), 'h:mm a')}
              </Typography>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
      
      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 1 }}>
        {canCheckIn && (
          <Button 
            size="small" 
            variant="outlined" 
            color="primary"
            onClick={() => onCheckIn(booking._id)}
          >
            Check In
          </Button>
        )}
        
        {canCheckOut && (
          <Button 
            size="small" 
            variant="outlined" 
            color="primary"
            onClick={() => onCheckOut(booking._id)}
          >
            Check Out
          </Button>
        )}
        
        {canCancel && (
          <Button 
            size="small" 
            variant="outlined" 
            color="error"
            onClick={() => onCancelBooking(booking._id)}
          >
            Cancel
          </Button>
        )}
        
        {canSubmitFeedback && (
          <Button 
            size="small" 
            variant="outlined" 
            color="secondary"
            component={RouterLink}
            to={`/bookings/${booking._id}/feedback`}
          >
            Rate
          </Button>
        )}
        
        <Button 
          size="small" 
          variant="contained" 
          color="primary"
          component={RouterLink}
          to={`/bookings/${booking._id}`}
        >
          Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default BookingCard;