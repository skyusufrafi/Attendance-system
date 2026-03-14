// Attendance.js
const AttendanceSchema = new mongoose.Schema({
    studentId: String,
    studentName: String,
    sessionId: String,
    teacherEmail: String,
    distanceFromTeacher: Number,
    deviceFingerprint: String,
    timestamp: { type: Date, default: Date.now }
});
AttendanceSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });