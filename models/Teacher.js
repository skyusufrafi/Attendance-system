const mongoose = require('mongoose');
const TeacherSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String,
    department: String,
    secretCode: { type: String, default: "2404" }
});
module.exports = mongoose.model('Teacher', TeacherSchema);