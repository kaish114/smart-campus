const express = require('express');
const { check } = require('express-validator');
const resourceController = require('../controllers/resourceController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();

// Get all resources and create new resource
router.route('/')
  .get(resourceController.getResources)
  .post(
    [
      authMiddleware,
      adminMiddleware,
      [
        check('name', 'Name is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty(),
        check('type', 'Type is required').not().isEmpty(),
        check('location.building', 'Building name is required').not().isEmpty(),
        check('location.floor', 'Floor number is required').not().isEmpty(),
        check('location.roomNumber', 'Room number is required').not().isEmpty(),
        check('location.coordinates.latitude', 'Latitude is required').not().isEmpty(),
        check('location.coordinates.longitude', 'Longitude is required').not().isEmpty()
      ]
    ],
    resourceController.createResource
  );

// Get, update and delete single resource
router.route('/:id')
  .get(resourceController.getResource)
  .put(authMiddleware, adminMiddleware, resourceController.updateResource)
  .delete(authMiddleware, adminMiddleware, resourceController.deleteResource);

// Get resource availability
router.get('/:id/availability', resourceController.getResourceAvailability);

module.exports = router;