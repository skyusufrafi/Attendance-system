const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const cors = require('cors');

// --- DATABASE MODELS ---
// (Normally these are in the 'models' folder, make sure they are imported)
const Session = require('./models/session');
const Attendance = require('./models/Attendance');

const app = express(); // DEFINED FIRST

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const DB_URL = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendanceDB';
mongoose.connect(DB_URL);

// --- ROUTES ---

// 1. Generate QR Code
app.post('/api/generate-session', async (req, res) => {
    const uniqueId = 'LEC-' + Date.now();
    const newSession = new Session({ uniqueId });
    await newSession.save();
    const qrData = await QRCode.toDataURL(uniqueId);
    res.json({ qrData, sessionId: uniqueId });
});

// 2. Submit Attendance (With Geolocation)
app.post('/api/submit-attendance', async (req, res) => {
    const { studentName, studentId, sessionId, location } = req.body;
    
    // Check if session exists
    const session = await Session.findOne({ uniqueId: sessionId });
    if (!session) return res.status(400).json({ message: "QR Expired!" });

    // Save record
    const record = new Attendance({ studentName, studentId, sessionId, location });
    await record.save();
    res.json({ message: "Attendance Recorded Successfully!" });
});

// 3. Get List
app.get('/api/attendance/:sessionId', async (req, res) => {
    const records = await Attendance.find({ sessionId: req.params.sessionId });
    res.json(records);
});

// --- START SERVER ---

// This tells the code to use Render's port, or 3000 if running locally
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is live on port ${PORT}`);
});
