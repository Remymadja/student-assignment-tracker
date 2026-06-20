import express from 'express';
import { db } from '../config/db.js';
import { requireAuth, requireRole } from './middleware.js';
const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const [assignments] = await db.query(`SELECT a.*, c.name AS course,
    COUNT(DISTINCT e.student_id) AS total_students,
    COUNT(DISTINCT CASE WHEN s.status IN ('submitted','graded') THEN s.student_id END) AS submitted_count
    FROM assignments a
    JOIN courses c ON c.id = a.course_id
    LEFT JOIN enrollments e ON e.course_id = a.course_id
    LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = e.student_id
    GROUP BY a.id
    ORDER BY a.due_date ASC`);
  const [courses] = await db.query('SELECT * FROM courses ORDER BY name');
  res.render('assignments', { title: 'Assignments', assignments, courses });
});

router.post('/', requireAuth, requireRole('admin','teacher'), async (req, res) => {
  const { course_id, title, description, due_date, priority } = req.body;
  await db.query('INSERT INTO assignments(course_id,title,description,due_date,priority) VALUES(?,?,?,?,?)', [course_id, title, description, due_date, priority || 'Medium']);
  req.flash('success', 'Assignment succesvol toegevoegd.');
  res.redirect('/assignments');
});
export default router;
