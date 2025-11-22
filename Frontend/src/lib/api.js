// Lightweight API helper for the frontend to talk to the Express API.
// Default to the Render-hosted API so the frontend fetches data directly from the Render server.
export const API_BASE = process.env.REACT_APP_API_URL || 'https://premdaportfolio.onrender.com';

async function request(path, opts = {}){
  // include Authorization Bearer token from localStorage when present
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  try{
    let tokenRaw = localStorage.getItem('pt_admin_token');
    if(tokenRaw){
      try{ tokenRaw = JSON.parse(tokenRaw); }catch(e){ /* keep raw if not JSON */ }
      if(tokenRaw) headers['Authorization'] = `Bearer ${tokenRaw}`;
    }
  }catch(e){}

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...opts
  });
  if(!res.ok){
    const text = await res.text().catch(()=>null);
    throw new Error(text || res.statusText || 'API error');
  }
  // Try to parse JSON, otherwise return null
  const ct = res.headers.get('content-type') || '';
  if(ct.includes('application/json')) return res.json();
  return null;
}

export async function fetchBooks(){ return request('/api/books'); }
export async function fetchAuthor(){ return request('/api/author'); }
export async function saveAuthor(data){ return request('/api/author', { method: 'POST', body: JSON.stringify(data) }); }
export async function toggleFeatured(bookId){ return request(`/api/books/${bookId}/toggle-featured`, { method: 'POST' }); }
export async function adminLogin(username, password){
  return request('/api/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) });
}
export async function createOrder(payload){ return request('/api/orders', { method: 'POST', body: JSON.stringify(payload) }); }
export async function fetchOrders(){ return request('/api/orders'); }
export async function updateOrderStatus(id, status){ return request(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }); }
export async function deleteOrder(id){ return request(`/api/orders/${id}`, { method: 'DELETE' }); }
export async function fetchOrderQueue(){ return request('/api/orders/queue'); }
export async function flushOrderQueue(){ return request('/api/orders/queue/flush', { method: 'POST' }); }
// Books
export async function createBook(payload){ return request('/api/books', { method: 'POST', body: JSON.stringify(payload) }); }
export async function updateBook(id, payload){ return request(`/api/books/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); }
export async function deleteBook(id){ return request(`/api/books/${id}`, { method: 'DELETE' }); }
// Blogs
export async function fetchBlogs(){ return request('/api/blogs'); }
export async function fetchBlog(id){ return request(`/api/blogs/${id}`); }
export async function createBlog(payload){ return request('/api/blogs', { method: 'POST', body: JSON.stringify(payload) }); }
export async function updateBlog(id, payload){ return request(`/api/blogs/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); }
export async function deleteBlog(id){ return request(`/api/blogs/${id}`, { method: 'DELETE' }); }

export default { fetchBooks, fetchAuthor, saveAuthor, toggleFeatured, adminLogin, createOrder, fetchOrders, updateOrderStatus, deleteOrder, fetchOrderQueue, flushOrderQueue, fetchBlogs, fetchBlog, createBlog, updateBlog, deleteBlog };
