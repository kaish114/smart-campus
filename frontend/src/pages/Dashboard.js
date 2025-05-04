import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Event as EventIcon,
  Room as RoomIcon,
  DateRange as DateRangeIcon,
  ArrowForward as ArrowForwardIcon,
  Explore as ExploreIcon,
  Search as SearchIcon,
  CalendarToday as CalendarTodayIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getBookings } from '../services/bookingService';
import { getResources } from '../services/resourceService';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [popularResources, setPopularResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch upcoming bookings for the user
        const bookingsResponse = await getBookings({
          sort: 'startTime',
          limit: 5,
          status: 'confirmed'
        });
        
        if (bookingsResponse.success) {
          setUpcomingBookings(bookingsResponse.data);
        }
        
        // Fetch popular resources (in a real app, this would be based on booking frequency)
        const resourcesResponse = await getResources({
          limit: 5,
        });
        
        if (resourcesResponse.success) {
          setPopularResources(resourcesResponse.data);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Get appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
          color: 'white'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {getGreeting()}, {user?.firstName || 'User'}
        </Typography>
        <Typography variant="subtitle1">
          Welcome to Smart Campus Resource Management System
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem 
                  button 
                  component={RouterLink}
                  to="/resources"
                  sx={{ borderRadius: 1, mb: 1 }}
                >
                  <ListItemIcon>
                    <SearchIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Find Resources" />
                  <ArrowForwardIcon fontSize="small" color="action" />
                </ListItem>
                
                <ListItem 
                  button 
                  component={RouterLink}
                  to="/map"
                  sx={{ borderRadius: 1, mb: 1 }}
                >
                  <ListItemIcon>
                    <ExploreIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Campus Map" />
                  <ArrowForwardIcon fontSize="small" color="action" />
                </ListItem>
                
                <ListItem 
                  button 
                  component={RouterLink}
                  to="/bookings"
                  sx={{ borderRadius: 1, mb: 1 }}
                >
                  <ListItemIcon>
                    <CalendarTodayIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="My Bookings" />
                  <ArrowForwardIcon fontSize="small" color="action" />
                </ListItem>
                
                <ListItem 
                  button 
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemIcon>
                    <NotificationsIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Notifications" />
                  <Chip 
                    label="3" 
                    size="small" 
                    color="primary" 
                    sx={{ fontSize: '0.75rem', height: 20 }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Bookings */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Upcoming Bookings
                </Typography>
                <Button 
                  component={RouterLink}
                  to="/bookings"
                  endIcon={<ArrowForwardIcon />}
                  size="small"
                >
                  View All
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {loading ? (
                <LinearProgress sx={{ my: 4 }} />
              ) : upcomingBookings.length > 0 ? (
                <List sx={{ width: '100%', p: 0 }}>
                  {upcomingBookings.map((booking) => {
                    // Convert dates
                    const startTime = new Date(booking.startTime);
                    const endTime = new Date(booking.endTime);
                    
                    return (
                      <React.Fragment key={booking._id}>
                        <ListItem 
                          alignItems="flex-start"
                          component={RouterLink}
                          to={`/bookings/${booking._id}`}
                          sx={{ 
                            textDecoration: 'none', 
                            color: 'inherit',
                            borderRadius: 1,
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                        >
                          <ListItemIcon sx={{ mt: 1 }}>
                            {booking.resource.type === 'study_room' ? (
                              <RoomIcon color="primary" />
                            ) : (
                              <EventIcon color="primary" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={booking.resource.name}
                            secondary={
                              <React.Fragment>
                                <Box component="span" sx={{ display: 'block', mb: 0.5 }}>
                                  <DateRangeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: '1rem' }} />
                                  {format(startTime, 'EEE, MMM d, yyyy')}
                                </Box>
                                <Box component="span" sx={{ display: 'block' }}>
                                  <EventIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: '1rem' }} />
                                  {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                                </Box>
                              </React.Fragment>
                            }
                          />
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                            <Chip 
                              label={booking.status}
                              size="small"
                              color={booking.status === 'confirmed' ? 'primary' : 'default'}
                            />
                          </Box>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary">
                    No upcoming bookings found
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    component={RouterLink}
                    to="/resources"
                    sx={{ mt: 2 }}
                  >
                    Book a Resource
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Popular Resources */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Popular Resources
                </Typography>
                <Button 
                  component={RouterLink}
                  to="/resources"
                  endIcon={<ArrowForwardIcon />}
                  size="small"
                >
                  View All
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {loading ? (
                <LinearProgress sx={{ my: 4 }} />
              ) : popularResources.length > 0 ? (
                <Grid container spacing={2}>
                  {popularResources.map((resource) => (
                    <Grid item xs={12} sm={6} md={4} key={resource._id}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="subtitle1" noWrap gutterBottom>
                            {resource.name}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <RoomIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {resource.location.building}, Room {resource.location.roomNumber}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mt: 2, textAlign: 'right' }}>
                            <Button
                              variant="outlined"
                              size="small"
                              component={RouterLink}
                              to={`/resources/${resource._id}`}
                            >
                              Details
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              color="primary"
                              component={RouterLink}
                              to={`/resources/${resource._id}/book`}
                              sx={{ ml: 1 }}
                            >
                              Book
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary">
                    No resources available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;