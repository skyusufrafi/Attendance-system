const mongoose = require('mongoose');
const TeacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true }, // Simple password for login
    secretCode: { type: String, default: "2404" } // Required global lock
});
module.exports = mongoose.model('Teacher', TeacherSchema);