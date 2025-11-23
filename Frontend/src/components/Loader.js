// import React from 'react';

// export default function Loader(){
//   return (
//     <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 dark:bg-slate-900/90">
//       <div className="flex flex-col items-center gap-4">
//         <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
//         <div className="text-slate-800 dark:text-slate-100 font-medium">Loading…</div>
//       </div>
//     </div>
//   );
// }
// // 
import React from 'react';

export default function Loader() {
  return (
    <>
      {/* BOOK LOADER CSS */}
      <style>{`
        .book {
          position: relative;
          top: 0;
          margin: 0 auto;
          width: 100px;
          height: 60px;
          border: 5px solid #ecf0f1;
        }

        .book__page {
          position: absolute;
          left: 50%;
          top: -5px;
          width: 50px;
          height: 60px;
          background: #3498db;
          border-top: 5px solid #ecf0f1;
          border-bottom: 5px solid #ecf0f1;
          border-right: 5px solid #ecf0f1;
          transform-origin: 0% 50%;
          animation: flip 1.2s infinite linear forwards;
        }

        .book__page:nth-child(1) {
          z-index: -1;
          animation-delay: 1.4s;
        }
        .book__page:nth-child(2) {
          z-index: -2;
          animation-delay: 2.8s;
        }
        .book__page:nth-child(3) {
          z-index: -3;
          animation-delay: 4.2s;
        }

        @keyframes flip {
          0% {
            transform: perspective(600px) rotateY(0deg);
          }
          20% {
            background: #2d7cb5;
          }
          29.9% {
            background: #2d7cb5;
          }
          30% {
            transform: perspective(200px) rotateY(-90deg);
            background: #3498db;
          }
          54.999% {
            opacity: 1;
          }
          55% {
            opacity: 0;
          }
          60% {
            transform: perspective(200px) rotateY(-180deg);
            background: #3498db;
          }
          100% {
            transform: perspective(200px) rotateY(-180deg);
            background: #3498db;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 dark:bg-slate-900/90">
        <div className="flex flex-col items-center gap-4">
          
          {/* BOOK LOADER */}
          <div className="book">
            <div className="book__page"></div>
            <div className="book__page"></div>
            <div className="book__page"></div>
          </div>

          {/* TEXT */}
          <div className="text-slate-800 dark:text-slate-100 font-medium mt-4">
            Loading…
          </div>
        </div>
      </div>
    </>
  );
}
