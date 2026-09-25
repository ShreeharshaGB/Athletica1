import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Authentication required'
    });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1].trim()) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }

  const token = parts[1].trim();
  const jwtSecret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;

  if (!jwtSecret) {
    console.error('JWT secret is not configured in environment variables');
    return res.status(500).json({
      message: 'Server configuration error'
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (!decoded || !decoded.id || !decoded.role) {
      return res.status(401).json({
        message: 'Invalid or expired token'
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
};

export default authenticate;
export { authenticate as authMiddleware };
