import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Grid,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Registration validation schema
const validationSchema = Yup.object({
  firstName: Yup.string()
    .required('First name is required')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .max(50, 'Last name cannot exceed 50 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  role: Yup.string()
    .required('Role is required')
    .oneOf(['student', 'faculty'], 'Invalid role selection'),
  studentId: Yup.string()
    .when('role', {
      is: 'student',
      then: Yup.string().required('Student ID is required for students'),
    }),
  department: Yup.string()
    .required('Department is required')
});

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
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

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
      studentId: '',
      department: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Remove confirmPassword as it's not needed in the API call
        const { confirmPassword, ...userData } = values;
        
        await register(userData);
        navigate('/');
      } catch (err) {
        // Error handling is done in the auth context
        if (err.response && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError('Registration failed. Please try again.');
        }
      }
    }
  });

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <Container component="main" maxWidth="md">
      <Grid container spacing={0} sx={{ minHeight: '100vh' }}>
        <Grid 
          item 
          xs={false} 
          md={6} 
          sx={{ 
            backgroundImage: 'url(https://source.unsplash.com/random?university)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) => t.palette.grey[50],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <Grid 
          item 
          xs={12} 
          md={6} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 3
          }}
        >
          <Box sx={{ maxWidth: 450, width: '100%' }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <SchoolIcon fontSize="large" color="primary" sx={{ fontSize: 56 }} />
              <Typography component="h1" variant="h4" fontWeight="bold" color="primary" sx={{ mt: 1 }}>
                Join Smart Campus
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Create your account to start booking campus resources
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="firstName"
                    name="firstName"
                    label="First Name"
                    variant="outlined"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                    helperText={formik.touched.firstName && formik.errors.firstName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="lastName"
                    name="lastName"
                    label="Last Name"
                    variant="outlined"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                    helperText={formik.touched.lastName && formik.errors.lastName}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email Address"
                    variant="outlined"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleToggleConfirmPassword}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl 
                    fullWidth
                    error={formik.touched.role && Boolean(formik.errors.role)}
                  >
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                      labelId="role-label"
                      id="role"
                      name="role"
                      value={formik.values.role}
                      label="Role"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="faculty">Faculty</MenuItem>
                    </Select>
                    {formik.touched.role && formik.errors.role && (
                      <FormHelperText>{formik.errors.role}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="studentId"
                    name="studentId"
                    label="Student ID"
                    variant="outlined"
                    value={formik.values.studentId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.studentId && Boolean(formik.errors.studentId)}
                    helperText={formik.touched.studentId && formik.errors.studentId}
                    disabled={formik.values.role !== 'student'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl 
                    fullWidth
                    error={formik.touched.department && Boolean(formik.errors.department)}
                  >
                    <InputLabel id="department-label">Department</InputLabel>
                    <Select
                      labelId="department-label"
                      id="department"
                      name="department"
                      value={formik.values.department}
                      label="Department"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                      ))}
                    </Select>
                    {formik.touched.department && formik.errors.department && (
                      <FormHelperText>{formik.errors.department}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={formik.isSubmitting}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                Register
              </Button>
              
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  or
                </Typography>
              </Divider>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" variant="body2" fontWeight="bold">
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </form>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Register;