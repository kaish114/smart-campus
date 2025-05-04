import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 'auto',
        py: 3, 
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ mb: 2, mr: 4 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              Smart Campus
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
              Streamlining campus resource management for an enhanced academic experience.
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2, mr: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              Resources
            </Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 0.5 }}>
                <Link href="/resources?type=study_room" underline="hover" color="text.secondary">
                  Study Rooms
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 0.5 }}>
                <Link href="/resources?type=lab_equipment" underline="hover" color="text.secondary">
                  Lab Equipment
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 0.5 }}>
                <Link href="/resources?type=sports_facility" underline="hover" color="text.secondary">
                  Sports Facilities
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 0.5 }}>
                <Link href="/resources?type=conference_room" underline="hover" color="text.secondary">
                  Conference Rooms
                </Link>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ mb: 2, mr: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              Quick Links
            </Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 0.5 }}>
                <Link href="/map" underline="hover" color="text.secondary">
                  Campus Map
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 0.5 }}>
                <Link href="/bookings" underline="hover" color="text.secondary">
                  My Bookings
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 0.5 }}>
                <Link href="/profile" underline="hover" color="text.secondary">
                  Profile Settings
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 0.5 }}>
                <Link href="/help" underline="hover" color="text.secondary">
                  Help & Support
                </Link>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              Contact
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              University Campus, Building A
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Email: support@smartcampus.edu
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Phone: +1 (123) 456-7890
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {currentYear} Smart Campus. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="/privacy" underline="hover" color="text.secondary" variant="body2">
              Privacy Policy
            </Link>
            <Link href="/terms" underline="hover" color="text.secondary" variant="body2">
              Terms of Service
            </Link>
            <Link href="/accessibility" underline="hover" color="text.secondary" variant="body2">
              Accessibility
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;