import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import Modal from './Modal';
import { useToast } from './ToastProvider';

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queue, setQueue] = useState([]);

  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchOrders();
      setOrders(data || []);
    } catch (err) {
      setError(err?.message || String(err));
    }
    setLoading(false);
  }

  async function loadQueue() {
    try {
      const q = await api.fetchOrderQueue();
      setQueue(q || []);
    } catch (err) {
      console.error('loadQueue failed', err);
    }
  }

  const toast = useToast();

  async function flushQueue() {
    try {
      await api.flushOrderQueue();
      await load();
      await loadQueue();
      toast && toast.push('success', 'Flush requested', 'Queued orders will be processed on the server.');
    } catch (err) {
      console.error('flush failed', err);
      toast && toast.push('error', 'Flush failed', String(err?.message || err));
    }
  }

  function requestFlushConfirm(){
    setModal({ isOpen: true, title: 'Confirm Flush', message: 'Are you sure you want to flush the queued orders to the database now? This will attempt to write any queued orders.', onConfirm: async ()=>{
      setModal({ isOpen: false, title: '', message: '', onConfirm: null });
      await flushQueue();
    } });
  }

  useEffect(() => { load(); }, []);

  async function changeStatus(id, status) {
    try {
      await api.updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
    } catch (err) {
      console.error('changeStatus', err);
      toast && toast.push('error', 'Status update failed', String(err?.message || err));
    }
  }

  function openDeleteConfirm(id) {
    setModal({ isOpen: true, title: 'Confirm Delete', message: 'Delete this order? This cannot be undone.', onConfirm: async () => {
        try {
        await api.deleteOrder(id);
        setOrders(prev => prev.filter(o => o._id !== id));
        setModal({ isOpen: false, title: '', message: '', onConfirm: null });
        toast && toast.push('success', 'Order deleted', 'The order was removed from the database.');
      } catch (err) {
        console.error('delete failed', err);
        setModal({ isOpen: false, title: '', message: '', onConfirm: null });
        toast && toast.push('error', 'Delete failed', String(err?.message || err));
      }
    } });
  }

  const filteredOrders = orders.filter(o => {
    if (filterStatus !== 'all' && (o.status || 'pending') !== filterStatus) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (o.customer?.name || '').toLowerCase().includes(s) || (o.customer?.email || '').toLowerCase().includes(s) || (o._id || '').toLowerCase().includes(s);
  });

  if (loading) return <main className="max-w-4xl mx-auto px-6 py-12">Loading orders...</main>;
  if (error) return <main className="max-w-4xl mx-auto px-6 py-12">Error loading orders: {String(error)}</main>;

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="font-serif text-3xl mb-4 text-amber-600">Orders</h2>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={loadQueue} className="px-3 py-2 bg-slate-900 text-white rounded">View Queue</button>
          <button onClick={requestFlushConfirm} className="px-3 py-2 bg-amber-600 text-white rounded">Flush Queue</button>
        </div>
        <div className="flex-1 flex items-center gap-2 w-full">
          <input placeholder="Search by name, email or order id" value={search} onChange={e => setSearch(e.target.value)} className="p-2 border rounded w-full md:w-64" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 border rounded bg-white text-black dark:bg-slate-800 dark:text-white">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="not_confirmed">Not confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="failed">Failed</option>
        </select>
        </div>
      </div>

      {queue && (
        <div className="mb-4 p-3 border rounded bg-white dark:bg-slate-800">
          <div className="font-semibold mb-2">Queued Orders ({queue.length})</div>
          {queue.length === 0 ? <div className="text-sm text-slate-500">No queued orders</div> : (
            <ul className="text-sm list-disc ml-5">
              {queue.map((q, i) => <li key={i}>{q.customer?.email || '—'} — {q.items?.length || 0} items — ₹{q.amount}</li>)}
            </ul>
          )}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="text-sm text-slate-500">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(o => (
            <div key={o._id} className="p-4 border rounded bg-white dark:bg-slate-800">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="font-semibold">Order #{o._id}</div>
                  <div className="text-sm text-slate-500">{o.customer?.name} • {o.customer?.email}</div>
                  <div className="text-sm text-slate-500 mt-1">{o.customer?.phone ? `Phone: ${o.customer.phone}` : ''}</div>
                  {o.customer?.address && (
                    <div className="text-sm text-slate-500 mt-1">{o.customer.address}{o.customer.city ? `, ${o.customer.city}` : ''}{o.customer.pincode ? ` - ${o.customer.pincode}` : ''}</div>
                  )}
                  <div className="text-sm mt-2">Items:</div>
                  <ul className="ml-4 list-disc text-sm">
                    {(o.items || []).map((it, i) => (<li key={i}>{it.title} — ₹{it.price} x {it.qty || 1}</li>))}
                  </ul>
                </div>
                <div className="text-right md:text-right md:pl-6 md:shrink-0">
                  <div className="font-bold text-amber-600">₹{Number(o.amount || 0).toLocaleString('en-IN')}</div>
                  <div className="text-sm text-slate-500">{new Date(o.createdAt).toLocaleString()}</div>
                  <div className="mt-3 flex items-center gap-2 justify-end">
                    <select value={o.status || 'placed'} onChange={(e) => changeStatus(o._id, e.target.value)} className="p-2 border rounded bg-white text-black dark:bg-slate-800 dark:text-white">
                      <option value="placed">Placed</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="not_confirmed">Not confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="failed">Failed</option>
                    </select>
                    <button onClick={() => openDeleteConfirm(o._id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal modal={modal} setModal={setModal} />
    </main>
  );
}
