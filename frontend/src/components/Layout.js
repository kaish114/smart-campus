import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, CssBaseline, Container } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import { initSocket, closeSocket } from '../services/socketService';

const Layout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle drawer toggle
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Initialize socket on mount and close on unmount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initSocket();
    }
    
    return () => {
      if (isAuthenticated) {
        closeSocket();
      }
    };
  }, [isAuthenticated]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/login');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // If not authenticated, don't render the layout
  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Only show header and sidebar if authenticated */}
      {isAuthenticated && (
        <>
          <Header toggleDrawer={toggleDrawer} />
          <Sidebar open={drawerOpen} toggleDrawer={toggleDrawer} />
        </>
      )}
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          pt: isAuthenticated ? 8 : 0, 
          pb: 3,
          pl: isAuthenticated ? { xs: 0, sm: 2 } : 0,
          pr: isAuthenticated ? { xs: 0, sm: 2 } : 0,
          mt: isAuthenticated ? { xs: 0, sm: 2 } : 0,
          ml: isAuthenticated ? { xs: 0, sm: `${drawerOpen ? 240 : 0}px` } : 0,
          transition: theme => theme.transitions.create(['margin', 'padding'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
      
      {isAuthenticated && <Footer />}
    </Box>
  );
};

export default Layout;