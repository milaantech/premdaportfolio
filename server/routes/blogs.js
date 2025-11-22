const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const requireAdmin = require('../middleware/auth');

function slugify(s=''){
  return s.toString().toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function ensureUniqueSlug(desired, excludeId=null){
  if(!desired) desired = `post-${Date.now()}`;
  let base = slugify(desired);
  let candidate = base;
  let i = 2;
  while(true){
    const q = { slug: candidate };
    if(excludeId) q._id = { $ne: excludeId };
    const exists = await Blog.findOne(q).lean();
    if(!exists) return candidate;
    candidate = `${base}-${i++}`;
    // safety cap
    if(i > 10000) return `${base}-${Date.now()}`;
  }
}

// List blogs
router.get('/', async (req, res) => {
  try{
    const list = await Blog.find({}).sort({ createdAt: -1 }).lean();
    res.json(list);
  }catch(err){ res.status(400).json({ error: err.message }); }
});

// Get single blog
router.get('/:id', async (req, res) => {
  try{
    const b = await Blog.findById(req.params.id).lean();
    if(!b) return res.status(404).json({ error: 'Not found' });
    res.json(b);
  }catch(err){ res.status(400).json({ error: err.message }); }
});

// Create blog
router.post('/', requireAdmin, async (req, res) => {
  try{
    // ensure slug uniqueness
    const desired = req.body.slug || req.body.title || '';
    req.body.slug = await ensureUniqueSlug(desired, null);
    const b = await Blog.create(req.body);
    res.status(201).json(b);
  }catch(err){ res.status(400).json({ error: err.message }); }
});

// Update blog
router.put('/:id', requireAdmin, async (req, res) => {
  try{
    // ensure slug uniqueness if provided/changed
    const existing = await Blog.findById(req.params.id).lean();
    if(!existing) return res.status(404).json({ error: 'Not found' });
    const desired = req.body.slug || req.body.title || existing.title || '';
    req.body.slug = await ensureUniqueSlug(desired, req.params.id);
    const b = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(b);
  }catch(err){ res.status(400).json({ error: err.message }); }
});

// Delete blog
router.delete('/:id', requireAdmin, async (req, res) => {
  try{
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }catch(err){ res.status(400).json({ error: err.message }); }
});

module.exports = router;
