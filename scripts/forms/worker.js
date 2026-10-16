import { adminAnnouncement, calendarAnnouncement, publicAnnouncement } from '../../functions/banner.js';
import { handleSignupRequest, reconcileRecentSignups } from './signup-core.js';

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

function redirectWww(request) {
  const url = new URL(request.url);
  if (url.hostname !== 'www.chorltonbikes.coop') return null;
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  if (url.pathname === '/admin' || url.pathname.startsWith('/admin/') || url.pathname.startsWith('/cdn-cgi/')) return null;
  url.hostname = 'chorltonbikes.coop';
  return Response.redirect(url.toString(), 301);
}

export default {
  async fetch(request, env) {
    const www = redirectWww(request);
    if (www) return www;
    const url = new URL(request.url);
    if (url.pathname === '/api/announcement') {
      return publicAnnouncement(request, env);
    }
    if (url.pathname === '/api/announcement.ics') {
      return calendarAnnouncement(request, env);
    }
    if (url.pathname === '/admin/session') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Not found', { status: 405 });
      }
      return Response.redirect(new URL('/admin/', request.url), 302);
    }
    if (url.pathname === '/admin/session/announcement') {
      return adminAnnouncement(request, env);
    }
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

  async scheduled(_event, env, ctx) {
    const liveTable = env.AIRTABLE_TABLE_ID === 'tblqgtpXroIv0cmZc';
    const liveKey = env.STRIPE_SECRET_KEY?.startsWith('sk_live_') || env.STRIPE_SECRET_KEY?.startsWith('rk_live_');
    if (liveTable && !liveKey) return;
    ctx.waitUntil(reconcileRecentSignups(env, Date.now()).catch((error) => {
      console.error(error);
    }));
  },
};
