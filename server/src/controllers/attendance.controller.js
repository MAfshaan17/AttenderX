import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// @desc    Mark attendance
// @route   POST /api/attendance/mark
// @access  Public (in production should be Protected, but keeping open for easy AI test)
export const markAttendance = async (req, res, next) => {
  try {
    const { rollNumber, session, confidenceScore } = req.body;

    const user = await User.findOne({ rollNumber });
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0];

    // Check if already marked for today and session
    const existing = await Attendance.findOne({ rollNumber, date, session });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Attendance already marked for this session today' });
    }

    const record = await Attendance.create({
      userId: user._id,
      name: user.name,
      rollNumber: user.rollNumber,
      date,
      time,
      session,
      confidenceScore: confidenceScore || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendance records
// @route   GET /api/attendance/all
// @access  Public/Admin
export const getAllAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance stats
// @route   GET /api/attendance/stats
// @access  Public/Admin
export const getStats = async (req, res, next) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const todayScans = await Attendance.countDocuments({ date });

    const sessionData = await Attendance.aggregate([
      { $group: { _id: '$session', count: { $sum: 1 } } }
    ]);
    const sessionDistribution = {};
    sessionData.forEach(s => { sessionDistribution[s._id] = s.count });

    const weeklyTrends = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      weeklyTrends[dStr] = await Attendance.countDocuments({ date: dStr });
    }

    res.json({
      todayScans,
      sessionDistribution,
      weeklyTrends
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personal attendance stats
// @route   GET /api/attendance/me/stats
// @access  Private
export const getPersonalStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const records = await Attendance.find({ userId: req.user._id }).sort({ createdAt: 1 });
    
    const subjectStats = user.subjects.map(sub => {
      const attended = records.filter(r => r.session === sub.name).length;
      // For demo purposes, we will assume 40 classes total to show percentage
      const totalClasses = 40; 
      const percentage = Math.round((attended / totalClasses) * 100) || 0;
      return {
        name: sub.name,
        code: sub.code,
        credits: sub.credits,
        attended,
        totalClasses,
        percentage
      };
    });

    res.json({
      subjectStats,
      totalAttended: records.length,
      recentRecords: records.slice(-5).reverse(),
      allRecords: records
    });
  } catch(error) {
    next(error);
  }
};
