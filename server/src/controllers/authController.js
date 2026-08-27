import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { signToken } from '../middleware/authMiddleware.js';

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'A user with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = uuidv4();
    const userRole = role || 'Business Analyst';

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, name, email.toLowerCase(), passwordHash, userRole);

    const user = { id: userId, name, email: email.toLowerCase(), role: userRole };
    const token = signToken(user);

    return res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const userRecord = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!userRecord) {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }

    const isMatch = await bcrypt.compare(password, userRecord.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }

    const user = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role
    };
    const token = signToken(user);

    return res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
}

export function getMe(req, res) {
  if (!req.user || req.user.id === 'guest_user') {
    return res.json({
      user: {
        id: 'guest_user',
        name: 'Business Analyst Demo',
        email: 'analyst@insightflow.internal',
        role: 'Business Analyst'
      }
    });
  }

  const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User record not found.' });
  }

  return res.json({ user });
}

export function logout(req, res) {
  return res.json({ message: 'Logged out successfully.' });
}
