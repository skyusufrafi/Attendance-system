// Session.js
const SessionSchema = new mongoose.Schema({
    teacherEmail: String,
    lectureName: String,
    uniqueId: String,
    teacherLocation: { lat: Number, lng: Number },
    createdAt: { type: Date, default: Date.now }
});