import React from 'react';
import { Link } from 'react-router-dom';

function TagPills({ tags = [] }){
  if(!tags || !tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {tags.slice(0,3).map((t, i) => (
        <span key={i} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full">{t}</span>
      ))}
    </div>
  );
}

export default function BlogCard({ blog }){
  const image = blog.image || 'https://placehold.co/800x450?text=Blog';
  const id = blog._id || blog.id;
  const date = blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : null;

  return (
    <article className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition">
      <Link to={`/blog/${id}`} className="block relative">
        <div className="overflow-hidden h-48 sm:h-40 lg:h-44">
          <img src={image} alt={blog.title} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" onError={(e)=>{e.target.onerror=null; e.target.src='https://placehold.co/800x450?text=Blog'}} />
        </div>
        <div className="absolute left-4 top-4 bg-black/50 text-white text-xs px-2 py-1 rounded">{date}</div>
      </Link>
      <div className="p-5">
        <h4 className="font-serif text-lg mb-2 leading-tight"><Link to={`/blog/${id}`} className="hover:underline">{blog.title}</Link></h4>
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{blog.excerpt}</p>
        <TagPills tags={Array.isArray(blog.tags) ? blog.tags : (blog.tags ? String(blog.tags).split(',').map(s=>s.trim()) : [])} />

        <div className="mt-4 flex items-center justify-between">
          <Link to={`/blog/${id}`} className="inline-flex items-center gap-2 text-amber-600 hover:underline font-medium">Read Article →</Link>
          <div className="text-xs text-slate-400">{blog.readTime || ''}</div>
        </div>
      </div>
    </article>
  );
}
