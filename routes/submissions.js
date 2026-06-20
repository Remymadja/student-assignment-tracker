import express from 'express';
import multer from 'multer';
import path from 'node:path';
import { db } from '../config/db.js';
import { requireAuth, requireRole } from './middleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  }
});

const upload = multer({ storage });

router.get('/', requireAuth, async (req, res) => {
  let submissionsQuery = `
    SELECT 
      s.*,
      u.name AS student,
      a.title AS assignment,
      c.name AS course
    FROM submissions s
    JOIN users u ON u.id = s.student_id
    JOIN assignments a ON a.id = s.assignment_id
    JOIN courses c ON c.id = a.course_id
  `;

  const params = [];

  if (req.session.user.role === 'student') {
    submissionsQuery += ` WHERE s.student_id = ? `;
    params.push(req.session.user.id);
  }

  submissionsQuery += ` ORDER BY COALESCE(s.submitted_at, s.created_at) DESC `;

  const [submissions] = await db.query(submissionsQuery, params);

  const [students] = await db.query(`
    SELECT id, name 
    FROM users 
    WHERE role = 'student' 
    ORDER BY name
  `);

  const [assignments] = await db.query(`
    SELECT id, title 
    FROM assignments 
    ORDER BY due_date
  `);

  res.render('submissions', {
    title: 'Submissions',
    submissions,
    students,
    assignments
  });
});

router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  const { assignment_id, student_id, status, notes } = req.body;

  const finalStudentId = req.session.user.role === 'student'
    ? req.session.user.id
    : student_id;

  const submittedAt = status === 'submitted' || status === 'graded'
    ? new Date()
    : null;

  const filePath = req.file ? req.file.filename : null;

  await db.query(`
    INSERT INTO submissions 
    (assignment_id, student_id, status, submitted_at, notes, file_path)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      status = VALUES(status),
      submitted_at = VALUES(submitted_at),
      notes = VALUES(notes),
      file_path = COALESCE(VALUES(file_path), file_path)
  `, [
    assignment_id,
    finalStudentId,
    status,
    submittedAt,
    notes,
    filePath
  ]);

  req.flash('success', 'Submission succesvol opgeslagen.');
  res.redirect('/submissions');
});

router.post('/:id/grade', requireAuth, requireRole('admin', 'teacher'), async (req, res) => {
  const { grade, feedback } = req.body;

  await db.query(`
    UPDATE submissions 
    SET grade = ?, feedback = ?, status = 'graded'
    WHERE id = ?
  `, [grade, feedback, req.params.id]);

  req.flash('success', 'Grade succesvol opgeslagen.');
  res.redirect('/submissions');
});

export default router;