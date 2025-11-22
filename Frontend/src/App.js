import React, {useState, useEffect, useRef} from 'react';
import { HashRouter as Router, Routes, Route, Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Components split into separate files for clarity
import HeaderComponent from './components/Header';
import ToastProvider from './components/ToastProvider';
import useLocalState from './hooks/useLocalState';
import {
  SAMPLE_BOOKS,
  SAMPLE_AUTHOR,
  SAMPLE_PUBLISHERS,
  SAMPLE_TECH_PARTNERS,
  SAMPLE_SUPPORTERS,
  SAMPLE_AUTHORS_COLLAB,
  SAMPLE_REVIEWS
} from './data/sampleData';
import HomeComponent from './components/Home';
import BlogListComponent from './components/BlogList';
import BlogPageComponent from './components/BlogPage';
import BooksComponent from './components/Books';
import BookDetailComponent from './components/BookDetail';
import AdminComponent from './components/Admin';
import AboutComponent from './components/About';
import BookCard from './components/BookCard';
import Newsletter from './components/Newsletter';
import PartnerCard from './components/PartnerCard';
import StarRating from './components/StarRating';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Modal from './components/Modal';
import CheckoutComponent from './components/Checkout';
import OrderSuccess from './components/OrderSuccess';
import OrdersAdmin from './components/OrdersAdmin';
import api from './lib/api';
import PublishersTechPartnersSection from './components/PublishersTechPartnersSection';
import TrustedSupportersSection from './components/TrustedSupportersSection';
import MoreAuthorsSection from './components/MoreAuthorsSection';


// More authors section moved to `src/components/MoreAuthorsSection.js`.
// Use the imported `MoreAuthorsSection` component instead of an inline definition.

// Books page moved to `src/components/Books.js`.
// Use the imported `BooksComponent` instead of an inline definition.



// BookDetail moved to `src/components/BookDetail.js`.
// Use the imported `BookDetailComponent` instead of an inline definition.

// About page kept in this file? Moved some sections to components; keep using imported components where needed.
// (Primary About page UI is small — use the About route to render data-driven content from `author`.)
// If you want About as its own component file, we can extract it to `src/components/About.js`.

// -----------------------
// Contact
// -----------------------
function Contact({ showAlert }){
  function submit(e){
    e.preventDefault();
    showAlert('Message Sent', 'Thank you for your message! This is a demo; in a production app, the message would be sent to a server.');
    e.target.reset(); // Clear form after submission
  }
  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} id="contact" className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="font-serif text-3xl mb-4 text-amber-600 dark:text-amber-500">Contact</h2>
      <p className="text-slate-600 dark:text-slate-300 mb-8">For inquiries, collaborations or events — drop a message.</p>
      <form onSubmit={submit} className="grid grid-cols-1 gap-5 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <input name="name" placeholder="Name" className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-900" required />
        <input type="email" name="email" placeholder="Email" className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-900" required />
        <textarea name="message" placeholder="Message" className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg h-36 focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-900" required />
        <button type="submit" className="px-6 py-3 bg-slate-900 hover:bg-slate-700 text-white rounded-lg font-semibold transition shadow-md">Send Message</button>
      </form>
    </motion.main>
  );
}

// -----------------------
// REMOVED: Dedicated Partners Page component
// -----------------------
// The component is removed as its content is moved to the Home page.

// -----------------------
// Admin Login Component
// -----------------------
function AdminLogin({ loginAdmin, showAlert, isAdmin }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // This is correctly placed inside a component wrapped by Router

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    (async () => {
      const ok = await loginAdmin(id, password);
      if (ok) showAlert('Success', 'Admin logged in successfully!');
      else showAlert('Login Failed', 'Invalid User ID or Password.');
    })();
  }

  if (isAdmin) return <Navigate to="/admin" replace />;

  return (
    <motion.main 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="max-w-md mx-auto px-6 py-20"
    >
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700">
        <h2 className="font-serif text-3xl mb-4 text-amber-600 dark:text-amber-500 text-center">Admin Login</h2>
        <p className="text-center text-sm text-slate-500 mb-6">Use credentials: </p>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <input 
            type="text" 
            placeholder="User ID (admin)" 
            value={id} 
            onChange={e => setId(e.target.value)}
            className="p-3 border rounded-lg w-full dark:bg-slate-900 focus:ring-amber-500 focus:border-amber-500" 
            required 
          />
          <input 
            type="password" 
            placeholder="Password (secret123)" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            className="p-3 border rounded-lg w-full dark:bg-slate-900 focus:ring-amber-500 focus:border-amber-500" 
            required 
          />
          <button 
            type="submit" 
            className="mt-2 px-6 py-3 bg-slate-900 hover:bg-slate-700 text-white rounded-lg font-semibold transition shadow-md"
          >
            Login
          </button>
        </form>
      </div>
    </motion.main>
  );
}


// Admin dashboard component has been moved to `src/components/Admin.js`.


// -----------------------
// App
// -----------------------
export default function App(){
  const [books, setBooks] = useLocalState('pt_books', SAMPLE_BOOKS);
  const [author, setAuthor] = useLocalState('pt_author', SAMPLE_AUTHOR);
  const [blogs, setBlogs] = useLocalState('pt_blogs', []);
  const [cart, setCart] = useLocalState('pt_cart', []);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [isAdmin, setIsAdmin] = useLocalState('pt_is_admin', false);
  const [adminToken, setAdminToken] = useLocalState('pt_admin_token', null);
  
  // Admin Credentials
  const ADMIN_ID = 'admin';
  const ADMIN_PASSWORD = 'secret123';

  // Central function to trigger the custom modal
  function showAlert(title, message, onConfirm = null) {
    setModal({ isOpen: true, title, message, onConfirm });
  }

  function addToCart(book){
    // normalize: keep qty on cart items
    const existing = cart.find(c => (c.id || c._id) === (book.id || book._id));
    if(existing){
      // Ask admin/user if they'd like to increase quantity
      showAlert('Already in cart', `${book.title} is already in your cart. Increase quantity by 1?`, () => {
        setCart(prev => prev.map(c => ((c.id || c._id) === (book.id || book._id)) ? { ...c, qty: (c.qty || 1) + 1 } : c));
      });
      return;
    }
    setCart(prev => [...prev, { ...book, qty: 1 }]);
    showAlert('Item Added', `${book.title} has been added to your cart.`);
  }

  function updateCartQty(bookId, delta){
    setCart(prev => prev.map(c => ((c.id || c._id) === bookId) ? { ...c, qty: Math.max(1, (c.qty || 1) + delta) } : c));
  }

  function removeFromCart(idx){ setCart(prev => prev.filter((_,i)=>i!==idx)); }

  function checkout(){
    // This is where you would start the actual payment flow
    showAlert('Checkout Demo', 'Implement Stripe/Razorpay checkout flow here.');
  }

  async function loginAdmin(id, password) {
    try{
      const data = await api.adminLogin(id, password);
      if(data && data.token){
        setIsAdmin(true);
        setAdminToken(data.token);
        return true;
      }
    }catch(err){
      console.warn('Admin login failed', err.message || err);
      return false;
    }
    return false;
  }

  // logoutAdmin: accepts a navigate function and optional force flag to skip confirmation
  function logoutAdmin(navigateCallback, force = false) {
    if(force){
      setIsAdmin(false);
      setAdminToken(null);
      try{ navigateCallback('/'); }catch(e){}
      return;
    }
    showAlert('Confirm Logout', 'Are you sure you want to log out of the Admin dashboard?', () => {
      setIsAdmin(false);
      setAdminToken(null);
      navigateCallback('/'); // Call the passed navigate function
    });
  }

  // Wrapper for Admin route access control
  const AdminRoute = ({ element }) => (
    isAdmin ? element : <Navigate to="/admin/login" replace />
  );

  // Try to load backend data if available. Falls back to localStorage/sample data.
  useEffect(() => {
    let mounted = true;
    async function load() {
      try{
        const remoteBooks = await api.fetchBooks();
        // If the backend responded with an array (even empty), prefer that over local sample data.
        if(mounted && Array.isArray(remoteBooks)) {
          setBooks(remoteBooks.map(b => ({ ...b, id: b._id || b.id }))); // normalize id
        }
      }catch(err){ /* ignore, backend not available */ }
      try{
        const remoteAuthor = await api.fetchAuthor();
        if(mounted && remoteAuthor) setAuthor(remoteAuthor);
      }catch(err){ /* ignore */ }
      try{
        const remoteBlogs = await api.fetchBlogs();
        if(mounted && Array.isArray(remoteBlogs)) setBlogs(remoteBlogs.map(b => ({ ...b, id: b._id || b.id })));
      }catch(err){ /* ignore */ }
    }
    load();
    // Listen for updates coming from Admin panel and reload blogs
    const reload = async () => {
      try{ const remote = await api.fetchBlogs(); if(Array.isArray(remote)) setBlogs(remote.map(b => ({ ...b, id: b._id || b.id }))); }catch(e){}
    };
    window.addEventListener('blogs-updated', reload);
    return () => { mounted = false; };
  }, []); // run once



  return (
    <Router>
      <ToastProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-[Inter]">
  {/* Prefer a book marked `featured`; fallback to first book */}
  <HeaderComponent author={author} isAdmin={isAdmin} featuredBook={books && books.length ? (books.find(b => b.featured) || books[0]) : null} />

        <AnimatePresence mode="wait">
          <Routes>
            {/* Home page now contains all content */}
            <Route path="/" element={<HomeComponent books={books} author={author} showAlert={showAlert} BookCard={BookCard} Newsletter={Newsletter} PublishersTechPartnersSection={PublishersTechPartnersSection} TrustedSupportersSection={TrustedSupportersSection} publishers={SAMPLE_PUBLISHERS} techPartners={SAMPLE_TECH_PARTNERS} supporters={SAMPLE_SUPPORTERS} />} />
            <Route path="/books" element={<BooksComponent books={books} showAlert={showAlert} BookCard={BookCard} Newsletter={Newsletter} MoreAuthorsSection={MoreAuthorsSection} authors={SAMPLE_AUTHORS_COLLAB} />} />
            {/* REMOVED: Dedicated Partners Page Route */}
            <Route path="/book/:id" element={<BookDetailComponent books={books} addToCart={addToCart} showAlert={showAlert} BookCard={BookCard} Newsletter={Newsletter} reviews={SAMPLE_REVIEWS} />} />
            <Route path="/blogs" element={<BlogListComponent blogs={blogs} />} />
            <Route path="/blog/:id" element={<BlogPageComponent />} />
            <Route path="/about" element={<AboutComponent author={author} books={books} />} />
            <Route path="/contact" element={<Contact showAlert={showAlert} />} />
            <Route path="/checkout" element={<CheckoutComponent cart={cart} setCart={setCart} showAlert={showAlert} />} />
            <Route path="/order-success/:id" element={<OrderSuccess />} />
            
            {/* Admin Login Route */}
            <Route path="/admin/login" element={<AdminLogin loginAdmin={loginAdmin} showAlert={showAlert} isAdmin={isAdmin} />} />
            
            {/* Protected Admin Dashboard Route */}
            <Route path="/admin" element={
              <AdminRoute 
                element={<AdminComponent books={books} setBooks={setBooks} showAlert={showAlert} logoutAdmin={logoutAdmin} author={author} setAuthor={setAuthor} />}
              />
            } />
            {/* Admin Orders view */}
            <Route path="/admin/orders" element={
              <AdminRoute element={<OrdersAdmin />} />
            } />
            
            <Route path="https://www.milaanpublications.in/bookstore" element={<main className="max-w-4xl mx-auto px-6 py-12"><h2 className="font-serif text-3xl">404 - Page Not Found</h2><p className="mt-4">The page you were looking for doesn't exist.</p></main>} />
          </Routes>
        </AnimatePresence>

        <Footer author={author} />

  <CartDrawer cart={cart} remove={removeFromCart} onCheckout={checkout} updateQty={updateCartQty} />

        <Modal modal={modal} setModal={setModal} />
      </div>
      </ToastProvider>
    </Router>
  );
}
