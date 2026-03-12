const mongoose = require('mongoose');
const AttendanceSchema = new mongoose.Schema({
    studentName: String,
    studentId: { type: String, required: true },
    sessionId: { type: String, required: true },
    lectureName: String, // Added for easier history searching
    deviceFingerprint: { type: String, required: true }, 
    location: { lat: Number, lng: Number },
    distanceFromTeacher: Number,
    timestamp: { type: Date, default: Date.now }
});
// Enforces one attendance per student ID per session
AttendanceSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });
module.exports = mongoose.model('Attendance', AttendanceSchema);