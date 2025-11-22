import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function useLocalState(key, initial) {
  const [state, setState] = React.useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; }
  });
  React.useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }, [key, state]);
  return [state, setState];
}

function currency(n){ return `₹${Number(n).toLocaleString('en-IN')}` }

export default function CartDrawer({ cart, remove, onCheckout, updateQty }){
  const navigate = useNavigate();
  const total = cart.reduce((s,c)=>s+Number(c.price||0) * (c.qty || 1),0);
  const [open, setOpen] = useLocalState('ui_cart_open', false);
  return (
    <div>
      {cart.length > 0 && (
        <button onClick={()=>setOpen(true)} className="fixed right-6 bottom-6 z-50 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-xl font-semibold transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-500/50">
          Cart ({cart.length})
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{x:'100%'}}
            animate={{x:0}}
            exit={{x:'100%'}}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full md:w-96 bg-white dark:bg-slate-800 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b dark:border-slate-700">
              <h4 className="font-serif text-xl">Your Shopping Cart</h4>
              <button onClick={()=>setOpen(false)} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {cart.length===0 ? <div className="text-sm text-slate-500 p-4 text-center">No items in cart</div> : (
                cart.map((c,i)=> (
                  <div key={i} className="flex items-center gap-4 py-3 border-b border-dashed dark:border-slate-700">
                    <img src={c.images?.[0]} alt={c.title} className="w-12 h-16 object-cover rounded-md flex-shrink-0" onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/100x150?text=Img';}} />
                    <div className="flex-1">
                      <div className="font-medium leading-snug">{c.title}</div>
                      <div className="text-xs text-slate-500">{c.subtitle}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <button onClick={() => updateQty && updateQty(c.id || c._id, -1)} className="px-2 py-1 border rounded text-sm">−</button>
                        <div className="text-sm">Qty: {c.qty || 1}</div>
                        <button onClick={() => updateQty && updateQty(c.id || c._id, 1)} className="px-2 py-1 border rounded text-sm">+</button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-amber-600 dark:text-amber-500">{currency((c.price || 0) * (c.qty || 1))}</div>
                      <button onClick={()=>remove(i)} className="text-rose-500 text-xs mt-1 hover:underline">Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 border-t dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-medium">Subtotal</div>
                <div className="font-bold text-xl text-amber-600 dark:text-amber-500">{currency(total)}</div>
              </div>
              <button onClick={() => { setOpen(false); navigate('/checkout'); }} disabled={cart.length === 0} className="w-full px-4 py-3 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-400 text-white rounded-lg font-semibold transition shadow-md">
                Proceed to Checkout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
