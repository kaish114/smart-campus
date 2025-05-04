import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  IconButton,
  Pagination,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  SortByAlpha as SortIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import { getResources } from '../services/resourceService';
import ResourceCard from '../components/ResourceCard';

const ResourceList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // State for filter parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceType, setResourceType] = useState(queryParams.get('type') || '');
  const [sortBy, setSortBy] = useState('name');
  const [amenities, setAmenities] = useState([]);
  const [availabilityFilter, setAvailabilityFilter] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // State for resources and pagination
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState([]);
  
  // Resource types for filter dropdown
  const resourceTypes = [
    { value: '', label: 'All Types' },
    { value: 'study_room', label: 'Study Rooms' },
    { value: 'lab_equipment', label: 'Lab Equipment' },
    { value: 'sports_facility', label: 'Sports Facilities' },
    { value: 'conference_room', label: 'Conference Rooms' },
    { value: 'library_resource', label: 'Library Resources' },
    { value: 'other', label: 'Other' },
  ];
  
  // Amenities options
  const amenityOptions = [
    { value: 'Whiteboard', label: 'Whiteboard' },
    { value: 'Projector', label: 'Projector' },
    { value: 'Wi-Fi', label: 'Wi-Fi' },
    { value: 'Power outlets', label: 'Power Outlets' },
    { value: 'Video conferencing', label: 'Video Conferencing' },
    { value: 'Air conditioning', label: 'Air Conditioning' },
  ];
  
  // Sort options
  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: '-name', label: 'Name (Z-A)' },
    { value: 'location.building', label: 'Building' },
    { value: 'capacity', label: 'Capacity (Low to High)' },
    { value: '-capacity', label: 'Capacity (High to Low)' },
    { value: '-createdAt', label: 'Newest First' },
  ];

  // Fetch resources when filters change
  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, resourceType, sortBy, availabilityFilter]);
  
  // Update selected filters display
  useEffect(() => {
    const filters = [];
    
    if (resourceType) {
      const typeLabel = resourceTypes.find(t => t.value === resourceType)?.label || resourceType;
      filters.push({ key: 'type', value: resourceType, label: typeLabel });
    }
    
    if (availabilityFilter) {
      filters.push({ key: 'available', value: true, label: 'Available Now' });
    }
    
    amenities.forEach(amenity => {
      filters.push({ key: 'amenity', value: amenity, label: amenity });
    });
    
    setSelectedFilters(filters);
  }, [resourceType, amenities, availabilityFilter]);

  // Fetch resources from API
  const fetchResources = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        page,
        limit: 9,
        sort: sortBy,
      };
      
      if (searchTerm) {
        params.name = searchTerm;
      }
      
      if (resourceType) {
        params.type = resourceType;
      }
      
      if (availabilityFilter) {
        params.available = true;
      }
      
      if (amenities.length > 0) {
        params.amenities = amenities.join(',');
      }
      
      const response = await getResources(params);
      
      if (response.success) {
        setResources(response.data);
        setTotalPages(Math.ceil(response.pagination.total / response.pagination.limit));
      } else {
        console.error('Error fetching resources:', response.error);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  // Handle amenity filter changes
  const handleAmenityChange = (event) => {
    const value = event.target.value;
    if (event.target.checked) {
      setAmenities([...amenities, value]);
    } else {
      setAmenities(amenities.filter(a => a !== value));
    }
  };
  
  // Handle filter removal
  const handleRemoveFilter = (key, value) => {
    if (key === 'type') {
      setResourceType('');
    } else if (key === 'available') {
      setAvailabilityFilter(false);
    } else if (key === 'amenity') {
      setAmenities(amenities.filter(a => a !== value));
    }
  };
  
  // Apply filters
  const applyFilters = () => {
    setPage(1);
    fetchResources();
    setShowFilters(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setResourceType('');
    setSortBy('name');
    setAmenities([]);
    setAvailabilityFilter(false);
    setPage(1);
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Campus Resources
        </Typography>
        <Typography color="textSecondary">
          Browse and book available resources across campus
        </Typography>
      </Box>
      
      {/* Search and Filter Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Search Box */}
            <Grid item xs={12} md={6}>
              <form onSubmit={handleSearchSubmit}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                          onClick={() => setSearchTerm('')}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </form>
            </Grid>
            
            {/* Resource Type Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                variant="outlined"
                label="Resource Type"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
              >
                {resourceTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            {/* Sort By */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                variant="outlined"
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SortIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            {/* Advanced Filters Toggle */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  color="primary"
                >
                  {showFilters ? 'Hide Filters' : 'More Filters'}
                </Button>
                
                {selectedFilters.length > 0 && (
                  <Button
                    size="small"
                    onClick={resetFilters}
                    color="secondary"
                  >
                    Clear All
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
          
          {/* Selected Filters */}
          {selectedFilters.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {selectedFilters.map((filter, index) => (
                  <Chip
                    key={`${filter.key}-${index}`}
                    label={filter.label}
                    onDelete={() => handleRemoveFilter(filter.key, filter.value)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Box>
          )}
          
          {/* Advanced Filters Panel */}
          {showFilters && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                {/* Amenities Filter */}
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Amenities
                  </Typography>
                  <FormControl component="fieldset">
                    <FormGroup>
                      {amenityOptions.map((option) => (
                        <FormControlLabel
                          key={option.value}
                          control={
                            <Checkbox
                              checked={amenities.includes(option.value)}
                              onChange={handleAmenityChange}
                              value={option.value}
                              size="small"
                            />
                          }
                          label={option.label}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                </Grid>
                
                {/* Availability Filter */}
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Availability
                  </Typography>
                  <FormControl component="fieldset">
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={availabilityFilter}
                            onChange={(e) => setAvailabilityFilter(e.target.checked)}
                            size="small"
                          />
                        }
                        label="Available Now"
                      />
                    </FormGroup>
                  </FormControl>
                </Grid>
                
                {/* Filter Actions */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      onClick={resetFilters}
                      sx={{ mr: 1 }}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={applyFilters}
                      startIcon={<TuneIcon />}
                    >
                      Apply Filters
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Resource Grid */}
      <Box sx={{ mb: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : resources.length > 0 ? (
          <>
            <Grid container spacing={3}>
              {resources.map((resource) => (
                <Grid item xs={12} sm={6} md={4} key={resource._id}>
                  <ResourceCard resource={resource} />
                </Grid>
              ))}
            </Grid>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No resources found
            </Typography>
            <Typography color="textSecondary" paragraph>
              Try adjusting your search or filter criteria
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={resetFilters}
              sx={{ mt: 2 }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ResourceList;