// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';

// export default function BookDetail({ books, addToCart, showAlert, BookCard, Newsletter, reviews = [] }){
//   const {id} = useParams();
//   const book = books.find(b=>b.id===id);
//   const navigate = useNavigate();
//   const [mainImage, setMainImage] = useState(book?.images?.[0]);

//   useEffect(() => {
//       if (book?.images?.[0]) {
//           setMainImage(book.images[0]);
//       }
//   }, [book]);

//   if(!book) return <main className="max-w-4xl mx-auto px-6 py-12">Book not found</main>;

//   const relatedBooks = books
//     .filter(b => b.id !== book.id)
//     .slice(0, 3);

//   return (
//     <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto px-6 py-12">
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
//         <div className="md:col-span-1">
//           <motion.img
//             initial={{ scale: 0.95, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 100 }}
//             src={mainImage}
//             alt={book.title}
//             className="w-full h-auto rounded-xl shadow-2xl shadow-slate-900/20 dark:shadow-slate-500/10 object-cover aspect-[2/3]"
//             onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/800x1200?text=Cover'}}
//           />

//           {book.images?.length > 1 && (
//             <div className="mt-4 flex flex-wrap gap-2 justify-center">
//               {book.images.map((img, index) => (
//                 <img
//                   key={index}
//                   src={img}
//                   alt={`Thumbnail ${index + 1}`}
//                   className={`w-14 h-20 object-cover rounded-md cursor-pointer border-2 transition ${mainImage === img ? 'border-amber-500' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'}`}
//                   onClick={() => setMainImage(img)}
//                   onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/100x150?text=Img';}}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//         <div className="md:col-span-2">
//           <h2 className="font-serif text-4xl leading-tight text-amber-600 dark:text-amber-500">{book.title}</h2>
//           <p className="text-lg text-slate-600 dark:text-slate-300 mt-2 italic">{book.subtitle}</p>

//           <div className="mt-4 flex items-center gap-6 border-b pb-4 border-slate-200 dark:border-slate-700">
//             <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">₹{Number(book.price).toLocaleString('en-IN')}</div>
//             <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-sm font-medium">{book.genre}</span>
//           </div>

//           <p className="mt-6 text-lg text-slate-700 dark:text-slate-300 leading-relaxed">{book.description}</p>

//           <ul className="mt-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
//             <li><strong>ISBN:</strong> {book.isbn}</li>
//             <li><strong>Published:</strong> {book.pubDate}</li>
//             <li><strong>Pages:</strong> {book.pages}</li>
//           </ul>

//           <div className="mt-8 flex flex-col sm:flex-row gap-3">
//             <button onClick={()=>addToCart(book)} className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition shadow-md shadow-emerald-600/30">
//               Add to Cart
//             </button>
//             <button
//               onClick={() => showAlert('Buy Now Demo', 'Direct purchase functionality needs integration with a payment gateway like Stripe or Razorpay.')}
//               className="w-full sm:w-auto px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition"
//             >
//               Buy Now
//             </button>
//             <button onClick={()=>navigate(-1)} className="w-full sm:w-auto px-4 py-3 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition">
//               ← Back
//             </button>
//           </div>
//         </div>
//       </div>

//       <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
//         <h4 className="font-serif text-2xl mb-6">Reader Reviews ({reviews.length})</h4>
//         <div className="space-y-6">
//             {reviews.map(review => (
//                 <div key={review.id} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
//                     <div className="flex items-center justify-between mb-2">
//                         <div className="font-semibold text-lg">{review.user}</div>
//                         <div className="inline-flex gap-0.5">
//                           {Array.from({length:5}).map((_,i)=>(
//                             <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'} inline`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
//                           ))}
//                         </div>
//                     </div>
//                     <p className="text-sm text-slate-700 dark:text-slate-300">{review.comment}</p>
//                     <div className="text-xs text-slate-500 mt-2 text-right">Reviewed on: {review.date}</div>
//                 </div>
//             ))}
//         </div>
//         <button onClick={() => showAlert('Review Submission', 'Implement a form and backend logic for submitting reader reviews.')} className="mt-6 px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition">
//             Write a Review
//         </button>
//       </section>

//       {relatedBooks.length > 0 && (
//           <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
//               <h4 className="font-serif text-2xl mb-6">You Might Also Like</h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//                   {relatedBooks.map(b => (
//                       <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
//                           <BookCard book={b} />
//                       </motion.div>
//                   ))}
//               </div>
//           </section>
//       )}

//       <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
//           <Newsletter showAlert={showAlert} />
//       </div>

//     </motion.main>
//   );
// }
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function BookDetail({
  books,
  addToCart,
  showAlert,
  BookCard,
  Newsletter,
  reviews = [],
}) {
  const { id } = useParams();
  const book = books.find((b) => b.id === id);
  const navigate = useNavigate();
  const [mainImage, setMainImage] = useState(book?.images?.[0]);

  useEffect(() => {
    if (book?.images?.[0]) setMainImage(book.images[0]);
  }, [book]);

  if (!book)
    return (
      <main className="max-w-4xl mx-auto px-6 py-16 text-center text-slate-600 dark:text-slate-300">
        <p className="text-lg">Book not found</p>
      </main>
    );

  const relatedBooks = books.filter((b) => b.id !== book.id).slice(0, 3);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto px-6 py-16"
    >
  {/* Top Book Section */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
  {/* Image Section */}
  <div className="md:col-span-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
          >
            <img
              src={mainImage}
              alt={book.title}
              className="w-full h-[360px] md:h-[480px] lg:h-[560px] object-cover rounded-2xl"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/800x1200?text=Cover";
              }}
            />
          </motion.div>

          {/* Thumbnails */}
          {book.images?.length > 1 && (
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {book.images.map((img, i) => (
                <motion.img
                  key={i}
                  src={img}
                  alt={`Thumb ${i + 1}`}
                  whileHover={{ scale: 1.05 }}
                  className={`w-16 h-20 object-cover rounded-md cursor-pointer border-2 ${
                    mainImage === img
                      ? "border-amber-500 shadow-md"
                      : "border-transparent hover:border-slate-300"
                  } transition-all duration-200`}
                  onClick={() => setMainImage(img)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/100x150?text=Img";
                  }}
                />
              ))}
            </div>
          )}
        </div>

  {/* Info Section */}
  <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-amber-600 dark:text-amber-500">
              {book.title}
            </h1>
            <p className="text-lg italic text-slate-600 dark:text-slate-300 mt-1">
              {book.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-6 border-b pb-4 border-slate-200 dark:border-slate-700">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              ₹{Number(book.price).toLocaleString("en-IN")}
            </div>
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium capitalize">
              {book.genre}
            </span>
          </div>

          <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
            {book.description}
          </p>

          <ul className="bg-slate-100 dark:bg-slate-800 rounded-lg p-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li>
              <strong>ISBN:</strong> {book.isbn}
            </li>
            <li>
              <strong>Published:</strong> {book.pubDate}
            </li>
            <li>
              <strong>Pages:</strong> {book.pages}
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => addToCart(book)}
              className="px-6 py-3 w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg shadow-md shadow-emerald-600/30 transition-all duration-300"
            >
              Add to Cart
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                showAlert(
                  "Buy Now Demo",
                  "Direct purchase needs integration with Razorpay or Stripe."
                )
              }
              className="px-6 py-3 w-full sm:w-auto border border-slate-300 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Buy Now
            </motion.button>

            <motion.button
              whileHover={{ x: -5 }}
              onClick={() => navigate(-1)}
              className="px-6 py-3 w-full sm:w-auto text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
            >
              ← Back
            </motion.button>
            {/* External retailer buttons */}
            <div className="w-full sm:w-auto flex items-center gap-2">
              {book.amazonLink && (
                <a href={book.amazonLink} target="_blank" rel="noreferrer" className="px-4 py-3 bg-yellow-500 text-white rounded-lg text-sm font-medium">Buy on Amazon</a>
              )}
              {book.flipkartLink && (
                <a href={book.flipkartLink} target="_blank" rel="noreferrer" className="px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium">Buy on Flipkart</a>
              )}
              {book.milaanLink && (
                <a href={book.milaanLink} target="_blank" rel="noreferrer" className="px-4 py-3 bg-slate-800 text-white rounded-lg text-sm font-medium">Buy at Milaan</a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-700">
        <h3 className="font-serif text-3xl mb-6 text-slate-800 dark:text-white">
          Reader Reviews ({reviews.length})
        </h3>
        <div className="space-y-6">
          <AnimatePresence>
            {reviews.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-lg text-slate-900 dark:text-white">
                    {r.user}
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < r.rating
                            ? "text-amber-500"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.46a1 1 0 00.952-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {r.comment}
                </p>
                <div className="text-xs text-right text-slate-500 mt-2">
                  Reviewed on {r.date}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() =>
            showAlert(
              "Review Submission",
              "Implement backend form to submit reviews."
            )
          }
          className="mt-6 px-5 py-2.5 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:brightness-110 transition"
        >
          Write a Review
        </motion.button>
      </section>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-700">
          <h3 className="font-serif text-3xl mb-8 text-slate-800 dark:text-white">
            You Might Also Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedBooks.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
              >
                <BookCard book={b} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-700">
        <Newsletter showAlert={showAlert} />
      </div>
    </motion.main>
  );
}
