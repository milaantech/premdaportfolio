const jwt = require('jsonwebtoken');

module.exports = function requireAdmin(req, res, next){
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;

  // Debugging helper: log whether an Authorization header was provided and token length (but never print token itself)
  try{ console.log('[auth] Authorization header present=', !!auth, ' tokenLen=', token ? token.length : 0); }catch(e){}

  const JWT_SECRET = process.env.JWT_SECRET;

  // Enforce JWT_SECRET presence for secure admin routes
  if(!JWT_SECRET){
    console.error('JWT_SECRET not set on server - admin routes are intentionally protected. Set JWT_SECRET in .env');
    return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET not set' });
  }

  if(!token) return res.status(401).json({ error: 'Unauthorized', detail: 'Missing Authorization header' });

  try{
    // Require a proper JWT
    if(typeof token === 'string' && token.split('.').length === 3){
      const payload = jwt.verify(token, JWT_SECRET);
      if(payload && payload.role === 'admin'){
        req.admin = payload;
        return next();
      }
      return res.status(401).json({ error: 'Unauthorized', detail: 'Invalid admin role in token' });
    }

    return res.status(401).json({ error: 'Unauthorized', detail: 'Invalid token format - JWT required' });
  }catch(err){
    console.debug('[auth] token verification error:', err.message);
    return res.status(401).json({ error: 'Unauthorized', detail: err.message });
  }
};
