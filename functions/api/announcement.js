import { publicAnnouncement } from "../banner.js";

export function onRequest(context) {
    return publicAnnouncement(context.request, context.env);
}
