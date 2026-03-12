const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const path = require('path');
const Attendance = require('./models/Attendance');
const Session = require('./models/Session');
const Teacher = require('./models/Teacher');

const app = express();
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI);

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// Teacher Login with Name, Password, and Secret Code
app.post('/api/teacher-login', async (req, res) => {
    const { name, password, secretCode } = req.body;
    if (secretCode !== "2404") return res.status(401).json({ message: "Invalid Secret Code" });
    
    // Check if teacher exists, if not, create them (Auto-registration for first time)
    let teacher = await Teacher.findOne({ name });
    if (!teacher) {
        teacher = new Teacher({ name, password });
        await teacher.save();
    } else if (teacher.password !== password) {
        return res.status(401).json({ message: "Incorrect Password" });
    }
    res.json({ success: true, teacherName: teacher.name });
});

app.post('/api/generate-session', async (req, res) => {
    const { teacherName, lectureName, location } = req.body;
    const uniqueId = 'LEC-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newSession = new Session({ teacherName, lectureName, uniqueId, teacherLocation: location });
    await newSession.save();
    const qrData = await QRCode.toDataURL(uniqueId);
    res.json({ qrData, sessionId: uniqueId });
});

app.get('/api/history/:teacherName', async (req, res) => {
    const sessions = await Session.find({ teacherName: req.params.teacherName }).sort({ createdAt: -1 });
    res.json(sessions);
});

app.post('/api/submit-attendance', async (req, res) => {
    try {
        const { studentName, studentId, sessionId, location, fingerprint } = req.body;
        const session = await Session.findOne({ uniqueId: sessionId });
        if (!session) return res.status(404).json({ message: "Session Not Found" });

        const deviceUsed = await Attendance.findOne({ deviceFingerprint: fingerprint, sessionId });
        if (deviceUsed) return res.status(403).json({ message: "Device already used!" });

        const dist = getDistance(session.teacherLocation.lat, session.teacherLocation.lng, location.lat, location.lng);
        const record = new Attendance({ studentName, studentId, sessionId, location, deviceFingerprint: fingerprint, distanceFromTeacher: Math.round(dist) });
        await record.save();
        res.json({ message: "Success", distance: Math.round(dist) });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: "ID already marked!" });
        res.status(500).json({ message: "Server Error" });
    }
});

app.get('/api/attendance/:sessionId', async (req, res) => {
    const records = await Attendance.find({ sessionId: req.params.sessionId });
    res.json(records);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0');