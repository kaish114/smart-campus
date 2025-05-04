import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';

const NotFound = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 5, 
          textAlign: 'center',
          maxWidth: 500,
          borderRadius: 2,
        }}
      >
        <Typography 
          variant="h1" 
          component="h1" 
          color="primary"
          sx={{ 
            fontWeight: 700, 
            fontSize: { xs: '5rem', sm: '6rem' },
            mb: 2
          }}
        >
          404
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          The page you are looking for does not exist or has been moved.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/"
          size="large"
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;