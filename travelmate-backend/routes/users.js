const express = require('express');
const router = express.Router();
const db = require('../db_config');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');


const User = db.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  firstName: { type: DataTypes.STRING(50), allowNull: false },
  lastName: { type: DataTypes.STRING(50), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  location: { type: DataTypes.STRING(100), allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true },
  dark_mode: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  timestamps: false,
  tableName: 'users'
});

// Sync table
User.sync();


//  POST new user (Signup) — prevent duplicate emails
router.post('/', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    //  Check for duplicate email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });
  } catch (err) {
    console.error('❌ Error creating user:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// POST new user (Signup)
router.post('/', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });
  } catch (err) {
    console.error('❌ Error creating user:', err);
    res.status(500).json({ message: err.message });
  }
});

//  POST login (Authenticate)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password); 

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Other routes (Get by ID, Email, Delete, etc.)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) res.json(user);
    else res.status(404).json({ error: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.params.email } });
    if (user) res.json(user);
    else res.status(404).json({ error: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await User.destroy({ where: { id: req.params.id } });
    if (result) res.json({ message: 'User deleted' });
    else res.status(404).json({ error: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PUT: Update user profile by ID
router.put('/update/:id', async (req, res) => {
  const { firstName, lastName, phone, location, bio } = req.body;
  try {
    const updated = await User.update(
      { firstName, lastName, phone, location, bio },
      { where: { id: req.params.id } }
    );
    res.json({ success: true, updated });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

//  GET /users/:email/darkmode - Get dark mode setting
router.get('/:email/darkmode', async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.params.email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ dark_mode: user.dark_mode });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//  PUT /users/:email/darkmode - Update dark mode setting
router.put('/:email/darkmode', async (req, res) => {
  const { dark_mode } = req.body;

  try {
    const user = await User.findOne({ where: { email: req.params.email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.dark_mode = dark_mode;
    await user.save();

    res.json({ message: 'Dark mode updated', dark_mode: user.dark_mode });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
