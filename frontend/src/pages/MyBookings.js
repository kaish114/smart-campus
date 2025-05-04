import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { getBookings, cancelBooking, checkInBooking, checkOutBooking } from '../services/bookingService';
import { format, isPast, isFuture, isToday } from 'date-fns';
import BookingCard from '../components/BookingCard';
import { toast } from 'react-toastify';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState('startTime');
  const [sortDirection, setSortDirection] = useState('asc');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // Tab labels and filters
  const tabs = [
    { label: 'Upcoming', filter: booking => isFuture(new Date(booking.startTime)) && booking.status !== 'cancelled' },
    { label: 'Today', filter: booking => isToday(new Date(booking.startTime)) && booking.status !== 'cancelled' },
    { label: 'Past', filter: booking => isPast(new Date(booking.endTime)) && booking.status !== 'cancelled' },
    { label: 'Cancelled', filter: booking => booking.status === 'cancelled' },
  ];

  // Fetch bookings
  useEffect(() => {
    fetchBookings();
  }, []);

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getBookings();
      
      if (response.success) {
        setBookings(response.data);
      } else {
        setError('Failed to load bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('An error occurred while loading your bookings');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle sort menu
  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortSelect = (field, direction) => {
    setSortBy(field);
    setSortDirection(direction);
    setSortAnchorEl(null);
  };

  // Handle booking cancellation
  const handleCancelClick = (bookingId) => {
    setBookingToCancel(bookingId);
    setCancelDialogOpen(true);
  };

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setBookingToCancel(null);
    setCancelReason('');
  };

  const handleCancelBooking = async () => {
    try {
      setProcessing(true);
      
      const response = await cancelBooking(bookingToCancel, cancelReason);
      
      if (response.success) {
        // Update booking status in state
        setBookings(bookings.map(booking => 
          booking._id === bookingToCancel 
            ? { ...booking, status: 'cancelled', cancellationReason: cancelReason } 
            : booking
        ));
        
        toast.success('Booking cancelled successfully');
      } else {
        throw new Error(response.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || 'An error occurred while cancelling your booking');
    } finally {
      setProcessing(false);
      handleCancelDialogClose();
    }
  };

  // Handle check-in
  const handleCheckIn = async (bookingId) => {
    try {
      setProcessing(true);
      
      const response = await checkInBooking(bookingId);
      
      if (response.success) {
        // Update booking in state
        setBookings(bookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, checkInTime: new Date().toISOString() } 
            : booking
        ));
        
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
  const handleCheckOut = async (bookingId) => {
    try {
      setProcessing(true);
      
      const response = await checkOutBooking(bookingId);
      
      if (response.success) {
        // Update booking in state
        setBookings(bookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, checkOutTime: new Date().toISOString(), status: 'completed' } 
            : booking
        ));
        
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

  // Filter and sort bookings
  const getFilteredBookings = () => {
    let filtered = [...bookings];
    
    // Apply tab filter
    filtered = filtered.filter(tabs[tabValue].filter);
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.resource.name.toLowerCase().includes(searchLower) ||
        booking.resource.location.building.toLowerCase().includes(searchLower) ||
        booking.purpose.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valA, valB;
      
      switch (sortBy) {
        case 'resourceName':
          valA = a.resource.name;
          valB = b.resource.name;
          break;
        case 'location':
          valA = a.resource.location.building;
          valB = b.resource.location.building;
          break;
        case 'startTime':
        default:
          valA = new Date(a.startTime);
          valB = new Date(b.startTime);
          break;
      }
      
      if (sortDirection === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const filteredBookings = getFilteredBookings();

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Bookings
        </Typography>
        <Typography color="text.secondary">
          Manage your resource reservations
        </Typography>
      </Box>
      
      {/* Search and Filter Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          variant="outlined"
          placeholder="Search bookings..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchTerm('')}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <IconButton onClick={handleSortClick}>
          <SortIcon />
        </IconButton>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/resources"
        >
          New Booking
        </Button>
      </Box>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="booking tabs"
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Box>
      
      {/* Bookings Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : filteredBookings.length > 0 ? (
        <Grid container spacing={3}>
          {filteredBookings.map((booking) => (
            <Grid item xs={12} sm={6} md={4} key={booking._id}>
              <BookingCard
                booking={booking}
                onCancelBooking={handleCancelClick}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bookings found
          </Typography>
          
          {tabValue === 0 && (
            <>
              <Typography color="text.secondary" paragraph>
                You don't have any upcoming bookings
              </Typography>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/resources"
                startIcon={<AddIcon />}
              >
                Book a Resource
              </Button>
            </>
          )}
        </Box>
      )}
      
      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={handleSortClose}
      >
        <MenuItem 
          onClick={() => handleSortSelect('startTime', 'asc')}
          selected={sortBy === 'startTime' && sortDirection === 'asc'}
        >
          Date (Oldest First)
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortSelect('startTime', 'desc')}
          selected={sortBy === 'startTime' && sortDirection === 'desc'}
        >
          Date (Newest First)
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleSortSelect('resourceName', 'asc')}
          selected={sortBy === 'resourceName' && sortDirection === 'asc'}
        >
          Resource Name (A-Z)
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortSelect('resourceName', 'desc')}
          selected={sortBy === 'resourceName' && sortDirection === 'desc'}
        >
          Resource Name (Z-A)
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleSortSelect('location', 'asc')}
          selected={sortBy === 'location' && sortDirection === 'asc'}
        >
          Location (A-Z)
        </MenuItem>
      </Menu>
      
      {/* Cancel Booking Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelDialogClose}
      >
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
          <Button onClick={handleCancelDialogClose}>
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
    </Box>
  );
};

export default MyBookings;