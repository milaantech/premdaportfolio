import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function OrderSuccess(){
  const { id } = useParams();
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 text-center">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700">
        <h2 className="font-serif text-3xl text-amber-600 mb-2">Order Confirmed</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">Thank you for your purchase. Your order ID is:</p>
        <div className="inline-flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-lg border"> 
          <span className="font-mono font-semibold">{id}</span>
        </div>
        <p className="mt-4 text-sm text-slate-500">We'll send a confirmation email shortly (this is a demo).</p>
        <div className="mt-6">
          <Link to="/" className="block w-full md:inline-block md:w-auto text-center px-5 py-3 bg-amber-600 text-white rounded">Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
