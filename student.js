import express from 'express';
import { ensureRole } from '../middleware/auth.js';
import { getPool } from '../config/db.js';

const router = express.Router();
router.use(ensureRole('student'));

router.get('/', async (req, res) => {
  res.render('student/dashboard', { title: 'Student Dashboard' });
});

router.get('/events', async (req, res) => {
  const pool = await getPool();
  const events = await pool.request().query(`
    SELECT e.*, c.name AS collegeName FROM Events e
    LEFT JOIN Colleges c ON c.id = e.collegeId
    ORDER BY e.id DESC
  `);
  res.render('student/events_list', { title: 'Browse Events', events: events.recordset });
});

router.post('/events/:id/register', async (req, res) => {
  const eventId = parseInt(req.params.id);
  const pool = await getPool();
  const exists = await pool.request().input('eventId', eventId).input('studentId', req.session.user.id)
    .query('SELECT 1 FROM Registrations WHERE eventId=@eventId AND studentId=@studentId');
  if (exists.recordset.length) {
    req.flash('error', 'Already registered');
    return res.redirect('/student/events');
  }
  await pool.request().input('eventId', eventId).input('studentId', req.session.user.id)
    .query('INSERT INTO Registrations(eventId, studentId, status) VALUES(@eventId, @studentId, 'registered')');
  req.flash('success', 'Registered! Proceed to payment if applicable.');
  res.redirect('/student/registrations');
});

router.get('/registrations', async (req, res) => {
  const pool = await getPool();
  const regs = await pool.request().input('studentId', req.session.user.id).query(`
    SELECT r.id, r.status, e.name AS eventName, e.fee
    FROM Registrations r JOIN Events e ON e.id = r.eventId
    WHERE r.studentId = @studentId
    ORDER BY r.id DESC
  `);
  res.render('student/registrations', { title: 'My Registrations', regs: regs.recordset });
});

router.post('/payments/mock', async (req, res) => {
  const { registrationId } = req.body;
  const pool = await getPool();
  await pool.request().input('id', parseInt(registrationId)).query('UPDATE Registrations SET status='paid' WHERE id=@id');
  req.flash('success', 'Payment successful (mock)');
  res.redirect('/student/registrations');
});

export default router;
