import { calendarIcs } from "../calendar.js";

const KEY = "schedule";
const STAFF_KEY = "staff";
const ACCESS_GROUP = "web-admin@chorltonbikes.coop";

export function londonToday(date = new Date()) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/London",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(date);
}

function cleanText(value, max) {
    return String(value ?? "")
        .replace(/[\u0000-\u001F]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max);
}

function cleanDate(value, label) {
    const text = cleanText(value, 10);
    if (!text) return "";
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (!match) throw new Error(`${label} needs a real date.`);
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        throw new Error(`${label} needs a real date.`);
    }
    return text;
}

export function cleanLink(value) {
    const href = cleanText(value, 500);
    if (!href) return "";
    if (/^mailto:[^\s<>"]+$/i.test(href)) return href;
    let url;
    try {
        url = new URL(href);
    } catch {
        throw new Error("The link needs to be a web address or an email link.");
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new Error("The link needs to be a web address or an email link.");
    }
    return url.toString();
}

function cleanTime(value, label) {
    const text = cleanText(value, 5);
    if (!text) return "";
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(text)) {
        throw new Error(`${label} needs a time.`);
    }
    return text;
}

function calendarFields(body) {
    const calendarDate = cleanDate(body?.calendarDate, "The event day");
    const calendarStart = cleanTime(body?.calendarStart, "The start time");
    const calendarEnd = cleanTime(body?.calendarEnd, "The end time");
    const calendarLocation = cleanText(body?.calendarLocation, 120);
    if (!calendarDate && !calendarStart && !calendarEnd && !calendarLocation) {
        return { calendarDate: "", calendarStart: "", calendarEnd: "", calendarLocation: "" };
    }
    if (!calendarDate || !calendarStart || !calendarEnd) {
        throw new Error("Add the event day, the start time and the end time, or clear Add to calendar.");
    }
    if (calendarStart >= calendarEnd) {
        throw new Error("The end time needs to be later than the start time.");
    }
    return { calendarDate, calendarStart, calendarEnd, calendarLocation };
}

function cleanId(value) {
    const id = cleanText(value, 80);
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(id)) {
        throw new Error("That message could not be found.");
    }
    return id;
}

export function formatRange(from, through) {
    const format = (iso) => {
        const [year, month, day] = iso.split("-").map(Number);
        return new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC"
        }).format(new Date(Date.UTC(year, month - 1, day)));
    };
    if (!from && !through) return "No dates";
    if (from && through && from !== through) return `${format(from)} – ${format(through)}`;
    return format(from || through);
}

function bannerName(banner) {
    return banner.title || banner.message.slice(0, 42) || "Another message";
}

export function rangesOverlap(a, b) {
    const startA = a.from || "0000-01-01";
    const endA = a.through || "9999-12-31";
    const startB = b.from || "0000-01-01";
    const endB = b.through || "9999-12-31";
    return startA <= endB && startB <= endA;
}

export function parseBanner(body, id = "") {
    const banner = {
        id: id || crypto.randomUUID(),
        enabled: true,
        title: cleanText(body?.title, 80),
        message: cleanText(body?.message, 280),
        linkLabel: cleanText(body?.linkLabel, 48),
        linkHref: cleanLink(body?.linkHref),
        from: cleanDate(body?.from, "The first day"),
        through: cleanDate(body?.through, "The last day"),
        ...calendarFields(body)
    };
    if (!banner.title && !banner.message) {
        throw new Error("Add the message.");
    }
    if (!banner.from || !banner.through) {
        throw new Error("Add the first day and the last day.");
    }
    if (banner.linkLabel && !banner.linkHref) {
        throw new Error("Add the link address, or clear the link text.");
    }
    if (banner.linkHref && !banner.linkLabel) {
        throw new Error("Add the link text, or clear the link address.");
    }
    if (banner.from > banner.through) {
        throw new Error("The last day needs to be the same as the first day, or later.");
    }
    return banner;
}

export function placeBanner(banners, candidate) {
    const clash = banners.find((item) => item.id !== candidate.id && rangesOverlap(item, candidate));
    if (clash) {
        throw new Error(
            `Those dates overlap “${bannerName(clash)}” (${formatRange(clash.from, clash.through)}). Only one message can show at a time.`
        );
    }
    return banners
        .filter((item) => item.id !== candidate.id)
        .concat(candidate)
        .sort((a, b) => a.from.localeCompare(b.from) || a.id.localeCompare(b.id));
}

export function activeAnnouncement(banner, today = londonToday()) {
    if (!banner?.enabled) return null;
    if (banner.from && today < banner.from) return null;
    if (banner.through && today > banner.through) return null;
    if (!banner.title && !banner.message) return null;
    return {
        title: banner.title,
        message: banner.message,
        linkLabel: banner.linkLabel,
        linkHref: banner.linkHref,
        calendar: Boolean(banner.calendarDate)
    };
}

export function calendarDownload(banner) {
    if (!banner?.calendarDate || !banner.calendarStart || !banner.calendarEnd) return null;
    const title = (banner.title || banner.message || "Chorlton Bikes").replace(/[.\s]+$/g, "");
    return calendarIcs({
        id: banner.id,
        title,
        message: banner.message || "",
        date: banner.calendarDate,
        start: banner.calendarStart,
        end: banner.calendarEnd,
        location: banner.calendarLocation || ""
    });
}

export function activeFromSchedule(banners, today = londonToday()) {
    const live = (banners || []).filter((banner) => activeAnnouncement(banner, today));
    live.sort((a, b) => b.from.localeCompare(a.from));
    return live[0] ? activeAnnouncement(live[0], today) : null;
}

function normalizeBanner(banner) {
    return {
        id: typeof banner?.id === "string" ? banner.id : "",
        enabled: Boolean(banner?.enabled),
        title: cleanText(banner?.title, 80),
        message: cleanText(banner?.message, 280),
        linkLabel: cleanText(banner?.linkLabel, 48),
        linkHref: typeof banner?.linkHref === "string" ? banner.linkHref : "",
        from: typeof banner?.from === "string" ? banner.from : "",
        through: typeof banner?.through === "string" ? banner.through : "",
        calendarDate: typeof banner?.calendarDate === "string" ? banner.calendarDate : "",
        calendarStart: typeof banner?.calendarStart === "string" ? banner.calendarStart : "",
        calendarEnd: typeof banner?.calendarEnd === "string" ? banner.calendarEnd : "",
        calendarLocation: cleanText(banner?.calendarLocation, 120),
        updatedBy: cleanText(banner?.updatedBy, 120),
        updatedAt: cleanText(banner?.updatedAt, 40)
    };
}

function asSchedule(raw) {
    if (!raw || typeof raw !== "object") return null;
    if (Array.isArray(raw.banners)) {
        return raw.banners.map(normalizeBanner).filter((banner) => banner.id);
    }
    if (raw.title || raw.message || raw.enabled) {
        const banner = normalizeBanner(raw);
        if (!banner.id) banner.id = "legacy";
        return [banner];
    }
    return null;
}

function json(status, body) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
        }
    });
}

let certs = null;
let certsAt = 0;

function bytes(value) {
    const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
    const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/") + pad);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function verifyAccess(request, env) {
    const team = env.ACCESS_TEAM_DOMAIN;
    const aud = env.ACCESS_AUD;
    if (!team || !aud) return { ok: false, reason: "Google login is not connected yet." };
    const token = request.headers.get("Cf-Access-Jwt-Assertion");
    if (!token) return { ok: false, reason: "Sign in with a Chorlton Bikes Google account." };
    const [head, payload, signature] = token.split(".");
    if (!head || !payload || !signature) return { ok: false, reason: "Sign in with a Chorlton Bikes Google account." };
    const header = JSON.parse(new TextDecoder().decode(bytes(head)));
    const claims = JSON.parse(new TextDecoder().decode(bytes(payload)));
    const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!audience.includes(aud)) return { ok: false, reason: "Sign in with a Chorlton Bikes Google account." };
    if (claims.iss !== `https://${team}`) return { ok: false, reason: "Sign in with a Chorlton Bikes Google account." };
    if (Number(claims.exp) * 1000 < Date.now()) return { ok: false, reason: "Sign in again." };
    const domain = env.ACCESS_EMAIL_DOMAIN || "chorltonbikes.coop";
    const email = String(claims.email || "");
    if (!email.toLowerCase().endsWith(`@${domain.toLowerCase()}`)) {
        return { ok: false, reason: "This area is for Chorlton Bikes staff." };
    }
    const name = cleanText(claims.name || claims.common_name || "", 80);
    if (Date.now() - certsAt > 60 * 60 * 1000) {
        const response = await fetch(`https://${team}/cdn-cgi/access/certs`);
        if (!response.ok) return { ok: false, reason: "Google login could not be checked." };
        certs = await response.json();
        certsAt = Date.now();
    }
    const jwk = certs?.keys?.find((key) => key.kid === header.kid);
    if (!jwk) return { ok: false, reason: "Sign in again." };
    const key = await crypto.subtle.importKey(
        "jwk",
        jwk,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"]
    );
    const signed = new TextEncoder().encode(`${head}.${payload}`);
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, bytes(signature), signed);
    if (!valid) return { ok: false, reason: "Sign in again." };
    return { ok: true, email, name };
}

function accessReady(env) {
    return Boolean(env.ACCESS_TEAM_DOMAIN && env.ACCESS_AUD);
}

function cleanPeople(raw) {
    const people = Array.isArray(raw?.people) ? raw.people : [];
    return people
        .map((person) => ({
            email: cleanText(person?.email, 120),
            name: cleanText(person?.name, 80),
            lastSeen: cleanText(person?.lastSeen, 40)
        }))
        .filter((person) => person.email.includes("@"));
}

async function rememberPerson(env, staff) {
    const current = cleanPeople(await env.BANNER.get(STAFF_KEY, "json"));
    const email = staff.email.toLowerCase();
    const previous = current.find((person) => person.email.toLowerCase() === email);
    const next = [
        {
            email: staff.email,
            name: staff.name || previous?.name || "",
            lastSeen: new Date().toISOString()
        },
        ...current.filter((person) => person.email.toLowerCase() !== email)
    ].slice(0, 50);
    await env.BANNER.put(STAFF_KEY, JSON.stringify({ people: next }));
    return next;
}

async function staffContext(env, staff) {
    let people = [];
    try {
        people = await rememberPerson(env, staff);
    } catch {
        people = cleanPeople(await env.BANNER.get(STAFF_KEY, "json").catch(() => null));
    }
    return {
        email: staff.email,
        name: staff.name || "",
        people,
        group: ACCESS_GROUP
    };
}

function sameOrigin(request) {
    const origin = request.headers.get("Origin");
    if (!origin) return true;
    return origin === new URL(request.url).origin;
}

async function loadSchedule(env) {
    const saved = asSchedule(await env.BANNER.get(KEY, "json"));
    if (saved) return { stored: true, banners: saved };
    const legacy = asSchedule(await env.BANNER.get("current", "json"));
    if (legacy) return { stored: true, banners: legacy };
    return { stored: false, banners: [] };
}

function scheduleResponse(banners, extra = {}) {
    return {
        configured: true,
        banners,
        announcement: activeFromSchedule(banners),
        ...extra
    };
}

export async function publicAnnouncement(request, env) {
    if (request.method !== "GET") return json(405, { error: "Not found" });
    if (!env.BANNER) return json(200, { announcement: null, configured: false });
    const { stored, banners } = await loadSchedule(env);
    if (!stored) return json(200, { announcement: null, configured: false });
    return json(200, {
        announcement: activeFromSchedule(banners),
        configured: true
    });
}

export async function calendarAnnouncement(request, env) {
    if (request.method !== "GET") return json(405, { error: "Not found" });
    const { banners } = env.BANNER ? await loadSchedule(env) : { banners: [] };
    const today = londonToday();
    const banner = (banners || [])
        .filter((item) => activeAnnouncement(item, today)?.calendar)
        .sort((a, b) => b.from.localeCompare(a.from))[0];
    const body = banner ? calendarDownload(banner) : "";
    if (!body) return new Response("Not found", { status: 404 });
    return new Response(body, {
        headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": "attachment; filename=\"chorlton-bikes.ics\"",
            "Cache-Control": "no-store"
        }
    });
}

export async function adminAnnouncement(request, env) {
    const writing = request.method === "POST" || request.method === "PUT" || request.method === "DELETE";
    if (!env.BANNER) {
        if (request.method === "GET") {
            return json(200, { banners: [], announcement: null, configured: false, store: false });
        }
        return json(503, { error: "Saving is ready once Google login and the banner store are connected." });
    }
    if (request.method !== "GET" && !writing) return json(405, { error: "Not found" });

    const { stored, banners } = await loadSchedule(env);
    if (request.method === "GET") {
        if (!accessReady(env)) {
            if (!stored) {
                return json(200, { banners: [], announcement: null, configured: false, store: true });
            }
            return json(401, { error: "Google login is not connected yet." });
        }
        const staff = await verifyAccess(request, env);
        if (!staff.ok) return json(401, { error: staff.reason });
        const context = await staffContext(env, staff);
        if (!stored) {
            return json(200, {
                banners: [],
                announcement: null,
                configured: false,
                store: true,
                ...context
            });
        }
        return json(200, scheduleResponse(banners, context));
    }
    if (!sameOrigin(request) || request.headers.get("X-Chorlton-Admin") !== "1") {
        return json(403, { error: "Open the admin page on this site to save." });
    }
    const staff = await verifyAccess(request, env);
    if (!staff.ok) return json(401, { error: staff.reason });

    let body;
    try {
        body = await request.json();
    } catch {
        return json(400, { error: "The form could not be read." });
    }

    try {
        let next = banners;
        if (request.method === "DELETE") {
            const id = cleanId(body?.id);
            if (!banners.some((item) => item.id === id)) throw new Error("That message could not be found.");
            next = banners.filter((item) => item.id !== id);
        } else {
            const existingId = request.method === "PUT" ? cleanId(body?.id) : "";
            if (existingId && !banners.some((item) => item.id === existingId)) {
                throw new Error("That message could not be found.");
            }
            const banner = parseBanner(body, existingId);
            banner.updatedBy = staff.email;
            banner.updatedAt = new Date().toISOString();
            next = placeBanner(banners, banner);
        }
        await env.BANNER.put(KEY, JSON.stringify({
            banners: next,
            updatedBy: staff.email,
            updatedAt: new Date().toISOString()
        }));
        const context = await staffContext(env, staff);
        return json(200, { ok: true, ...scheduleResponse(next, context) });
    } catch (error) {
        return json(400, { error: error.message || "Could not save the message." });
    }
}
