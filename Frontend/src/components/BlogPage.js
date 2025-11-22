
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ShareButtons from './ShareButtons';

export default function BlogPage(){
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(()=>{
    let mounted = true;
    async function load(){
      setLoading(true);
      try{
        const b = await api.fetchBlog(id);
        if(mounted) setBlog(b);
      }catch(err){ if(mounted) setError(err.message || String(err)); }
      if(mounted) setLoading(false);
    }
    load();
    return ()=> mounted = false;
  }, [id]);

  if(loading) return <main className="max-w-4xl mx-auto px-6 py-12 animate-pulse text-center text-lg">Loading...</main>;
  if(error) return <main className="max-w-4xl mx-auto px-6 py-12 text-red-500 font-semibold">Error: {String(error)}</main>;
  if(!blog) return <main className="max-w-4xl mx-auto px-6 py-12">Post not found</main>;

  const isHtml = (s='') => /<\/?[a-z][\s\S]*>/i.test(s || '');
  const date = blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : null;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <article className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        {blog.image && (
          <div className="relative w-full h-64 sm:h-80 md:h-[420px]">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={(e)=>{e.target.onerror=null;e.target.src='https://placehold.co/1200x600?text=Blog'}}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute left-4 sm:left-8 bottom-6 text-white drop-shadow-lg">
              <div className="text-xs sm:text-sm opacity-90">{date}</div>
              <h1 className="mt-1 font-bold leading-tight text-2xl sm:text-4xl md:text-5xl font-serif">{blog.title}</h1>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-10">
          <div className="prose prose-lg max-w-none text-slate-700 dark:prose-invert dark:text-slate-300">
            {isHtml(blog.content) ? (
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {blog.content || blog.excerpt || ''}
              </ReactMarkdown>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap gap-2">
              {Array.isArray(blog.tags) && blog.tags.map((t, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full font-medium"
                >{t}</span>
              ))}
            </div>
            <ShareButtons url={window.location.href} title={blog.title} />
          </div>
        </div>
      </article>

      <div className="mt-8 text-left">
        <Link
          to="/blogs"
          className="text-amber-600 hover:underline text-sm sm:text-base font-semibold tracking-wide"
        >
          ← Back to Blog
        </Link>
      </div>
    </main>
  );
}
