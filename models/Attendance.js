const mongoose = require('mongoose');
const AttendanceSchema = new mongoose.Schema({
    studentName: String,
    studentId: String,
    sessionId: String,
    location: { lat: Number, lng: Number },
    distanceFromTeacher: Number, // In meters
    timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Attendance', AttendanceSchema);