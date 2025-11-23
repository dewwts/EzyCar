const express = require('express');
const {
    getBookings,
    getBooking,
    addBooking,
    updateBooking,
    deleteBooking,
    getMyBookingHistory
} = require('../controllers/bookings');

const router = express.Router();
const {protect, authorize} = require('../middleware/auth');

router.route('/')
    .get(protect, getBookings)
    .post(protect, authorize('admin','user'), addBooking);

router.route('/myhistory')
    .get(protect, authorize('admin','user'), getMyBookingHistory)

router.route('/:id')
    .get(protect, getBooking)
    .put(protect, updateBooking)
    .delete(protect, deleteBooking)

module.exports = router;