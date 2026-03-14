const mongoose = require('mongoose');
const StudentSchema = new mongoose.Schema({
    fullName: String,
    studentId: { type: String, unique: true }, // Roll No
    email: { type: String, unique: true },
    password: String,
    class: String,
    year: String,
    mobile: String
});
module.exports = mongoose.model('Student', StudentSchema);