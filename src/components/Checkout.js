import React, { useState } from 'react';
import { useToast } from './ToastProvider';
import { useNavigate } from 'react-router-dom';

function formatCardNumber(v){
  return v.replace(/\D/g,'').slice(0,16).replace(/(\d{4})(?=\d)/g,'$1 ').trim();
}

function formatExpiry(v){
  const raw = v.replace(/\D/g,'').slice(0,4);
  if(raw.length < 3) return raw;
  return raw.slice(0,2) + '/' + raw.slice(2);
}

export default function Checkout({ cart, setCart, showAlert }){
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', address:'', city:'', pincode:'', phone:'', payment: 'cod', cardNumber:'', cardExpiry:'', cardCvc:'' });
  const [isProcessing, setIsProcessing] = useState(false);

  const total = cart.reduce((s,c)=>s+Number(c.price||0) * (c.qty || 1),0);

  function validateCard(){
    const num = form.cardNumber.replace(/\s/g,'');
    if(num.length < 13) return false;
    if(!/^[0-9]{3,4}$/.test(form.cardCvc)) return false;
    if(!/^\d{2}\/\d{2}$/.test(form.cardExpiry)) return false;
    return true;
  }

  const toast = useToast();

  function handleSubmit(e){
    e.preventDefault();
    if(!form.name || !form.email || !form.address) {
      toast && toast.push('error', 'Missing fields', 'Please fill name, email and address');
      return;
    }

    // If card payment selected, validate card fields
    if(form.payment === 'card' && !validateCard()) {
      toast && toast.push('error', 'Invalid card', 'Please provide valid card details (mock validation).');
      return;
    }

    setIsProcessing(true);

    // Simulate payment and order processing
    (async () => {
      try{
        if(form.payment === 'card'){
          // Try server-side Stripe flow
          const resp = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:4000') + '/api/payments/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart, successUrl: window.location.origin + '/order-success/{CHECKOUT_SESSION_ID}', cancelUrl: window.location.origin + '/checkout' }) });
          const data = await resp.json();
          if(data && data.url){
            // redirect to Stripe hosted checkout
            window.location.href = data.url;
            return;
          }
        }

        // Create order on our server (fallback path when not redirected to Stripe)
        const payload = {
          items: cart.map(c => ({ bookId: c.id || c._id || c.bookId, title: c.title, price: Number(c.price || 0), qty: c.qty || 1 })),
          customer: { name: form.name, email: form.email, phone: form.phone, address: form.address, city: form.city, pincode: form.pincode },
          payment: form.payment,
          amount: total
        };
        // use api helper (attaches auth header if present)
        const orderJson = await (await fetch((process.env.REACT_APP_API_URL || 'http://localhost:4000') + '/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json();
        // verify server actually created the order
        if(!orderJson || (!orderJson.id && !orderJson._id)){
          throw new Error(JSON.stringify(orderJson || 'No response'));
        }
        const orderId = orderJson.id || orderJson._id;
        setCart([]);
        setIsProcessing(false);
        if(showAlert) showAlert('Order Placed', `Thank you ${form.name}! Your order (${orderId}) for ₹${total} has been placed.`);
        navigate(`/order-success/${orderId}`);
      }catch(err){
        setIsProcessing(false);
        toast && toast.push('error', 'Order failed', String(err?.message || err));
      }
    })();
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h2 className="font-serif text-3xl mb-4 text-amber-600">Checkout</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="space-y-3">
            <label className="text-sm">Full name</label>
            <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="p-3 border rounded w-full dark:bg-slate-900" required />

            <label className="text-sm">Email</label>
            <input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="p-3 border rounded w-full dark:bg-slate-900" required />

            <label className="text-sm">Phone</label>
            <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} className="p-3 border rounded w-full dark:bg-slate-900" />

            <label className="text-sm">Address</label>
            <textarea value={form.address} onChange={e=>setForm({...form, address:e.target.value})} className="p-3 border rounded w-full h-24 dark:bg-slate-900" required />

            <div className="grid grid-cols-2 gap-2">
              <input value={form.city} onChange={e=>setForm({...form, city:e.target.value})} placeholder="City" className="p-2 border rounded w-full dark:bg-slate-900" />
              <input value={form.pincode} onChange={e=>setForm({...form, pincode:e.target.value})} placeholder="Pincode" className="p-2 border rounded w-full dark:bg-slate-900" />
            </div>

            <div>
              <div className="text-sm mb-2">Payment</div>
              <select value={form.payment} onChange={e=>setForm({...form, payment:e.target.value})} className="p-2 border rounded w-full dark:bg-slate-900">
                <option value="cod">Cash on Delivery</option>
                <option value="card">Card (mock)</option>
              </select>
            </div>

            {form.payment === 'card' && (
              <div className="space-y-2">
                <label className="text-sm">Card Number</label>
                <input value={form.cardNumber} onChange={e=>setForm({...form, cardNumber: formatCardNumber(e.target.value)})} placeholder="4242 4242 4242 4242" className="p-3 border rounded w-full dark:bg-slate-900" />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm">Expiry (MM/YY)</label>
                    <input value={form.cardExpiry} onChange={e=>setForm({...form, cardExpiry: formatExpiry(e.target.value)})} placeholder="MM/YY" className="p-2 border rounded w-full dark:bg-slate-900" />
                  </div>
                  <div>
                    <label className="text-sm">CVC</label>
                    <input value={form.cardCvc} onChange={e=>setForm({...form, cardCvc: e.target.value.replace(/\D/g,'').slice(0,4)})} placeholder="123" className="p-2 border rounded w-full dark:bg-slate-900" />
                  </div>
                </div>
                <div className="text-xs text-slate-500">Card data is mocked. For real payments integrate Stripe/Razorpay server-side.</div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button type="submit" disabled={isProcessing} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded flex items-center gap-2">
                {isProcessing && <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" fill="none" strokeOpacity="0.25"/></svg>}
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
              <button type="button" onClick={()=>navigate('/')} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </div>
        </form>

        <aside className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h4 className="font-semibold mb-3">Order Summary</h4>
          {cart.length===0 ? (
            <div className="text-sm text-slate-500">No items in cart.</div>
          ) : (
            <div className="space-y-3">
              {cart.map((c,i)=> (
                <div key={i} className="flex items-center justify-between">
                  <div className="text-sm">{c.title} {c.qty && c.qty > 1 ? `×${c.qty}` : ''}</div>
                  <div className="font-semibold text-amber-600">₹{(Number(c.price) * (c.qty || 1)).toLocaleString('en-IN')}</div>
                </div>
              ))}
              <div className="mt-3 border-t pt-3 flex items-center justify-between font-bold">Total <span className="text-amber-600">₹{total.toLocaleString('en-IN')}</span></div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
