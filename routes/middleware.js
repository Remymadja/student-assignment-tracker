export function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Login eerst.');
    return res.redirect('/login');
  }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      req.flash('error', 'Geen toegang voor deze actie.');
      return res.redirect('/dashboard');
    }
    next();
  };
}
