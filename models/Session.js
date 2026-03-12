const mongoose = require('mongoose');
const SessionSchema = new mongoose.Schema({
    teacherName: String,
    lectureName: String,
    uniqueId: String,
    teacherLocation: { lat: Number, lng: Number },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Session', SessionSchema);