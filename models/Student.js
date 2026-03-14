const mongoose = require('mongoose');
module.exports = mongoose.model('Student', new mongoose.Schema({
    fullName: String,
    studentId: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    class: String,
    year: String,
    mobile: String
}));