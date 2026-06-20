import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import assignmentRoutes from './routes/assignments.js';
import submissionRoutes from './routes/submissions.js';
import studentRoutes from './routes/students.js';
import courseRoutes from './routes/courses.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// Hiermee kunnen uploaded files geopend worden via /uploads/bestandsnaam
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'student_assignment_tracker_secret',
  resave: false,
  saveUninitialized: false
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/assignments', assignmentRoutes);
app.use('/submissions', submissionRoutes);
app.use('/students', studentRoutes);
app.use('/courses', courseRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Student Assignment Tracker'
  });
});

app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found'
  });
});

app.listen(PORT, () => {
  console.log(`Student Assignment Tracker running on http://localhost:${PORT}`);
});