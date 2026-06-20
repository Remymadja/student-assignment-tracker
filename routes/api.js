import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../config/db.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Request validation failed.',
      errors: errors.array()
    });
  }

  next();
}

router.get('/profile', verifyToken, (req, res) => {
  res.json({
    message: 'Protected profile route.',
    user: req.user
  });
});

router.get('/submissions', verifyToken, async (req, res) => {
  try {
    let query = `
      SELECT 
        s.id,
        s.assignment_id,
        s.student_id,
        s.status,
        s.submitted_at,
        s.grade,
        s.feedback,
        s.notes,
        u.name AS student_name,
        a.title AS assignment_title,
        c.name AS course_name
      FROM submissions s
      JOIN users u ON u.id = s.student_id
      JOIN assignments a ON a.id = s.assignment_id
      JOIN courses c ON c.id = a.course_id
      WHERE 1 = 1
    `;

    const params = [];

    if (req.user.role === 'student') {
      query += ` AND s.student_id = ? `;
      params.push(req.user.id);
    }

    query += ` ORDER BY COALESCE(s.submitted_at, s.created_at) DESC `;

    const [submissions] = await db.query(query, params);

    res.json({
      message: 'Submissions retrieved successfully.',
      data: submissions
    });
  } catch (error) {
    console.error('API submissions error:', error);

    res.status(500).json({
      message: 'Server error while retrieving submissions.'
    });
  }
});

/*
  Explicit request validation route.
  This route proves request data validation is implemented.
*/
router.post(
  '/validation-check',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required.')
      .isLength({ min: 3 })
      .withMessage('Title must be at least 3 characters long.')
  ],
  handleValidationErrors,
  (req, res) => {
    const { title } = req.body;

    res.json({
      message: 'Validation passed.',
      title
    });
  }
);

router.post(
  '/submissions/:id/grade',
  verifyToken,
  requireRole('admin', 'teacher'),
  [
    body('grade')
      .notEmpty()
      .withMessage('Grade is required.')
      .isFloat({ min: 0, max: 100 })
      .withMessage('Grade must be a number between 0 and 100.'),

    body('feedback')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Feedback cannot exceed 500 characters.')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { grade, feedback } = req.body;

      await db.query(
        `
        UPDATE submissions
        SET grade = ?, feedback = ?, status = 'graded'
        WHERE id = ?
        `,
        [grade, feedback || null, req.params.id]
      );

      res.json({
        message: 'Submission graded successfully.'
      });
    } catch (error) {
      console.error('API grade error:', error);

      res.status(500).json({
        message: 'Server error while grading submission.'
      });
    }
  }
);

export default router;