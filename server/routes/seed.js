const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Author = require('../models/Author');
const requireAdmin = require('../middleware/auth');
const { SAMPLE_BOOKS, SAMPLE_AUTHOR } = require('../data/sampleData');

// Protected seed route - creates sample books/author if collections empty
router.post('/', requireAdmin, async (req, res) => {
  try{
    const bookCount = await Book.countDocuments();
    const authorCount = await Author.countDocuments();

    const result = { seeded: {} };

    if(bookCount === 0){
      const created = await Book.insertMany(SAMPLE_BOOKS);
      result.seeded.books = created.length;
    } else {
      result.seeded.books = 0;
    }

    if(authorCount === 0){
      const a = await Author.create(SAMPLE_AUTHOR);
      result.seeded.author = 1;
    } else {
      result.seeded.author = 0;
    }

    res.json(result);
  }catch(err){
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
