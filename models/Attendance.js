const mongoose = require('mongoose');
const AttendanceSchema = new mongoose.Schema({
    studentName: String,
    studentId: { type: String, required: true },
    sessionId: { type: String, required: true },
    deviceFingerprint: { type: String, required: true }, 
    location: { lat: Number, lng: Number },
    distanceFromTeacher: Number,
    timestamp: { type: Date, default: Date.now }
});
// The "Anti-Proxy" Wall: One ID per Session
AttendanceSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });
module.exports = mongoose.model('Attendance', AttendanceSchema);