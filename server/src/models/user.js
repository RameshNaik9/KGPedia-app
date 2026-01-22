// /src/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    rollNumber: {
        type: String,
        required: true,
        unique: true,
    },
    department: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetExpires: {
        type: Date,
    },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
