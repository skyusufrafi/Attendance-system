const mongoose = require('mongoose'); // <--- ADD THIS HERE TOO

const SessionSchema = new mongoose.Schema({
    uniqueId: String,
    createdAt: { type: Date, default: Date.now, expires: 120 }
});

module.exports = mongoose.model('Session', SessionSchema);