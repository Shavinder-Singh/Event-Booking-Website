const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.js');
const { createEvent, getEvents, getEventById, updateEvent, deleteEvent } = require('../controllers/eventController.js');

//Get All Events
router.get('/', getEvents);

//Get Event By Id
router.get('/:id', getEventById);

//Create Event
router.post('/', protect, admin, createEvent);

//Update Event
router.put('/:id', protect, admin, updateEvent);

//Delete Event
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;