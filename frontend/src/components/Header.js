import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  Settings,
  Dashboard,
  CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Header = ({ toggleDrawer }) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  
  // Sample notifications (would come from API/context in a real app)
  const notifications = [
    { 
      id: 1, 
      message: 'Your booking for Room 101 starts in 15 minutes', 
      time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      read: false 
    },
    { 
      id: 2, 
      message: 'Your booking request for Lab Equipment has been approved', 
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: true 
    }
  ];

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#fff',
          color: 'primary.main',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
              letterSpacing: 1,
              flexGrow: 1
            }}
          >
            IIITU SMART CAMPUS
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Notifications">
              <IconButton
                size="large"
                color="inherit"
                onClick={handleNotificationMenuOpen}
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Account">
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                {user && user.profileImage ? (
                  <Avatar 
                    alt={`${user.firstName} ${user.lastName}`} 
                    src={user.profileImage} 
                    sx={{ width: 32, height: 32 }} 
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        id="profile-menu"
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {user ? `${user.firstName} ${user.lastName}` : 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user ? user.email : 'user@example.com'}
          </Typography>
        </Box>
        
        <MenuItem component={RouterLink} to="/dashboard" onClick={handleMenuClose}>
          <Dashboard fontSize="small" sx={{ mr: 1 }} />
          Dashboard
        </MenuItem>
        
        <MenuItem component={RouterLink} to="/bookings" onClick={handleMenuClose}>
          <CalendarToday fontSize="small" sx={{ mr: 1 }} />
          My Bookings
        </MenuItem>
        
        <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
          <Settings fontSize="small" sx={{ mr: 1 }} />
          Profile Settings
        </MenuItem>
        
        <MenuItem onClick={handleLogout}>
          <Logout fontSize="small" sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
      
      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        id="notification-menu"
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 500,
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Notifications
          </Typography>
        </Box>
        
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem 
              key={notification.id} 
              onClick={handleNotificationMenuClose}
              sx={{ 
                borderLeft: notification.read ? 'none' : '3px solid #1976d2',
                backgroundColor: notification.read ? 'inherit' : 'rgba(25, 118, 210, 0.08)',
                py: 1.5
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notification.time).toLocaleString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem onClick={handleNotificationMenuClose}>
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
              No notifications
            </Typography>
          </MenuItem>
        )}
        
        <Box sx={{ p: 1, borderTop: '1px solid #eee', textAlign: 'center' }}>
          <Button 
            size="small" 
            onClick={handleNotificationMenuClose}
            component={RouterLink}
            to="/notifications"
          >
            View All
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default Header;