import crypto from 'node:crypto';

const tokens = new Map();
let TOKEN_TTL = 86400000; // 24 hours in ms

export function generateToken() {
  const token = crypto.randomBytes(32).toString('hex');
  tokens.set(token, { createdAt: Date.now() });
  return token;
}

export function verifyToken(token) {
  const entry = tokens.get(token);
  if (!entry) return false;
  if (Date.now() - entry.createdAt >= TOKEN_TTL) {
    tokens.delete(token);
    return false;
  }
  return true;
}

export function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授权，请先登录' });
  }
  const token = auth.slice(7);
  if (!verifyToken(token)) {
    return res.status(401).json({ error: '未授权，请先登录' });
  }
  next();
}

export function clearTokens() {
  tokens.clear();
}

export function _setTTL(ms) {
  TOKEN_TTL = ms;
}
