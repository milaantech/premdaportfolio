import React, { useState } from 'react';

export default function Footer({ author = {} }){
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e){
    e.preventDefault();
    if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){
      setSubscribed('invalid');
      return;
    }
    try{
      const raw = localStorage.getItem('newsletter_emails');
      const list = raw ? JSON.parse(raw) : [];
      if(!list.includes(email)) list.push(email);
      localStorage.setItem('newsletter_emails', JSON.stringify(list));
      setSubscribed(true);
      setEmail('');
      setTimeout(()=>setSubscribed(false), 3000);
    }catch(err){
      setSubscribed('error');
    }
  }

  const socials = author.social || {};

  return (
    <footer className="mt-16 bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-t-xl shadow-inner">
  <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-serif text-lg mb-2">About</h4>
          <p className="text-sm text-slate-300">{author.name || 'Our publishing house'} — {author.tagline || 'Curating stories that matter.'}</p>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-2">Links</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li><a className="hover:text-amber-400" href="/about">About Us</a></li>
            <li><a className="hover:text-amber-400" href="/privacy">Privacy Policy</a></li>
            <li><a className="hover:text-amber-400" href="/terms">Terms &amp; Conditions</a></li>
            <li><a className="hover:text-amber-400" href="/contact">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-2">Contact</h4>
          <div className="text-sm text-slate-300 space-y-2">
            <div>Email: <a className="underline hover:text-amber-400" href={`mailto:${socials.email || 'info@example.com'}`}>{socials.email || 'info@example.com'}</a></div>
            <div>Phone: <a className="underline hover:text-amber-400" href={`tel:${socials.phone || '+91-000-000-0000'}`}>{socials.phone || '+91-000-000-0000'}</a></div>
            <div className="flex items-center gap-3 mt-2">
              {socials.instagram && <a className="text-slate-300 hover:text-amber-400 text-sm" href={socials.instagram} target="_blank" rel="noreferrer">Instagram</a>}
              {socials.goodreads && <a className="text-slate-300 hover:text-amber-400 text-sm" href={socials.goodreads} target="_blank" rel="noreferrer">Goodreads</a>}
              {socials.twitter && <a className="text-slate-300 hover:text-amber-400 text-sm" href={socials.twitter} target="_blank" rel="noreferrer">Twitter</a>}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-2">Newsletter</h4>
          <p className="text-sm text-slate-300 mb-3">Get occasional updates, launch news and reading recommendations.</p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com" className="w-full p-2 rounded bg-white text-slate-900" />
            <button type="submit" className="px-4 py-2 rounded bg-amber-500 text-white">Subscribe</button>
          </form>
          <div className="mt-2 text-sm">
            {subscribed === true && <span className="text-emerald-400">Subscribed — thank you!</span>}
            {subscribed === 'invalid' && <span className="text-rose-400">Enter a valid email.</span>}
            {subscribed === 'error' && <span className="text-rose-400">Could not subscribe. Try again later.</span>}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/60 mt-6 pt-6 pb-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-400">© {new Date().getFullYear()} {author.name || 'Publisher'}. All rights reserved.</div>
          <div className="text-sm text-slate-400">Built with Milaan Technologies — <a className="underline hover:text-amber-400" href="/contact">Get in touch</a></div>
        </div>
      </div>
    </footer>
  );
}
