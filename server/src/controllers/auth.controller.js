import User from '../models/User.js';
import generateToken from '../utils/jwt.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, rollNumber, department, email, password } = req.body;

    const userExists = await User.findOne({ rollNumber });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      rollNumber,
      department,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        access_token: generateToken(user._id),
        token_type: 'bearer',
        user: {
          id: user._id,
          name: user.name,
          rollNumber: user.rollNumber,
          department: user.department,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { rollNumber, password } = req.body;

    const user = await User.findOne({ rollNumber });

    if (user && (await user.matchPassword(password))) {
      res.json({
        access_token: generateToken(user._id),
        token_type: 'bearer',
        user: {
          id: user._id,
          name: user.name,
          rollNumber: user.rollNumber,
          department: user.department,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid roll number or password');
    }
  } catch (error) {
    next(error);
  }
};
