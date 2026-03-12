const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const cors = require('cors');
const path = require('path');

const Teacher = require('./models/Teacher');
const Session = require('./models/Session');
const Attendance = require('./models/Attendance');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendanceDB');

// Helper: Haversine Distance Formula
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// Routes
app.post('/api/generate-session', async (req, res) => {
    const { teacherName, lectureName, duration, location } = req.body;
    const uniqueId = 'LEC-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newSession = new Session({ teacherName, lectureName, durationHours: duration, uniqueId, teacherLocation: location });
    await newSession.save();
    const qrData = await QRCode.toDataURL(uniqueId);
    res.json({ qrData, sessionId: uniqueId });
});

app.post('/api/submit-attendance', async (req, res) => {
    const { studentName, studentId, sessionId, location } = req.body;
    const session = await Session.findOne({ uniqueId: sessionId });
    if (!session) return res.status(404).json({ message: "Session Expired" });

    const dist = getDistance(session.teacherLocation.lat, session.teacherLocation.lng, location.lat, location.lng);
    const record = new Attendance({ studentName, studentId, sessionId, location, distanceFromTeacher: Math.round(dist) });
    await record.save();
    res.json({ message: "Success", distance: Math.round(dist) });
});

app.get('/api/attendance/:sessionId', async (req, res) => {
    const records = await Attendance.find({ sessionId: req.params.sessionId });
    res.json(records);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));