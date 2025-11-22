Smoke Test Checklist

Prerequisites:
- Node.js installed (v16+ recommended)
- From project root: npm install

Start dev server:

```bash
# from project root
npm start
```

Visual verification steps (quick):

1. Home / Books
   - Open `/` and `/books`.
   - On mobile width (use browser device toolbar), book cards should not overflow and images should be proportionate.

2. Book Detail
   - Open a book detail page. The main image should scale, thumbnails appear below, and action buttons are accessible on mobile.

3. Cart Drawer
   - Add a book to cart. Open the cart drawer (floating button). On narrow widths the drawer should fill the screen and item images/qty controls should be readable.

4. Checkout
   - Go to `/checkout`. Try submitting without name/email/address — you should see a toast error rather than native alert.
   - Choose mock card payment and submit invalid card details — you should see a toast error.

5. Admin Orders
   - Login as admin (admin / secret123). Visit `/admin/orders`.
   - Click "View Queue" and then "Flush Queue" (confirm). You should see toasts for success/failure instead of alert().
   - Update an order status and delete an order — toasts should indicate result.

6. Toasts
   - Trigger some actions (add to cart, checkout errors, admin actions) and confirm toasts appear at bottom-right and auto-dismiss.

7. Responsive checks
   - For each page, test at 320px, 375px, 768px, 1024px and 1280px widths and confirm layout is usable.

If you see JS errors in the console, paste them here and I'll fix them.
