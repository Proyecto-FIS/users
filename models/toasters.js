const mongoose = require('mongoose');

const toasterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Name is required!',
        unique: true
    },
    description: {
        type: String,
        required: 'A description is required.'
    },
    phoneNumber: {
        type: String
    },
    pictureUrl: {
        type: String
    },
    address: {
        type: String
    },
    socialNetworks: {
        type: [String]
    },
    account: {
        type: mongoose.Schema.Types.ObjectId, ref: "Account"
    }},
    {
        timestamps: true
    });


const Toaster = mongoose.model('Toaster', toasterSchema);

module.exports = Toaster;