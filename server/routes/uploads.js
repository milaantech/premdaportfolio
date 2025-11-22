const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
let multerAvailable = true;
let upload = null;

// ensure uploads dir exists
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

try{
  const multer = require('multer');
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
      const safe = file.originalname.replace(/[^a-z0-9.\-_]/gi, '_');
      cb(null, `${Date.now()}-${safe}`);
    }
  });
  upload = multer({ storage });
}catch(e){
  multerAvailable = false;
  console.warn('[uploads] multer is not installed; upload endpoint will return an error. Install multer to enable file uploads.');
}

// single file upload field name: file
if(multerAvailable && upload){
  router.post('/', upload.single('file'), (req, res) => {
    try{
      if(!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const host = req.get('host');
      const protocol = req.protocol;
      const url = `${protocol}://${host}/uploads/${req.file.filename}`;
      res.json({ url, filename: req.file.filename });
    }catch(err){
      console.error('upload error', err);
      res.status(500).json({ error: err.message || 'Upload failed' });
    }
  });
}else{
  router.post('/', (req, res) => {
    res.status(503).json({ error: 'File upload is not available on this server. Install multer in the server folder to enable uploads.' });
  });
}

module.exports = router;
