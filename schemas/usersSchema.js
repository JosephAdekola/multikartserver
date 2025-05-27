const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superAdmin'],
        default: 'user'
    },
    phone: String,
    country: String,
    state: String,
    address: String,
    city: String,
    otp: {
        type: String
    },
    verified: {
        type: Boolean,
        default: false
    },
    enabled: {
        type: Boolean,
        default: true
    },
    postalCode: String
}, { timestamps: true });

const usersModel = mongoose.model("user", userSchema);
module.exports = {usersModel};