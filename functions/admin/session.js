export function onRequest({ request }) {
    if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Not found", { status: 405 });
    }
    return Response.redirect(new URL("/admin/", request.url), 302);
}
