const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');

const QUEUE_FILE = path.join(__dirname, '..', 'data', 'orders-queue.json');

function ensureQueueFile(){
  const dir = path.dirname(QUEUE_FILE);
  if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if(!fs.existsSync(QUEUE_FILE)) fs.writeFileSync(QUEUE_FILE, JSON.stringify([]));
}

function readQueue(){
  try{
    ensureQueueFile();
    const raw = fs.readFileSync(QUEUE_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  }catch(e){
    console.warn('[ordersQueue] read error', e.message);
    return [];
  }
}

function writeQueue(q){
  try{
    ensureQueueFile();
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(q, null, 2));
  }catch(e){
    console.warn('[ordersQueue] write error', e.message);
  }
}

async function processQueue(){
  const q = readQueue();
  if(!q.length) return;
  console.log('[ordersQueue] Processing', q.length, 'queued orders');
  const remaining = [];
  for(const item of q){
    try{
      const o = await Order.create(item);
      console.log('[ordersQueue] Flushed queued order ->', o._id);
    }catch(err){
      console.warn('[ordersQueue] Failed to flush order:', err.message);
      remaining.push(item);
    }
  }
  writeQueue(remaining);
}

function enqueue(order){
  const q = readQueue();
  q.push(order);
  writeQueue(q);
  console.log('[ordersQueue] Enqueued order (queue length now', q.length + ')');
}

module.exports = { enqueue, processQueue, readQueue };

