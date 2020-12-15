const mongoose = require('mongoose');
const Bcrypt = require("bcryptjs");

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

accountSchema.pre("save", function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = Bcrypt.hashSync(this.password, 10);
    next();
});

accountSchema.pre("save", function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = Bcrypt.hashSync(this.password, 10);
    next();
});



const Account = mongoose.model('Account', accountSchema);

module.exports = Account;