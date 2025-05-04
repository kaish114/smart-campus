import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Avatar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  AccountCircle,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Profile = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Sample list of departments (could be fetched from API in a real app)
  const departments = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Biology',
    'Chemistry',
    'Physics',
    'Mathematics',
    'Business Administration',
    'Economics',
    'Psychology',
    'Sociology',
    'Art & Design',
    'Music',
    'Literature',
    'History',
  ];

  // Profile update form
  const profileFormik = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      department: user?.department || '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      department: Yup.string().required('Department is required'),
    }),
    onSubmit: async (values) => {
      try {
        setProcessing(true);
        await updateProfile(values);
        setEditMode(false);
        setSuccessMessage('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
      } finally {
        setProcessing(false);
      }
    },
  });

  // Password change form
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: async (values) => {
      try {
        setProcessing(true);
        await changePassword(values.currentPassword, values.newPassword);
        handleClosePasswordDialog();
        setSuccessMessage('Password changed successfully');
      } catch (error) {
        console.error('Error changing password:', error);
      } finally {
        setProcessing(false);
      }
    },
  });

  // Handle password dialog
  const handleOpenPasswordDialog = () => {
    setChangePasswordOpen(true);
  };

  const handleClosePasswordDialog = () => {
    setChangePasswordOpen(false);
    passwordFormik.resetForm();
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };

  // Handle success message close
  const handleCloseSuccessMessage = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSuccessMessage('');
  };

  return (
    <Box>
      {/* Page Header */}
      <Typography variant="h4" component="h1" gutterBottom>
        Profile Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3
            }}>
              <Typography variant="h6">
                Personal Information
              </Typography>
              
              <Button
                variant={editMode ? 'outlined' : 'contained'}
                color={editMode ? 'secondary' : 'primary'}
                startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                onClick={() => {
                  if (editMode) {
                    profileFormik.handleSubmit();
                  } else {
                    setEditMode(true);
                  }
                }}
                disabled={processing}
              >
                {editMode ? 'Save Changes' : 'Edit Profile'}
                {processing && <CircularProgress size={24} sx={{ ml: 1 }} />}
              </Button>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <form onSubmit={profileFormik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="firstName"
                    name="firstName"
                    label="First Name"
                    value={profileFormik.values.firstName}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    error={profileFormik.touched.firstName && Boolean(profileFormik.errors.firstName)}
                    helperText={profileFormik.touched.firstName && profileFormik.errors.firstName}
                    disabled={!editMode}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="lastName"
                    name="lastName"
                    label="Last Name"
                    value={profileFormik.values.lastName}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    error={profileFormik.touched.lastName && Boolean(profileFormik.errors.lastName)}
                    helperText={profileFormik.touched.lastName && profileFormik.errors.lastName}
                    disabled={!editMode}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email Address"
                    value={profileFormik.values.email}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                    helperText={profileFormik.touched.email && profileFormik.errors.email}
                    disabled={!editMode}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel id="department-label">Department</InputLabel>
                    <Select
                      labelId="department-label"
                      id="department"
                      name="department"
                      value={profileFormik.values.department}
                      label="Department"
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={profileFormik.touched.department && Boolean(profileFormik.errors.department)}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Role: {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </Typography>
                  
                  {user?.studentId && (
                    <Typography variant="subtitle2" gutterBottom>
                      Student ID: {user.studentId}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </form>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Security
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Password
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                It's a good idea to use a strong password that you don't use elsewhere
              </Typography>
              
              <Button
                variant="outlined"
                onClick={handleOpenPasswordDialog}
              >
                Change Password
              </Button>
            </Box>
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Sessions
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Log out of all sessions, including this one
              </Typography>
              
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
              >
                Log Out
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Profile Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ mb: 2 }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto',
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </Avatar>
            </Box>
            
            <Typography variant="h6" gutterBottom>
              {user?.firstName} {user?.lastName}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              {user?.email}
            </Typography>
            
            {/* Upload profile photo button (non-functional in this demo) */}
            <Button variant="outlined" startIcon={<EditIcon />}>
              Change Photo
            </Button>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                Member since {new Date().getFullYear()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={handleClosePasswordDialog}>
        <DialogTitle>Change Password</DialogTitle>
        <form onSubmit={passwordFormik.handleSubmit}>
          <DialogContent>
            <DialogContentText>
              To change your password, please enter your current password and then your new password.
            </DialogContentText>
            
            <TextField
              margin="dense"
              id="currentPassword"
              name="currentPassword"
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              fullWidth
              value={passwordFormik.values.currentPassword}
              onChange={passwordFormik.handleChange}
              onBlur={passwordFormik.handleBlur}
              error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
              helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('current')}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="dense"
              id="newPassword"
              name="newPassword"
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              value={passwordFormik.values.newPassword}
              onChange={passwordFormik.handleChange}
              onBlur={passwordFormik.handleBlur}
              error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
              helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('new')}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="dense"
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              value={passwordFormik.values.confirmPassword}
              onChange={passwordFormik.handleChange}
              onBlur={passwordFormik.handleBlur}
              error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
              helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('confirm')}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePasswordDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={processing}
            >
              {processing ? 'Changing...' : 'Change Password'}
              {processing && <CircularProgress size={24} sx={{ ml: 1 }} />}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Success Message Snackbar */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={handleCloseSuccessMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSuccessMessage} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;