import express from 'express';
import bcrypt from 'bcrypt';
import { getPool } from '../config/db.js';

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const pool = await getPool();
  const result = await pool.request()
    .input('email', email)
    .query('SELECT TOP 1 * FROM Users WHERE email = @email');
  const user = result.recordset[0];
  if (!user) {
    req.flash('error', 'Invalid credentials');
    return res.redirect('/auth/login');
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    req.flash('error', 'Invalid credentials');
    return res.redirect('/auth/login');
  }
  req.session.user = { id: user.id, name: user.name, role: user.role };
  if (user.role === 'admin') return res.redirect('/admin');
  if (user.role === 'teacher') return res.redirect('/teacher');
  return res.redirect('/student');
});

router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Student Register' });
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const pool = await getPool();
  const exists = await pool.request().input('email', email).query('SELECT 1 FROM Users WHERE email=@email');
  if (exists.recordset.length) {
    req.flash('error', 'Email already exists');
    return res.redirect('/auth/register');
  }
  const hash = await bcrypt.hash(password, 10);
  await pool.request()
    .input('name', name)
    .input('email', email)
    .input('passwordHash', hash)
    .query("""      INSERT INTO Users(name, email, passwordHash, role)
      VALUES(@name, @email, @passwordHash, 'student')
    """);
  req.flash('success', 'Registration successful. Please login.');
  return res.redirect('/auth/login');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

export default router;
