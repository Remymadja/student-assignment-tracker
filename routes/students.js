import express from 'express';
import { db } from '../config/db.js';
import { requireAuth } from './middleware.js';
const router = express.Router();
router.get('/', requireAuth, async (req, res) => {
  const [students] = await db.query(`SELECT u.id, u.name, u.email,
    COUNT(DISTINCT e.course_id) AS courses,
    COUNT(DISTINCT s.id) AS submissions,
    ROUND(AVG(s.grade), 1) AS average_grade
    FROM users u
    LEFT JOIN enrollments e ON e.student_id = u.id
    LEFT JOIN submissions s ON s.student_id = u.id AND s.grade IS NOT NULL
    WHERE u.role='student'
    GROUP BY u.id
    ORDER BY u.name`);
  res.render('students', { title: 'Students', students });
});
export default router;
