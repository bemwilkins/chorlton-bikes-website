import { handleSignupRequest } from './signup-core.js';

function pricesFromEnv(env) {
  return {
    membership: env.STRIPE_MEMBERSHIP_PRICE,
    monthly: {
      5: env.STRIPE_MONTHLY_5,
      10: env.STRIPE_MONTHLY_10,
      20: env.STRIPE_MONTHLY_20,
    },
    onceProduct: env.STRIPE_ONCE_PRODUCT,
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      const liveTable = env.AIRTABLE_TABLE_ID === 'tblqgtpXroIv0cmZc';
      const liveKey = env.STRIPE_SECRET_KEY?.startsWith('sk_live_') || env.STRIPE_SECRET_KEY?.startsWith('rk_live_');
      if (liveTable && !liveKey) {
        return new Response(JSON.stringify({ error: 'The live register needs the live Stripe key.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      }
      try {
        return await handleSignupRequest(request, { ...env, prices: pricesFromEnv(env) });
      } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message || 'Request failed' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      }
    }
    return env.ASSETS.fetch(request);
  },
};
