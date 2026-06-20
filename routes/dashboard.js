import express from 'express';
import { db } from '../config/db.js';
import { requireAuth } from './middleware.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [[counts]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'student') AS students,
        (SELECT COUNT(*) FROM courses) AS courses,
        (SELECT COUNT(*) FROM assignments) AS assignments,
        (SELECT COUNT(*) FROM submissions WHERE status IN ('submitted','graded')) AS submitted,
        (SELECT COUNT(*) FROM submissions WHERE status = 'graded') AS graded
    `);

    const [[kpi]] = await db.query(`
      SELECT
        COUNT(*) AS total_submissions,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) AS submitted_count,
        SUM(CASE WHEN status = 'graded' THEN 1 ELSE 0 END) AS graded_count,
        ROUND(AVG(grade), 1) AS average_grade
      FROM submissions
    `);

    const [assignmentProgress] = await db.query(`
      SELECT 
        a.id,
        a.title,
        a.priority,
        a.due_date,
        c.name AS course,
        COUNT(DISTINCT e.student_id) AS total_students,
        COUNT(DISTINCT CASE WHEN s.status IN ('submitted','graded') THEN s.student_id END) AS submitted_count,
        COUNT(DISTINCT CASE WHEN s.status = 'graded' THEN s.student_id END) AS graded_count
      FROM assignments a
      JOIN courses c ON c.id = a.course_id
      LEFT JOIN enrollments e ON e.course_id = a.course_id
      LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = e.student_id
      GROUP BY a.id, a.title, a.priority, a.due_date, c.name
      ORDER BY a.due_date ASC
      LIMIT 10
    `);

    const [upcoming] = await db.query(`
      SELECT 
        a.title,
        a.due_date,
        a.priority,
        c.name AS course
      FROM assignments a
      JOIN courses c ON c.id = a.course_id
      ORDER BY a.due_date ASC
      LIMIT 6
    `);

    const [courseStats] = await db.query(`
      SELECT 
        c.name AS course,
        COUNT(DISTINCT a.id) AS assignments,
        COUNT(DISTINCT e.student_id) AS students
      FROM courses c
      LEFT JOIN assignments a ON a.course_id = c.id
      LEFT JOIN enrollments e ON e.course_id = c.id
      GROUP BY c.id, c.name
      ORDER BY c.name
    `);

    res.render('dashboard', {
      title: 'Dashboard',
      counts,
      kpi,
      assignmentProgress,
      upcoming,
      courseStats
    });
  } catch (error) {
    console.error('Dashboard error:', error);

    req.flash('error', 'Dashboard kon niet geladen worden. Controleer database of queries.');
    res.redirect('/login');
  }
});

export default router;