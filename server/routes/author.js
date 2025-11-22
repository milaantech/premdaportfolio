const express = require('express');
const router = express.Router();
const Author = require('../models/Author');

// Get the single author (first)
router.get('/', async (req, res) => {
  const a = await Author.findOne({}).lean();
  res.json(a || null);
});

const requireAdmin = require('../middleware/auth');

// Upsert author (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try{
    const data = req.body;
    const existing = await Author.findOne({});
    if(existing){
      Object.assign(existing, data);
      await existing.save();
      return res.json(existing);
    }
    const a = await Author.create(data);
    res.status(201).json(a);
  }catch(err){ res.status(400).json({ error: err.message }); }
});

module.exports = router;
