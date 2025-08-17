import express from 'express';
import { ensureRole } from '../middleware/auth.js';
import { getPool } from '../config/db.js';

const router = express.Router();
router.use(ensureRole('teacher'));

router.get('/', async (req, res) => {
  const pool = await getPool();
  const events = await pool.request().query('SELECT * FROM Events ORDER BY id DESC');
  res.render('teacher/dashboard', { title: 'Teacher Dashboard', events: events.recordset });
});

router.get('/events', async (req, res) => {
  const pool = await getPool();
  const events = await pool.request().query('SELECT * FROM Events ORDER BY id DESC');
  res.render('teacher/events_list', { title: 'My Events', events: events.recordset });
});

router.get('/events/:id/attendance', async (req, res) => {
  const eventId = parseInt(req.params.id);
  const pool = await getPool();
  const regs = await pool.request().input('eventId', eventId).query(`
    SELECT r.id AS regId, u.name AS studentName, u.id AS studentId
    FROM Registrations r
    JOIN Users u ON u.id = r.studentId
    WHERE r.eventId = @eventId
  `);
  res.render('teacher/attendance', { title: 'Attendance', eventId, regs: regs.recordset });
});

router.post('/events/:id/attendance', async (req, res) => {
  const eventId = parseInt(req.params.id);
  const { present = [] } = req.body; // array of regId marked present
  const presentIds = Array.isArray(present) ? present : [present];
  const pool = await getPool();
  for (const regId of presentIds) {
    await pool.request().input('regId', parseInt(regId)).query('UPDATE Registrations SET status = 'present' WHERE id=@regId');
  }
  req.flash('success', 'Attendance saved');
  res.redirect(`/teacher/events/${eventId}/attendance`);
});

router.get('/events/:id/winners', async (req, res) => {
  const eventId = parseInt(req.params.id);
  const pool = await getPool();
  const regs = await pool.request().input('eventId', eventId).query(`
    SELECT r.id AS regId, u.name AS studentName, u.id AS studentId
    FROM Registrations r
    JOIN Users u ON u.id = r.studentId
    WHERE r.eventId = @eventId
  `);
  res.render('teacher/winners', { title: 'Mark Winners', eventId, regs: regs.recordset });
});

router.post('/events/:id/winners', async (req, res) => {
  const eventId = parseInt(req.params.id);
  const { first, second, third } = req.body; // studentId
  const pool = await getPool();
  await pool.request().input('eventId', eventId).query('DELETE FROM Results WHERE eventId=@eventId');
  if (first) await pool.request().input('eventId', eventId).input('studentId', parseInt(first)).input('position', 1)
      .query('INSERT INTO Results(eventId, studentId, position) VALUES(@eventId, @studentId, @position)');
  if (second) await pool.request().input('eventId', eventId).input('studentId', parseInt(second)).input('position', 2)
      .query('INSERT INTO Results(eventId, studentId, position) VALUES(@eventId, @studentId, @position)');
  if (third) await pool.request().input('eventId', eventId).input('studentId', parseInt(third)).input('position', 3)
      .query('INSERT INTO Results(eventId, studentId, position) VALUES(@eventId, @studentId, @position)');
  req.flash('success', 'Winners saved');
  res.redirect('/teacher');
});

export default router;
