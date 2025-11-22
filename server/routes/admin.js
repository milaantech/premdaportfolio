const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AdminUser = require('../models/AdminUser');

// Helper: require JWT secret
function ensureJwtConfig(res){
  const JWT_SECRET = process.env.JWT_SECRET;
  if(!JWT_SECRET) return res.status(500).json({ error: 'JWT not configured on server. Set JWT_SECRET in .env' });
  return JWT_SECRET;
}

// POST /api/admin/signup { username, password }
// Signup is intentionally gated: if ADMIN_SIGNUP_SECRET is set, the request must include that secret
// or signup is allowed only when no admin users exist yet (first-time setup).
router.post('/signup', async (req, res) => {
  try{
    const { username, password, signupSecret } = req.body || {};
    if(!username || !password) return res.status(400).json({ error: 'username and password required' });

    const configuredSecret = process.env.ADMIN_SIGNUP_SECRET;
    const existing = await AdminUser.countDocuments();
    if(configuredSecret){
      if(!signupSecret || signupSecret !== configuredSecret) return res.status(403).json({ error: 'Signup not allowed (invalid signup secret)' });
    }else{
      // If no signup secret configured, only allow signup when there are zero admin users (first-time setup)
      if(existing > 0) return res.status(403).json({ error: 'Signup disabled on this server' });
    }

    const saltRounds = Number(process.env.BCRYPT_ROUNDS || 12);
    const hash = await bcrypt.hash(password, saltRounds);
    const user = await AdminUser.create({ username, passwordHash: hash, role: 'admin' });
    return res.status(201).json({ ok: true, id: user._id });
  }catch(err){
    console.error('[admin:signup] error', err && err.message);
    return res.status(400).json({ error: err.message });
  }
});

// POST /api/admin/login { username, password }
router.post('/login', async (req, res) => {
  try{
    const { username, password } = req.body || {};
    if(!username || !password) return res.status(400).json({ error: 'username and password required' });

    const JWT_SECRET = process.env.JWT_SECRET;
    if(!JWT_SECRET) return res.status(500).json({ error: 'JWT not configured on server' });

    const user = await AdminUser.findOne({ username }).lean();
    if(!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if(!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ sub: user._id.toString(), username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  }catch(err){
    console.error('[admin:login] error', err && err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Protected endpoint to get current admin info (requires JWT or legacy token handled by middleware elsewhere)
router.get('/me', async (req, res) => {
  // If JWT or legacy token is used via middleware, the admin payload may be on req.admin
  try{
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const JWT_SECRET = process.env.JWT_SECRET;
    if(!JWT_SECRET) return res.json({ ok: false, note: 'JWT not configured' });
    if(!token) return res.status(401).json({ error: 'Missing token' });
    const payload = jwt.verify(token, JWT_SECRET);
    if(!payload) return res.status(401).json({ error: 'Invalid token' });
    const user = await AdminUser.findById(payload.sub).lean();
    if(!user) return res.status(404).json({ error: 'Admin not found' });
    return res.json({ username: user.username, role: user.role, createdAt: user.createdAt });
  }catch(err){
    return res.status(401).json({ error: 'Invalid token', detail: err.message });
  }
});

// Debug endpoint (local dev) - returns minimal server status
router.get('/debug', (req, res) => {
  try{
    const mongoose = require('mongoose');
    return res.json({ mongoReadyState: mongoose.connection.readyState, adminUsers: process.env.ADMIN_USER || null });
  }catch(e){ return res.json({ error: e.message }); }
});

module.exports = router;
