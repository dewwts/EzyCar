const mongoose = require('mongoose');
const Provider = require('./Provider');

const BookingSchema = new mongoose.Schema({
    bookingDate: {
        type: Date,
        require: true
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    provider: {
        type: mongoose.Schema.ObjectId,
        ref: 'Provider',
        required: true
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Booking', BookingSchema);