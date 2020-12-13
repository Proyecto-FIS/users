const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    pictureUrl: {
        type: String
    },
    address: {
        type: String
    },
    account: {
        type: mongoose.Schema.Types.ObjectId, ref: "Account"
    }},
    {
        timestamps: true
    });


const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;