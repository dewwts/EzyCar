const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const asyncHandler = require('../middleware/async');

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Private (Admin/User)
exports.getBookings = asyncHandler(async (req, res, next) => {
    let query;
    if (req.user.role !== 'admin') {
        query = Booking.find({ user: req.user.id }).populate({
            path: 'provider',
            select: 'name address tel'
        });
    } else {
        query = Booking.find().populate({
            path: 'user',
            select: 'name email'
        }).populate({
            path: 'provider',
            select: 'name address tel'
        });
    }

    const bookings = await query;
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id).populate({
        path: 'provider',
        select: 'name address tel'
    });

    if (!booking) {
        return res.status(404).json({ success: false, msg: `No booking with the id of ${req.params.id}` });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ success: false, msg: `User ${req.user.id} is not authorized to view this booking` });
    }

    res.status(200).json({ success: true, data: booking });
});

// @desc    Add a booking
// @route   POST /api/v1/bookings
// @access  Private (User)
exports.addBooking = asyncHandler(async (req, res, next) => {
    req.body.user = req.user.id;

    // Check if booking date is in the past
    const bookingDate = new Date(req.body.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
        return res.status(400).json({ success: false, msg: 'Cannot book a past date' });
    }

    const provider = await Provider.findById(req.body.provider);
    if (!provider) {
        return res.status(404).json({ success: false, msg: `No provider with the id of ${req.body.provider}` });
    }

    const existingBookings = await Booking.find({ user: req.user.id });
    if (existingBookings.length >= 3 && req.user.role !== 'admin') {
        return res.status(400).json({ success: false, msg: `The user with ID ${req.user.id} has already made 3 bookings` });
    }

    const booking = await Booking.create(req.body);
    res.status(201).json({ success: true, data: booking });
});

// @desc    Update a booking
// @route   PUT /api/v1/bookings/:id
// @access  Private
exports.updateBooking = asyncHandler(async (req, res, next) => {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
        return res.status(404).json({ success: false, msg: `No booking with the id of ${req.params.id}` });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ success: false, msg: `User ${req.user.id} is not authorized to update this booking` });
    }

    // Check if booking date is being updated and is in the past
    if (req.body.bookingDate) {
        const bookingDate = new Date(req.body.bookingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for fair comparison

        if (bookingDate < today) {
            return res.status(400).json({ success: false, msg: 'Cannot update to a past date' });
        }
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: booking });
});

// @desc    Delete a booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private
exports.deleteBooking = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return res.status(404).json({ success: false, msg: `No booking with the id of ${req.params.id}` });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ success: false, msg: `User ${req.user.id} is not authorized to delete this booking` });
    }

    await booking.deleteOne();
    res.status(200).json({ success: true, data: {} });
});

//@desc Get booking history for the logged-in user
//@route GET /api/v1/bookings/myhistory
//@access Private (User)
exports.getMyBookingHistory = asyncHandler(async(req, res, next)=>{
    const bookings = await Booking.find({
        user: req.user.id
    })
    .sort({bookingDate : -1})
    .populate({
        path: 'provider',
        select: 'name address tel'
    });

    if(!bookings || bookings.length == 0){
        return res.status(200).json({success: true, count:0, data:[], msg: 'You have no booking history'});
    }

    res.status(200).json({success:true, count: bookings.length, data: bookings});
});