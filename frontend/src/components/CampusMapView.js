import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Button, Chip, Divider } from '@mui/material';
import { AccessTime, Person, Info } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Resource type markers (using Leaflet's divIcon for custom styling)
const createResourceIcon = (type) => {
  const markerColors = {
    study_room: '#1976d2',    // Blue
    lab_equipment: '#7b1fa2',  // Purple
    sports_facility: '#388e3c', // Green
    conference_room: '#f57c00', // Orange
    library_resource: '#6d4c41', // Brown
    other: '#616161'           // Gray
  };
  
  const color = markerColors[type] || markerColors.other;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 36px; 
      height: 36px; 
      border-radius: 50% 50% 50% 0; 
      background-color: ${color}; 
      position: relative;
      transform: rotate(-45deg);
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    ">
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: white;
        transform: rotate(45deg);
        display: flex;
        justify-content: center;
        align-items: center;
      "></div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

// Map view component that watches and updates the map position
const MapView = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

const CampusMapView = ({ resources, selectedResource, onResourceSelect }) => {
  const navigate = useNavigate();
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default center (would be set to campus center)
  const [mapZoom, setMapZoom] = useState(16);
  
  // Update map view when selected resource changes
  useEffect(() => {
    if (selectedResource) {
      const { latitude, longitude } = selectedResource.location.coordinates;
      setMapCenter([latitude, longitude]);
      setMapZoom(18);
    }
  }, [selectedResource]);
  
  // Handle booking button click
  const handleBookClick = (resourceId) => {
    navigate(`/resources/${resourceId}/book`);
  };
  
  // Handle details button click
  const handleDetailsClick = (resourceId) => {
    navigate(`/resources/${resourceId}`);
  };
  
  // Get resource type label
  const getResourceTypeLabel = (type) => {
    const typeLabels = {
      study_room: 'Study Room',
      lab_equipment: 'Lab Equipment',
      sports_facility: 'Sports Facility',
      conference_room: 'Conference Room',
      library_resource: 'Library Resource',
      other: 'Other'
    };
    
    return typeLabels[type] || typeLabels.other;
  };

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {resources.map(resource => (
          <Marker 
            key={resource._id} 
            position={[resource.location.coordinates.latitude, resource.location.coordinates.longitude]}
            icon={createResourceIcon(resource.type)}
            eventHandlers={{
              click: () => onResourceSelect(resource)
            }}
          >
            <Popup>
              <Box className="marker-popup">
                <Typography variant="h6" component="h3">
                  {resource.name}
                </Typography>
                
                <Chip 
                  label={getResourceTypeLabel(resource.type)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {resource.location.building}, Room {resource.location.roomNumber}
                </Typography>
                
                <Divider sx={{ mb: 1 }} />
                
                {resource.capacity && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Person fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      Capacity: {resource.capacity}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">
                    {resource.availableTimeSlots.weekdays.start} - {resource.availableTimeSlots.weekdays.end}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Info fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">
                    Max duration: {resource.maxBookingDuration} min
                  </Typography>
                </Box>
                
                <Box className="marker-popup-buttons">
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => handleDetailsClick(resource._id)}
                  >
                    Details
                  </Button>
                  
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="primary"
                    onClick={() => handleBookClick(resource._id)}
                  >
                    Book Now
                  </Button>
                </Box>
              </Box>
            </Popup>
          </Marker>
        ))}
        
        <MapView center={mapCenter} zoom={mapZoom} />
      </MapContainer>
    </Box>
  );
};

export default CampusMapView;