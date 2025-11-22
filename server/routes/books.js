const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const requireAdmin = require('../middleware/auth');

// List books
router.get('/', async (req, res) => {
  const books = await Book.find({}).sort({ createdAt: -1 }).lean();
  res.json(books);
});

// Create book
router.post('/', requireAdmin, async (req, res) => {
  try{
    const b = await Book.create(req.body);
    res.status(201).json(b);
  }catch(err){ res.status(400).json({ error: err.message }); }
});

// Update book
router.put('/:id', requireAdmin, async (req, res) => {
  try{
    // Debug: log update attempts (helps diagnose why admin updates may not persist)
    try{ console.log('[books:put] id=%s auth=%s body=%o', req.params.id, !!req.headers.authorization, req.body); }catch(e){}
    const b = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(b);
  }catch(err){ res.status(400).json({ error: err.message }); }
});

// Delete book
router.delete('/:id', requireAdmin, async (req, res) => {
  try{
    await Book.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }catch(err){ res.status(400).json({ error: err.message }); }
});

// Toggle featured: mark this id as featured and unset others
router.post('/:id/toggle-featured', requireAdmin, async (req, res) => {
  try{
    const id = req.params.id;
    const clicked = await Book.findById(id);
    if(!clicked) return res.status(404).json({ error: 'Not found' });
    const make = !clicked.featured;
    if(make){
      // unset others
      await Book.updateMany({ _id: { $ne: id } }, { $set: { featured: false } });
    }
    clicked.featured = make;
    await clicked.save();
    res.json(clicked);
  }catch(err){ res.status(400).json({ error: err.message }); }
});

module.exports = router;
