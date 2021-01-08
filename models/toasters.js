const mongoose = require('mongoose');

const toasterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Name is required',
        minlength: [3, "Minimun professional name length is 3 characters"],
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
    instagramUrl: {
        type: String,
        validate: {
            // Validación solo de URL. Debería mejorarse para verificar que es un perfil de la red en cuestión
            validator: function(v) {
                return /^$|^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(v);
            },
            message: "Incorrect URL"
        },
    },
    facebookUrl: {
        type: String,
        validate: {
            // Validación solo de URL. Debería mejorarse para verificar que es un perfil de la red en cuestión
            validator: function(v) {
                return /^$|^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(v);
            },
            message: "Incorrect URL"
        },
    },
    twitterUrl: {
        type: String,
        validate: {
            // Validación solo de URL. Debería mejorarse para verificar que es un perfil de la red en cuestión
            validator: function(v) {
                return /^$|^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(v);
            },
            message: "Incorrect URL"
        },
    },
    account: {
        type: mongoose.Schema.Types.ObjectId, ref: "Account"
    }},
    {
        timestamps: true
    });


const Toaster = mongoose.model('Toaster', toasterSchema);

module.exports = Toaster;