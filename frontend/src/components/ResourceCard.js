import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  CardActionArea,
  CardActions,
  Tooltip,
} from '@mui/material';
import {
  LocationOn,
  Schedule,
  Person,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';

// Resource type icons and colors mapping
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

const ResourceCard = ({ resource }) => {
  // Determine resource type styling
  const typeConfig = resourceTypeConfig[resource.type] || resourceTypeConfig.other;

  // Process availability
  const isAvailable = resource.currentlyAvailable;
  
  // Default image if none provided
  const defaultImage = 'https://via.placeholder.com/300x150?text=Resource';
  const imageUrl = resource.images && resource.images.length > 0 
    ? resource.images[0] 
    : defaultImage;

  return (
    <Card 
      elevation={1} 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardActionArea component={RouterLink} to={`/resources/${resource._id}`}>
        <CardMedia
          component="img"
          height="140"
          image={imageUrl}
          alt={resource.name}
          sx={{ objectFit: 'cover' }}
        />
        
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="h2" gutterBottom noWrap sx={{ maxWidth: '70%' }}>
              {resource.name}
            </Typography>
            
            <Chip 
              label={typeConfig.label}
              size="small"
              sx={{ 
                backgroundColor: `${typeConfig.color}15`, 
                color: typeConfig.color,
                fontWeight: 'medium'
              }}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {resource.description}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {resource.location.building}, Room {resource.location.roomNumber}
            </Typography>
          </Box>
          
          {resource.capacity && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Person fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                Capacity: {resource.capacity}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Schedule fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {resource.maxBookingDuration} min max
            </Typography>
          </Box>
          
          {/* Rating would come from aggregated feedback in a real implementation */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating value={4.5} precision={0.5} size="small" readOnly />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              4.5 (24)
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
      
      <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
        <Tooltip title={isAvailable ? 'Available now' : 'Currently unavailable'}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isAvailable ? (
              <>
                <CheckCircle fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                <Typography variant="body2" color="success.main" fontWeight="medium">
                  Available
                </Typography>
              </>
            ) : (
              <>
                <Cancel fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />
                <Typography variant="body2" color="error.main" fontWeight="medium">
                  Unavailable
                </Typography>
              </>
            )}
          </Box>
        </Tooltip>
        
        <Button 
          size="small" 
          variant="contained" 
          color="primary"
          component={RouterLink}
          to={`/resources/${resource._id}/book`}
          disabled={!isAvailable}
        >
          Book Now
        </Button>
      </CardActions>
    </Card>
  );
};

export default ResourceCard;