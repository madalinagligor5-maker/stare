// Stripe Subscription Integration Helpers

export const STRIPE_PRICES = {
  monthly: {
    id: 'price_monthly_id',
    name: 'Abonament Lunar',
    price: 34,
    currency: 'RON',
    interval: 'lună'
  },
  yearly: {
    id: 'price_yearly_id',
    name: 'Abonament Anual',
    price: 249,
    currency: 'RON',
    interval: 'an'
  },
  lifetime: {
    id: 'price_lifetime_id',
    name: 'Aces pe Viață (Lifetime)',
    price: 449,
    currency: 'RON',
    interval: 'o singură dată'
  }
};

export async function redirectToCheckout(priceId: string, userEmail: string) {
  console.log(`Redirecting to Stripe checkout for price: ${priceId} with email: ${userEmail}`);
  // In a full implementation, this calls an API route at /api/checkout and redirects to Stripe Checkout page.
  // For this MVP, we simulate success after a short delay and notify the app store:
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ url: '/dashboard?subscription_success=true' });
    }, 1000);
  });
}

export async function redirectToBillingPortal(userEmail: string) {
  console.log(`Redirecting to Stripe Customer Billing Portal for email: ${userEmail}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ url: '/settings?portal_success=true' });
    }, 1000);
  });
}
