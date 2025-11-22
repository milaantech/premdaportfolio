import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function currency(n){ return `₹${Number(n).toLocaleString('en-IN')}` }

export default function BookCard({ book }){
  const navigate = useNavigate();
  const coverImage = book.images?.[0] || 'https://placehold.co/800x1200?text=Cover';

  function PlatformDropdown({ book }){
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const dropdownRef = useRef(null);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 220 });
    const hasAny = book.amazonLink || book.flipkartLink || book.milaanLink;
    useEffect(()=>{
      if(!open) return;
      function onDoc(e){
        if(btnRef.current && btnRef.current.contains(e.target)) return;
        if(dropdownRef.current && dropdownRef.current.contains(e.target)) return;
        setOpen(false);
      }
      window.addEventListener('mousedown', onDoc);
      window.addEventListener('scroll', onDoc, true);
      return ()=>{ window.removeEventListener('mousedown', onDoc); window.removeEventListener('scroll', onDoc, true); };
    }, [open]);

    function toggle(){
      if(!btnRef.current) return setOpen(o=>!o);
      const rect = btnRef.current.getBoundingClientRect();
      const dropdownWidth = 220;
      let left = rect.right - dropdownWidth;
      if(left < 8) left = 8;
      const top = rect.bottom + window.scrollY + 6;
      setPos({ top, left, width: dropdownWidth });
      setOpen(o=>!o);
    }

    if(!hasAny) return null;

    const menu = open ? (
      <div ref={dropdownRef} style={{ position: 'absolute', top: pos.top + 'px', left: pos.left + 'px', width: pos.width + 'px' }} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow z-50">
        <div className="flex flex-col">
          {book.amazonLink && <a href={book.amazonLink} target="_blank" rel="noreferrer" className="px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900">Amazon</a>}
          {book.flipkartLink && <a href={book.flipkartLink} target="_blank" rel="noreferrer" className="px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900">Flipkart</a>}
          {book.milaanLink && <a href={book.milaanLink} target="_blank" rel="noreferrer" className="px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900">Milaan</a>}
        </div>
      </div>
    ) : null;

    return (
      <div className="relative">
        <button ref={btnRef} onClick={toggle} className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm">Buy ▾</button>
        {ReactDOM.createPortal(menu, document.body)}
      </div>
    );
  }

  return (
    <motion.article
      layout
      whileHover={{ y: -6, boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.1), 0 4px 6px -2px rgba(245, 158, 11, 0.05)" }}
      className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden flex flex-col transition duration-300 ease-in-out h-full"
    >
      {/* Glowing gradient background */}
      <div className="pointer-events-none absolute -inset-1 transform-gpu scale-95 filter blur-2xl opacity-0 group-hover:opacity-70 dark:group-hover:opacity-30 group-hover:scale-100 rounded-2xl bg-gradient-to-br from-amber-200 via-amber-400 to-rose-300 transition-all duration-300" />

      {/* Card content above the glow */}
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="relative">
          <img src={coverImage} alt={book.title} className="w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x1200?text=Cover' }} />
          <div className="absolute left-3 bottom-3 bg-amber-500/90 dark:bg-amber-600/90 text-white rounded-full px-3 py-0.5 text-xs font-semibold shadow-md">
            {book.genre}
          </div>
        </div>
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <h4 className="font-serif text-lg sm:text-xl">{book.title}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 flex-1">{book.subtitle}</p>

            <div className="mt-3 sm:mt-4 flex items-center justify-between pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-500">{currency(book.price)}</div>
                <div className="text-xs text-slate-500">{book.pages} pages</div>
              </div>
              <div className="flex items-center gap-2 relative">
                {/* Compact dropdown for platform links */}
                <PlatformDropdown book={book} />
                <button onClick={() => navigate(`/book/${book.id}`)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition">View Details</button>
              </div>
            </div>

            
        </div>
      </div>
    </motion.article>
  );
}
