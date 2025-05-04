import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ResourceList from './pages/ResourceList';
import ResourceDetails from './pages/ResourceDetails';
import BookingForm from './pages/BookingForm';
import MyBookings from './pages/MyBookings';
import BookingDetails from './pages/BookingDetails';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import CampusMap from './pages/CampusMap';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Context
import { useAuth } from './context/AuthContext';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  const { isAuthenticated, loading, checkAuthStatus } = useAuth();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="map" element={
              <PrivateRoute>
                <CampusMap />
              </PrivateRoute>
            } />
            
            <Route path="resources" element={
              <PrivateRoute>
                <ResourceList />
              </PrivateRoute>
            } />
            
            <Route path="resources/:id" element={
              <PrivateRoute>
                <ResourceDetails />
              </PrivateRoute>
            } />
            
            <Route path="resources/:id/book" element={
              <PrivateRoute>
                <BookingForm />
              </PrivateRoute>
            } />
            
            <Route path="bookings" element={
              <PrivateRoute>
                <MyBookings />
              </PrivateRoute>
            } />
            
            <Route path="bookings/:id" element={
              <PrivateRoute>
                <BookingDetails />
              </PrivateRoute>
            } />
            
            <Route path="profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;