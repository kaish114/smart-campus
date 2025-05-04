import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  CircularProgress,
  Rating,
  Avatar,
  Alert,
} from '@mui/material';
import {
  LocationOn,
  Event,
  Person,
  Schedule,
  ArrowBack,
  CalendarToday,
  AccessTime,
  Favorite,
  FavoriteBorder,
  Info,
  Star,
  Comment,
} from '@mui/icons-material';
import { getResourceById, getResourceAvailability } from '../services/resourceService';
import { format } from 'date-fns';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`resource-tabpanel-${index}`}
      aria-labelledby={`resource-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Resource type configuration
const resourceTypeConfig = {
  study_room: {
    color: '#1976d2',
    label: 'Study Room'
  },
  lab_equipment: {
    color: '#7b1fa2',
    label: 'Lab Equipment'
  },
  sports_facility: {
    color: '#388e3c',
    label: 'Sports Facility'
  },
  conference_room: {
    color: '#f57c00',
    label: 'Conference Room'
  },
  library_resource: {
    color: '#6d4c41',
    label: 'Library Resource'
  },
  other: {
    color: '#616161',
    label: 'Other'
  }
};

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [favorited, setFavorited] = useState(false);
  
  // Fetch resource data
  useEffect(() => {
    const fetchResourceData = async () => {
      try {
        setLoading(true);
        
        // Fetch resource details
        const resourceResponse = await getResourceById(id);
        
        if (resourceResponse.success) {
          setResource(resourceResponse.data);
          
          // Fetch availability for today
          const availabilityResponse = await getResourceAvailability(id);
          
          if (availabilityResponse.success) {
            setAvailability(availabilityResponse.data);
          }
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
  }, [id]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    setFavorited(!favorited);
    // In a real app, this would call an API to update user preferences
  };
  
  // Get resource type styling
  const getTypeConfig = (type) => {
    return resourceTypeConfig[type] || resourceTypeConfig.other;
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

  const typeConfig = getTypeConfig(resource.type);

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Resources
      </Button>
      
      {/* Resource Header */}
      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <Box sx={{ position: 'relative' }}>
          {/* Resource Image */}
          <Box
            sx={{
              height: 250,
              width: '100%',
              bgcolor: 'grey.200',
              backgroundImage: resource.images && resource.images.length > 0 
                ? `url(${resource.images[0]})` 
                : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          
          {/* Favorite Button */}
          <IconButton
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
              },
            }}
            onClick={handleFavoriteToggle}
          >
            {favorited ? (
              <Favorite color="error" />
            ) : (
              <FavoriteBorder />
            )}
          </IconButton>
          
          {/* Resource Type Badge */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -18,
              left: 24,
              zIndex: 1,
            }}
          >
            <Chip
              label={typeConfig.label}
              sx={{
                backgroundColor: typeConfig.color,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                height: 36,
              }}
            />
          </Box>
        </Box>
        
        <Box sx={{ p: 3, pt: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" component="h1" gutterBottom>
                {resource.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body1" color="text.secondary">
                  {resource.location.building}, Floor {resource.location.floor}, Room {resource.location.roomNumber}
                </Typography>
              </Box>
              
              {resource.capacity && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body1" color="text.secondary">
                    Capacity: {resource.capacity} people
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTime color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body1" color="text.secondary">
                  {resource.availableTimeSlots.weekdays.start} - {resource.availableTimeSlots.weekdays.end} (Weekdays)
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body1" color="text.secondary">
                  Max Booking: {resource.maxBookingDuration} minutes
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={4.5} precision={0.5} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  4.5 (24 reviews)
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={RouterLink}
                to={`/resources/${resource._id}/book`}
                startIcon={<Event />}
                sx={{ minWidth: 150 }}
              >
                Book Now
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Tabs Section */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="resource tabs"
          >
            <Tab label="Details" id="resource-tab-0" />
            <Tab label="Availability" id="resource-tab-1" />
            <Tab label="Reviews" id="resource-tab-2" />
          </Tabs>
        </Box>
        
        {/* Details Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography paragraph>
                {resource.description}
              </Typography>
              
              {resource.amenities && resource.amenities.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Amenities
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {resource.amenities.map((amenity, index) => (
                      <Chip 
                        key={index} 
                        label={amenity}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </>
              )}
              
              {resource.restrictions && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Restrictions
                  </Typography>
                  <Typography paragraph>
                    This resource is available to:
                  </Typography>
                  
                  {resource.restrictions.userRoles && resource.restrictions.userRoles.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        User Types:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {resource.restrictions.userRoles.map((role, index) => (
                          <Chip 
                            key={index} 
                            label={role.charAt(0).toUpperCase() + role.slice(1)}
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {resource.restrictions.departments && resource.restrictions.departments.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Departments:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {resource.restrictions.departments.map((dept, index) => (
                          <Chip 
                            key={index} 
                            label={dept}
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Booking Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <List disablePadding>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CalendarToday fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Booking Interval"
                        secondary={`${resource.bookingInterval} minutes`}
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <AccessTime fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Max Duration"
                        secondary={`${resource.maxBookingDuration} minutes`}
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Info fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Booking Policy"
                        secondary="Users can book up to 2 weeks in advance"
                      />
                    </ListItem>
                  </List>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to={`/resources/${resource._id}/book`}
                    sx={{ mt: 2 }}
                  >
                    Check Availability & Book
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Availability Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Today's Availability
              </Typography>
              
              {availability ? (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    {format(new Date(availability.date), 'EEEE, MMMM d, yyyy')}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Operating hours: {availability.operatingHours.start} - {availability.operatingHours.end}
                  </Typography>
                  
                  <Box sx={{ my: 2 }}>
                    {availability.timeSlots.map((slot, index) => {
                      const startTime = new Date(slot.start);
                      const endTime = new Date(slot.end);
                      
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
                          }}
                        >
                          <Box>
                            <Typography variant="body1">
                              {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                            </Typography>
                            
                            <Chip 
                              size="small"
                              label={slot.isAvailable ? 'Available' : 'Booked'}
                              color={slot.isAvailable ? 'success' : 'error'}
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                          
                          {slot.isAvailable && (
                            <Button
                              variant="outlined"
                              size="small"
                              component={RouterLink}
                              to={`/resources/${resource._id}/book?start=${encodeURIComponent(slot.start)}&end=${encodeURIComponent(slot.end)}`}
                            >
                              Book
                            </Button>
                          )}
                        </Paper>
                      );
                    })}
                  </Box>
                </>
              ) : (
                <Typography color="text.secondary">
                  Availability information is not available at the moment.
                </Typography>
              )}
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to={`/resources/${resource._id}/book`}
                >
                  View Full Calendar
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Operating Hours
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <List disablePadding>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemText 
                        primary="Weekdays"
                        secondary={`${resource.availableTimeSlots.weekdays.start} - ${resource.availableTimeSlots.weekdays.end}`}
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemText 
                        primary="Weekends"
                        secondary={`${resource.availableTimeSlots.weekends.start} - ${resource.availableTimeSlots.weekends.end}`}
                      />
                    </ListItem>
                  </List>
                  
                  {resource.availableTimeSlots.exceptions && resource.availableTimeSlots.exceptions.length > 0 && (
                    <>
                      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                        Upcoming Exceptions
                      </Typography>
                      
                      <List disablePadding>
                        {resource.availableTimeSlots.exceptions.map((exception, index) => (
                          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                            <ListItemText 
                              primary={format(new Date(exception.date), 'MMM d, yyyy')}
                              secondary={exception.available ? 
                                (exception.customHours ? 
                                  `${exception.customHours.start} - ${exception.customHours.end}` : 
                                  'Regular hours'
                                ) : 
                                'Closed'
                              }
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ 
                                variant: 'body2',
                                color: exception.available ? 'success.main' : 'error.main'
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Reviews Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            User Reviews
          </Typography>
          
          {/* Mock reviews for demonstration */}
          <List>
            {[
              { 
                id: 1, 
                user: 'John D.', 
                date: '2 weeks ago', 
                rating: 5,
                comment: 'Excellent study room! Very quiet and comfortable with great lighting. Perfect for group projects.' 
              },
              { 
                id: 2, 
                user: 'Sarah M.', 
                date: '1 month ago', 
                rating: 4,
                comment: 'Good space overall. The whiteboard was useful for our team meeting. Would book again.' 
              },
              { 
                id: 3, 
                user: 'Michael L.', 
                date: '2 months ago', 
                rating: 5,
                comment: 'The projector works great and the room is spacious. Highly recommended for presentations.' 
              },
            ].map((review) => (
              <React.Fragment key={review.id}>
                <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', width: '100%' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {review.user.charAt(0)}
                    </Avatar>
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography variant="subtitle1">
                          {review.user}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {review.date}
                        </Typography>
                      </Box>
                      
                      <Rating value={review.rating} size="small" readOnly sx={{ mb: 1 }} />
                      
                      <Typography variant="body2" color="text.secondary">
                        {review.comment}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Comment />}
            >
              Write a Review
            </Button>
          </Box>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default ResourceDetails;