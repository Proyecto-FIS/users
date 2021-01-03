const mongoose = require('mongoose');
const Bcrypt = require("bcryptjs");

const accountSchema = new mongoose.Schema({
    username: {
        type: String,
        required: "Username is required",
        unique: true,
        minlength: [3, "Minimun username length is 3 characters"]
    },
    password: {
        type: String,
        required: "Password is required",
        minlength: [6, "Minimun password length is 6 characters"]
    },
    email: {
        type: String,
        required: "email is required",
        validate: {
            validator: function(v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: "The email format is not valid"
        },
        unique: true
    },
    isCustomer: {
        type: Boolean,
        required: true
    }},
    {
        timestamps: true
    });

accountSchema.pre("save", function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = Bcrypt.hashSync(this.password, 10);
    next();
});

accountSchema.pre("updateOne", function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = Bcrypt.hashSync(this.password, 10);
    next();
});


const Account = mongoose.model('Account', accountSchema);

module.exports = Account;