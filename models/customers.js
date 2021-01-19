const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    pictureUrl: {
        type: String
    },
    address: {
        type: String
    },
    stripe_id: {
        type: String,
        required: true
    },
    account: {
        type: mongoose.Schema.Types.ObjectId, ref: "Account"
    }},
    {
        timestamps: true
    });


const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;