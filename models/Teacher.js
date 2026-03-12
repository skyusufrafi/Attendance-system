const mongoose = require('mongoose');
const TeacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    secretCode: { type: String, required: true, unique: true }
});
module.exports = mongoose.model('Teacher', TeacherSchema);