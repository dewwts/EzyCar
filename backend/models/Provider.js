const mongoose = require('mongoose');

const ProvideSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'pls enter a name']
    },
    address:{
        type: String,
        required: [true, 'pls enter an address']
    },
    tel:{
        type: String,
        required:[true, 'pls enter and telephone number']
    }
});

module.exports = mongoose.model('Provider', ProvideSchema);