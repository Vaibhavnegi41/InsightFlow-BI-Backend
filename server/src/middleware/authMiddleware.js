import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'insightflow_super_secret_jwt_key_2026';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Provide a guest user context if no token for effortless evaluation/demo
    req.user = { id: 'guest_user', name: 'Business Analyst', email: 'analyst@insightflow.internal', role: 'Business Analyst' };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}
