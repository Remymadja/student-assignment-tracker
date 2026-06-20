import express from 'express';
import { db } from '../config/db.js';
import { requireAuth } from './middleware.js';
const router = express.Router();
router.get('/', requireAuth, async (req, res) => {
  const [courses] = await db.query(`SELECT c.*, u.name AS teacher,
    COUNT(DISTINCT e.student_id) AS students,
    COUNT(DISTINCT a.id) AS assignments
    FROM courses c
    LEFT JOIN users u ON u.id = c.teacher_id
    LEFT JOIN enrollments e ON e.course_id = c.id
    LEFT JOIN assignments a ON a.course_id = c.id
    GROUP BY c.id
    ORDER BY c.name`);
  res.render('courses', { title: 'Courses', courses });
});
export default router;
