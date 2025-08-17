import express from 'express';
import { ensureRole } from '../middleware/auth.js';
import { getPool, sql } from '../config/db.js';

const router = express.Router();
router.use(ensureRole('admin'));

router.get('/', async (req, res) => {
  const pool = await getPool();
  const [events, regs] = await Promise.all([
    pool.request().query('SELECT TOP 10 * FROM Events ORDER BY id DESC'),
    pool.request().query('SELECT TOP 10 * FROM Registrations ORDER BY id DESC')
  ]);
  res.render('admin/dashboard', { title: 'Admin Dashboard', events: events.recordset, regs: regs.recordset });
});

router.get('/colleges/new', (req, res) => {
  res.render('admin/colleges_new', { title: 'Register College' });
});

router.post('/colleges/new', async (req, res) => {
  const { name } = req.body;
  const pool = await getPool();
  await pool.request().input('name', name).query('INSERT INTO Colleges(name) VALUES(@name)');
  req.flash('success', 'College registered');
  res.redirect('/admin');
});

router.get('/events/new', async (req, res) => {
  const pool = await getPool();
  const colleges = await pool.request().query('SELECT * FROM Colleges');
  res.render('admin/events_new', { title: 'Create Event', colleges: colleges.recordset });
});

router.post('/events/new', async (req, res) => {
  const { name, type, collegeId, fee } = req.body;
  const pool = await getPool();
  await pool.request()
    .input('name', name)
    .input('type', type)
    .input('collegeId', parseInt(collegeId))
    .input('fee', parseFloat(fee || 0))
    .input('createdBy', req.session.user.id)
    .query('INSERT INTO Events(name, type, collegeId, fee, createdBy) VALUES(@name, @type, @collegeId, @fee, @createdBy)');
  req.flash('success', 'Event created');
  res.redirect('/admin/events');
});

router.get('/events', async (req, res) => {
  const pool = await getPool();
  const events = await pool.request().query(`
    SELECT e.*, c.name AS collegeName FROM Events e
    LEFT JOIN Colleges c ON c.id = e.collegeId
    ORDER BY e.id DESC
  `);
  res.render('admin/events_list', { title: 'All Events', events: events.recordset });
});

router.post('/teachers/new', async (req, res) => {
  const { name, email, password } = req.body;
  const pool = await getPool();
  const exists = await pool.request().input('email', email).query('SELECT 1 FROM Users WHERE email=@email');
  if (exists.recordset.length) {
    req.flash('error', 'Email already exists');
    return res.redirect('/admin');
  }
  const bcrypt = (await import('bcrypt')).default;
  const hash = await bcrypt.hash(password, 10);
  await pool.request().input('name', name).input('email', email).input('passwordHash', hash)
    .query("""      INSERT INTO Users(name, email, passwordHash, role)
      VALUES(@name, @email, @passwordHash, 'teacher')
    """);
  req.flash('success', 'Teacher added');
  res.redirect('/admin');
});

router.get('/registrations', async (req, res) => {
  const pool = await getPool();
  const regs = await pool.request().query(`
    SELECT r.id, e.name AS eventName, u.name AS studentName, r.status
    FROM Registrations r
    JOIN Events e ON e.id = r.eventId
    JOIN Users u ON u.id = r.studentId
    ORDER BY r.id DESC
  `);
  res.render('admin/registrations', { title: 'Student Registrations', regs: regs.recordset });
});

router.get('/results', async (req, res) => {
  const pool = await getPool();
  const results = await pool.request().query(`
    SELECT res.eventId, e.name AS eventName,
      STRING_AGG(CONCAT(res.position, ': ', u.name), ', ') AS placements
    FROM Results res
    JOIN Events e ON e.id = res.eventId
    JOIN Users u ON u.id = res.studentId
    GROUP BY res.eventId, e.name
    ORDER BY res.eventId DESC
  `);
  res.render('admin/results', { title: 'Event Results', results: results.recordset });
});

export default router;
