import React from 'react';

export default function ShareButtons({ url, title }){
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title || '');
  return (
    <div className="flex items-center gap-3">
      <a href={`https://twitter.com/intent/tweet?url=${encoded}&text=${text}`} target="_blank" rel="noreferrer" className="text-sm px-3 py-1 bg-sky-500 text-white rounded hover:opacity-90">Twitter</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noreferrer" className="text-sm px-3 py-1 bg-blue-700 text-white rounded hover:opacity-90">Facebook</a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`} target="_blank" rel="noreferrer" className="text-sm px-3 py-1 bg-slate-900 text-white rounded hover:opacity-90">LinkedIn</a>
    </div>
  );
}
