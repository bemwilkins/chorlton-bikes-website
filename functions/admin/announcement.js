import { adminAnnouncement } from "../banner.js";

export function onRequest(context) {
    return adminAnnouncement(context.request, context.env);
}