import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../config/db.js';
import { generateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.redirect(req.session.user ? '/dashboard' : '/login');
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? AND active = 1',
      [email]
    );

    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      req.flash('error', 'Ongeldige email of password.');
      return res.redirect('/login');
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Login error. Controleer database verbinding.');
    res.redirect('/login');
  }
});

/*
  JWT API LOGIN
  Test met:
  POST http://localhost:3000/api/login
*/
router.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? AND active = 1',
      [email]
    );

    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('API login error:', error);

    return res.status(500).json({
      message: 'Server error during login.'
    });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

export default router;