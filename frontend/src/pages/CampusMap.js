import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, TextField, InputAdornment, List, ListItem, ListItemText, ListItemIcon, IconButton, Divider, Button, Alert, CircularProgress } from '@mui/material';
import { Search as SearchIcon, FilterList as FilterListIcon, Close as CloseIcon, Room as RoomIcon, School as SchoolIcon } from '@mui/icons-material';
import { getResources } from '../services/resourceService';
import CampusMapView from '../components/CampusMapView';

const CampusMap = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await getResources();
        
        if (response.success) {
          setResources(response.data);
          setFilteredResources(response.data);
          
          // Extract unique buildings for filtering
          const uniqueBuildings = [...new Set(response.data.map(resource => resource.location.building))];
          setBuildings(uniqueBuildings);
        } else {
          setError('Failed to load resources');
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
        setError('An error occurred while loading resources');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
  }, []);

  // Filter resources when search or building filter changes
  useEffect(() => {
    let result = [...resources];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(resource => 
        resource.name.toLowerCase().includes(searchLower) ||
        resource.location.building.toLowerCase().includes(searchLower) ||
        resource.location.roomNumber.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply building filter
    if (selectedBuilding) {
      result = result.filter(resource => resource.location.building === selectedBuilding);
    }
    
    setFilteredResources(result);
  }, [resources, searchTerm, selectedBuilding]);

  // Handle resource selection
  const handleResourceSelect = (resource) => {
    setSelectedResource(resource);
  };

  // Handle resource card click
  const handleResourceCardClick = (resource) => {
    setSelectedResource(resource);
    // Scroll to map on mobile
    if (window.innerWidth < 600) {
      document.getElementById('campus-map-container').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Clear building filter
  const handleClearBuildingFilter = () => {
    setSelectedBuilding('');
  };

  // Get resource icon based on type
  const getResourceIcon = (type) => {
    switch (type) {
      case 'study_room':
      case 'conference_room':
        return <RoomIcon />;
      default:
        return <SchoolIcon />;
    }
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
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Campus Map
        </Typography>
        <Typography color="text.secondary">
          Explore resources across campus
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Map Column */}
        <Grid item xs={12} md={8} id="campus-map-container">
          <Paper sx={{ p: 0, height: '600px', position: 'relative', overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
              </Box>
            ) : (
              <CampusMapView
                resources={filteredResources}
                selectedResource={selectedResource}
                onResourceSelect={handleResourceSelect}
              />
            )}
          </Paper>
        </Grid>
        
        {/* Sidebar Column */}
        <Grid item xs={12} md={4}>
          {/* Search and Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Find Resources
              </Typography>
              
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by name, building, or room..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Typography variant="subtitle2" gutterBottom>
                Building
              </Typography>
              
              <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {buildings.slice(0, 6).map((building) => (
                  <Button
                    key={building}
                    size="small"
                    variant={selectedBuilding === building ? 'contained' : 'outlined'}
                    color={selectedBuilding === building ? 'primary' : 'default'}
                    onClick={() => setSelectedBuilding(building === selectedBuilding ? '' : building)}
                    sx={{ mb: 1 }}
                  >
                    {building}
                  </Button>
                ))}
                
                {buildings.length > 6 && (
                  <Button
                    size="small"
                    color="inherit"
                  >
                    +{buildings.length - 6} more
                  </Button>
                )}
              </Box>
              
              {(searchTerm || selectedBuilding) && (
                <Button
                  size="small"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedBuilding('');
                  }}
                  sx={{ mt: 1 }}
                >
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Resource List */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="h6">
                  Resources {filteredResources.length > 0 && `(${filteredResources.length})`}
                </Typography>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredResources.length > 0 ? (
                <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
                  {filteredResources.map((resource) => (
                    <React.Fragment key={resource._id}>
                      <ListItem 
                        button
                        selected={selectedResource && selectedResource._id === resource._id}
                        onClick={() => handleResourceCardClick(resource)}
                      >
                        <ListItemIcon>
                          {getResourceIcon(resource.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={resource.name}
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {getResourceTypeLabel(resource.type)}
                              </Typography>
                              <br />
                              <Typography variant="body2" component="span" color="text.secondary">
                                {resource.location.building}, Room {resource.location.roomNumber}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No resources found
                  </Typography>
                  <Button 
                    variant="text" 
                    color="primary"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedBuilding('');
                    }}
                    sx={{ mt: 1 }}
                  >
                    Clear Filters
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CampusMap;