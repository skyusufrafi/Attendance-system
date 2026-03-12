const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Attendance = require('./models/Attendance');
const Session = require('./models/Session');

const app = express();
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI);

// Haversine formula for distance
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

app.post('/api/generate-session', async (req, res) => {
    const { teacherName, lectureName, location } = req.body;
    const uniqueId = 'LEC-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newSession = new Session({ teacherName, lectureName, uniqueId, teacherLocation: location });
    await newSession.save();
    const qrData = await QRCode.toDataURL(uniqueId);
    res.json({ qrData, sessionId: uniqueId });
});

// GET all sessions for History tab
app.get('/api/history', async (req, res) => {
    const sessions = await Session.find().sort({ createdAt: -1 });
    res.json(sessions);
});

app.post('/api/submit-attendance', async (req, res) => {
    const { studentName, studentId, sessionId, location, fingerprint } = req.body;
    try {
        const session = await Session.findOne({ uniqueId: sessionId });
        if (!session) return res.status(404).json({ message: "Session Expired" });

        // Anti-Proxy Check: Device Fingerprint
        const deviceUsed = await Attendance.findOne({ deviceFingerprint: fingerprint, sessionId });
        if (deviceUsed) return res.status(403).json({ message: "Device already used for another ID!" });

        const dist = getDistance(session.teacherLocation.lat, session.teacherLocation.lng, location.lat, location.lng);
        const record = new Attendance({ 
            studentName, studentId, sessionId, location, 
            lectureName: session.lectureName, 
            deviceFingerprint: fingerprint, 
            distanceFromTeacher: Math.round(dist) 
        });
        await record.save();
        res.json({ message: "Success", distance: Math.round(dist) });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: "This ID already marked attendance!" });
        res.status(500).json({ message: "Server Error" });
    }
});

app.get('/api/attendance/:sessionId', async (req, res) => {
    const records = await Attendance.find({ sessionId: req.params.sessionId });
    res.json(records);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server live on ${PORT}`));