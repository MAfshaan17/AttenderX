import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import Attendance from './src/models/Attendance.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/attenderx');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Attendance.deleteMany();
    console.log('Cleared existing data.');

    // 1. Create Demo Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      name: 'Admin User',
      rollNumber: 'ADMIN001',
      department: 'Admin',
      email: 'admin@attenderx.com',
      password: hashedPassword, // Bypassing pre-save hook by using pre-hashed and direct insert or let hook do it.
      role: 'admin'
    });

    const student1 = await User.create({
      name: 'Abhay Yagati',
      rollNumber: '003',
      department: 'ISE',
      email: 'abhay1@gmail.com',
      password: 'password123', // hook will hash it
      role: 'user'
    });

    const student2 = await User.create({
      name: 'John Doe',
      rollNumber: '101',
      department: 'CSE',
      email: 'john@gmail.com',
      password: 'password123',
      role: 'user'
    });

    console.log('Demo users created.');

    // 2. Create Demo Attendance Records for the past 7 days
    const sessions = ['Morning', 'Afternoon', 'Lab'];
    const users = [student1, student2];
    
    const records = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Randomly create 1 to 4 records per day
      const numRecords = Math.floor(Math.random() * 4) + 1;
      
      for(let j = 0; j < numRecords; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomSession = sessions[Math.floor(Math.random() * sessions.length)];
        
        records.push({
          userId: randomUser._id,
          name: randomUser.name,
          rollNumber: randomUser.rollNumber,
          date: dateStr,
          time: `10:${Math.floor(Math.random() * 50) + 10}:00`,
          status: 'Present',
          session: randomSession,
          confidenceScore: Math.floor(Math.random() * 10) + 90, // 90-99%
        });
      }
    }

    await Attendance.insertMany(records);
    console.log(`Successfully seeded ${records.length} demo attendance records!`);

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDatabase();
