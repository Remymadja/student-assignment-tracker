export function validateRequiredFields(requiredFields) {
  return (req, res, next) => {
    const missingFields = [];

    requiredFields.forEach((field) => {
      if (!req.body[field] || String(req.body[field]).trim() === '') {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Validation failed.',
        missingFields
      });
    }

    next();
  };
}

export function validateGrade(req, res, next) {
  const { grade } = req.body;

  if (grade === undefined || grade === '') {
    return res.status(400).json({
      message: 'Grade is required.'
    });
  }

  const numericGrade = Number(grade);

  if (Number.isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
    return res.status(400).json({
      message: 'Grade must be a number between 0 and 100.'
    });
  }

  next();
}

export function validateEmail(req, res, next) {
  const { email } = req.body;

  if (!email || String(email).trim() === '') {
    return res.status(400).json({
      message: 'Email is required.'
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return res.status(400).json({
      message: 'Invalid email format.'
    });
  }

  next();
}