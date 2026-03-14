const mongoose = require('mongoose');
module.exports = mongoose.model('Teacher', new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String,
    department: String,
    secretCode: { type: String, default: "2404" }
}));