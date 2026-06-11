import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  rollNumber: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  time: {
    type: String, // HH:MM:SS
    required: true,
  },
  status: {
    type: String,
    default: 'Present',
  },
  session: {
    type: String,
    required: true,
  },
  confidenceScore: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
