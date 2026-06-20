import jwt from 'jsonwebtoken';

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'dev_jwt_secret',
    {
      expiresIn: '2h'
    }
  );
}

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Access denied. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev_jwt_secret'
    );

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      message: 'Invalid or expired token.'
    });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Forbidden. You do not have access to this resource.'
      });
    }

    next();
  };
}