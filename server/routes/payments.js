const express = require('express');
const router = express.Router();

// Create a Stripe Checkout Session when STRIPE_SECRET is configured
router.post('/create-checkout-session', async (req, res) => {
  const stripeSecret = process.env.STRIPE_SECRET;
  if(!stripeSecret) return res.status(501).json({ error: 'Stripe not configured on server' });
  const Stripe = require('stripe');
  const stripe = Stripe(stripeSecret);

  try{
    const { items, successUrl, cancelUrl } = req.body;
    // Map items to line_items
    const line_items = (items || []).map(i => ({ price_data: { currency: 'inr', product_data: { name: i.title }, unit_amount: Math.round((i.price||0) * 100) }, quantity: 1 }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: successUrl || (req.protocol + '://' + req.get('host') + '/order-success/{CHECKOUT_SESSION_ID}'),
      cancel_url: cancelUrl || (req.protocol + '://' + req.get('host') + '/checkout')
    });
    res.json({ url: session.url, id: session.id });
  }catch(err){
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
