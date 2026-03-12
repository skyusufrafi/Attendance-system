const mongoose = require('mongoose');
const SessionSchema = new mongoose.Schema({
    teacherName: String,
    lectureName: String,
    durationHours: Number,
    uniqueId: String,
    teacherLocation: { lat: Number, lng: Number },
    createdAt: { type: Date, default: Date.now, expires: 7200 } // Auto-delete after 2 hours
});
module.exports = mongoose.model('Session', SessionSchema);