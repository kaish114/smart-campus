import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
  Collapse,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  SupervisedUserCircle as UserIcon,
  Settings as SettingsIcon,
  Map as MapIcon,
  MeetingRoom as RoomIcon,
  Science as LabIcon,
  SportsBasketball as SportsIcon,
  ExpandLess,
  ExpandMore,
  AdminPanelSettings as AdminIcon,
  QrCodeScanner as QrCodeIcon,
  Devices as EquipmentIcon,
  Forum as ForumIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const Sidebar = ({ open, toggleDrawer }) => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [resourcesOpen, setResourcesOpen] = React.useState(false);

  const handleResourcesClick = () => {
    setResourcesOpen(!resourcesOpen);
  };

  // Determine if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Main navigation items
  const mainNavItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
    },
    {
      text: 'Campus Map',
      icon: <MapIcon />,
      path: '/map',
    },
    {
      text: 'My Bookings',
      icon: <EventIcon />,
      path: '/bookings',
    },
  ];

  // Resource submenu items
  const resourceItems = [
    {
      text: 'Study Rooms',
      icon: <RoomIcon />,
      path: '/resources?type=study_room',
    },
    {
      text: 'Lab Equipment',
      icon: <LabIcon />,
      path: '/resources?type=lab_equipment',
    },
    {
      text: 'Sports Facilities',
      icon: <SportsIcon />,
      path: '/resources?type=sports_facility',
    },
    {
      text: 'Conference Rooms',
      icon: <ForumIcon />,
      path: '/resources?type=conference_room',
    },
    {
      text: 'All Resources',
      icon: <EquipmentIcon />,
      path: '/resources',
    },
  ];

  // Admin menu items (only shown to admins)
  const adminItems = [
    {
      text: 'User Management',
      icon: <UserIcon />,
      path: '/admin/users',
    },
    {
      text: 'Resource Management',
      icon: <SettingsIcon />,
      path: '/admin/resources',
    },
    {
      text: 'Booking Analytics',
      icon: <QrCodeIcon />,
      path: '/admin/analytics',
    },
  ];

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#f5f5f5',
          borderRight: '1px solid #e0e0e0',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <List>
          {mainNavItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={RouterLink}
              to={item.path}
              selected={isActive(item.path)}
              sx={{
                mb: 0.5,
                borderRadius: '0 20px 20px 0',
                ml: 0.5,
                mr: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}

          {/* Resources Collapsible Section */}
          <ListItem
            button
            onClick={handleResourcesClick}
            sx={{
              mb: 0.5,
              borderRadius: '0 20px 20px 0',
              ml: 0.5,
              mr: 1,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              },
            }}
          >
            <ListItemIcon>
              <EquipmentIcon />
            </ListItemIcon>
            <ListItemText primary="Resources" />
            {resourcesOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          
          <Collapse in={resourcesOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {resourceItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  component={RouterLink}
                  to={item.path}
                  selected={isActive(item.path)}
                  sx={{
                    pl: 4,
                    mb: 0.5,
                    borderRadius: '0 20px 20px 0',
                    ml: 0.5,
                    mr: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit', minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Profile Section */}
        <List>
          <ListItem
            button
            component={RouterLink}
            to="/profile"
            selected={isActive('/profile')}
            sx={{
              mb: 0.5,
              borderRadius: '0 20px 20px 0',
              ml: 0.5,
              mr: 1,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ color: isActive('/profile') ? 'primary.main' : 'inherit' }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>

        {/* Admin Section - Only visible to admins */}
        {isAdmin() && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ px: 2, mb: 1 }}>
              <Typography variant="overline" color="text.secondary">
                Admin
              </Typography>
            </Box>
            <List>
              {adminItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  component={RouterLink}
                  to={item.path}
                  selected={isActive(item.path)}
                  sx={{
                    mb: 0.5,
                    borderRadius: '0 20px 20px 0',
                    ml: 0.5,
                    mr: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;