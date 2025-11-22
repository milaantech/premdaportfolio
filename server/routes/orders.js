const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const mongoose = require('mongoose');
const requireAdmin = require('../middleware/auth');
const ordersQueue = require('../lib/ordersQueue');
// Create order
router.post('/', async (req, res) => {
  try{
    const { items, customer, payment, amount, meta } = req.body;
    console.log('[orders] Create request received:', { items: items && items.length, customer: customer && customer.email, amount });
    // If MongoDB is not connected, enqueue the order for later processing
    if(mongoose.connection.readyState !== 1){
      try{
        ordersQueue.enqueue({ items, customer, payment, amount, meta });
        return res.status(202).json({ queued: true, message: 'Order accepted and queued; will be flushed when DB reconnects.' });
      }catch(e){
        console.warn('[orders] enqueue failed', e.message);
        return res.status(503).json({ error: 'Database not available and queue failed', detail: e.message });
      }
    }

    const o = await Order.create({ items, customer, payment, amount, meta });
    console.log('[orders] Order created with id', o._id);
    res.status(201).json({ id: o._id, createdAt: o.createdAt });
  }catch(err){ res.status(400).json({ error: err.message }); }
});



// Get order by id
// NOTE: Keep literal routes (like /queue) before parameter routes (/:id) so Express doesn't
// interpret the literal "queue" as an :id parameter which causes ObjectId cast errors.

// View queued orders (admin only)
router.get('/queue', requireAdmin, async (req, res) => {
  try{
    const q = ordersQueue.readQueue();
    res.json(q);
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// Flush queued orders immediately (admin only)
router.post('/queue/flush', requireAdmin, async (req, res) => {
  try{
    await ordersQueue.processQueue();
    res.json({ ok: true, message: 'Queue flush attempted; check server logs for details.' });
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// Get order by id
router.get('/:id', async (req, res) => {
  try{
    const o = await Order.findById(req.params.id).lean();
    if(!o) return res.status(404).json({ error: 'Not found' });
    res.json(o);
  }catch(err){ res.status(400).json({ error: err.message }); }
});

// List orders (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try{
    const list = await Order.find({}).sort({ createdAt: -1 }).lean();
    res.json(list);
  }catch(err){ res.status(400).json({ error: err.message }); }
});

// Update order status (admin only)
router.put('/:id/status', requireAdmin, async (req, res) => {
  try{
    const { status } = req.body || {};
    const updated = await Order.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true }).lean();
    if(!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  }catch(err){ res.status(400).json({ error: err.message }); }
});

// Delete an order (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try{
    const deleted = await Order.findByIdAndDelete(req.params.id).lean();
    if(!deleted) return res.status(404).json({ error: 'Not found' });
    console.log('[orders] Deleted order', req.params.id);
    res.json({ ok: true, deletedId: req.params.id });
  }catch(err){ res.status(400).json({ error: err.message }); }
});

// View queued orders (admin only)
router.get('/queue', requireAdmin, async (req, res) => {
  try{
    const q = ordersQueue.readQueue();
    res.json(q);
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// Flush queued orders immediately (admin only)
router.post('/queue/flush', requireAdmin, async (req, res) => {
  try{
    await ordersQueue.processQueue();
    res.json({ ok: true, message: 'Queue flush attempted; check server logs for details.' });
  }catch(err){ res.status(500).json({ error: err.message }); }
});

module.exports = router;
