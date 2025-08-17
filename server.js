import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import dotenv from 'dotenv';
import helmet from 'helmet';
import path from 'path';
import ejsLayouts from 'express-ejs-layouts';
import csrf from 'csurf';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import teacherRoutes from './routes/teacher.js';
import studentRoutes from './routes/student.js';
import { ensureAuth } from './middleware/auth.js';
import { getPool } from './config/db.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000*60*60*2 }
}));
app.use(flash());
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(ejsLayouts);
app.set('layout', 'layout');

app.use(express.static(path.join(__dirname, 'public')));

const csrfProtection = csrf();

app.get('/', async (req, res) => {
  // quick stats for landing
  const pool = await getPool();
  const stats = await pool.request().query(`
    SELECT (SELECT COUNT(*) FROM Events) AS events,
           (SELECT COUNT(*) FROM Users WHERE role='teacher') AS teachers,
           (SELECT COUNT(*) FROM Users WHERE role='student') AS students
  `);
  res.render('index', { title: 'Welcome', stats: stats.recordset[0] });
});

app.use('/auth', csrfProtection, authRoutes);
app.use('/admin', ensureAuth, csrfProtection, adminRoutes);
app.use('/teacher', ensureAuth, csrfProtection, teacherRoutes);
app.use('/student', ensureAuth, csrfProtection, studentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
