import User from '../models/User.js';

// @desc    Get user's subjects
// @route   GET /api/subjects
// @access  Private
export const getSubjects = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json(user.subjects);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a subject to user
// @route   POST /api/subjects
// @access  Private
export const addSubject = async (req, res, next) => {
  try {
    const { name, code, credits, days } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check if subject code already exists
    const exists = user.subjects.find(sub => sub.code === code);
    if (exists) {
      return res.status(400).json({ message: 'Subject with this code already exists' });
    }

    user.subjects.push({ name, code, credits, days });
    await user.save();

    res.status(201).json(user.subjects);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:code
// @access  Private
export const deleteSubject = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.subjects = user.subjects.filter(sub => sub.code !== req.params.code);
    await user.save();

    res.json(user.subjects);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:code
// @access  Private
export const updateSubject = async (req, res, next) => {
  try {
    const { name, code, credits, days } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const subjectIndex = user.subjects.findIndex(sub => sub.code === req.params.code);
    if (subjectIndex === -1) {
       return res.status(404).json({ message: 'Subject not found' });
    }

    if (code !== req.params.code && user.subjects.some(sub => sub.code === code)) {
       return res.status(400).json({ message: 'Another subject with this new code already exists' });
    }

    user.subjects[subjectIndex] = { name, code, credits, days };
    await user.save();

    res.json(user.subjects);
  } catch (error) {
    next(error);
  }
};
