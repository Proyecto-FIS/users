const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    email: {
        type: String,
        unique: true
    }},
    {
        timestamps: true
    });


const Account = mongoose.model('Account', accountSchema);

module.exports = Account;