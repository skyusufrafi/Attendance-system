const mongoose = require('mongoose'); // <--- ADD THIS LINE AT THE TOP

const AttendanceSchema = new mongoose.Schema({
    studentName: String,
    studentId: String,
    sessionId: String,
    location: {
        lat: Number,
        lng: Number
    },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);