const mongoose = require('mongoose');

const toasterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Name is required',
        minlength: [3, "Minimun username length is 3 characters"],
        unique: true
    },
    description: {
        type: String,
        required: 'A description is required',
        minlength: [20, "Minimun description length is 20 characters"]
    },
    phoneNumber: {
        type: String,
        validate: {
            validator: function(v) {
                return /^$|^[0-9]{9}$/.test(v);
            },
            message: "Incorrect phone number"
        },
    },
    pictureUrl: {
        type: String,
        validate: {
            validator: function(v) {
                return /^$|(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|gif|png)$/.test(v);
            },
            message: "Incorrect picture URL"
        },
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