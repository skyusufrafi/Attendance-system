const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const path = require('path');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Session = require('./models/session');
const Attendance = require('./models/Attendance');

const app = express();
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI);

// Distance Logic
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// Auth Routes
app.post('/api/student-signup', async (req, res) => {
    try { await new Student(req.body).save(); res.json({success:true}); } 
    catch(e) { res.status(400).json({message: "ID/Email already exists"}); }
});

app.post('/api/student-login', async (req, res) => {
    const s = await Student.findOne({ studentId: req.body.id, password: req.body.pass });
    s ? res.json(s) : res.status(401).send();
});

app.post('/api/teacher-signup', async (req, res) => {
    if(req.body.secretCode !== "2404") return res.status(401).send("Invalid Code");
    try { await new Teacher(req.body).save(); res.json({success:true}); } 
    catch(e) { res.status(400).send("Error"); }
});

app.post('/api/teacher-login', async (req, res) => {
    const t = await Teacher.findOne({ email: req.body.email, password: req.body.pass });
    t ? res.json(t) : res.status(401).send();
});

// Logic Routes
app.post('/api/generate-session', async (req, res) => {
    const uniqueId = 'AIK-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const session = new Session({...req.body, uniqueId});
    await session.save();
    const qr = await QRCode.toDataURL(uniqueId);
    res.json({qr, uniqueId});
});

app.post('/api/submit-attendance', async (req, res) => {
    const { studentId, sessionId, location, fingerprint } = req.body;
    const sess = await Session.findOne({ uniqueId: sessionId });
    if(!sess) return res.status(404).json({message: "Session Expired"});
    
    const duplicate = await Attendance.findOne({ deviceFingerprint: fingerprint, sessionId });
    if(duplicate) return res.status(403).json({message: "Device already used!"});

    const dist = getDistance(sess.teacherLocation.lat, sess.teacherLocation.lng, location.lat, location.lng);
    const att = new Attendance({ ...req.body, teacherEmail: sess.teacherEmail, distanceFromTeacher: Math.round(dist) });
    await att.save();
    res.json({success: true, dist: Math.round(dist)});
});

app.get('/api/history/:email', async (req, res) => {
    const s = await Session.find({ teacherEmail: req.params.email }).sort({createdAt: -1});
    res.json(s);
});

app.get('/api/attendance/:sid', async (req, res) => {
    const a = await Attendance.find({ sessionId: req.params.sid });
    res.json(a);
});

app.listen(10000, '0.0.0.0');