const LONDON_ZONE = [
    "BEGIN:VTIMEZONE",
    "TZID:Europe/London",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0000",
    "TZOFFSETTO:+0100",
    "TZNAME:BST",
    "DTSTART:19700329T010000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0000",
    "TZNAME:GMT",
    "DTSTART:19701025T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "END:STANDARD",
    "END:VTIMEZONE"
].join("\r\n");

function icsText(value) {
    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/\r\n|\n|\r/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
}

function lastSunday(year, month) {
    const last = new Date(Date.UTC(year, month, 0));
    last.setUTCDate(last.getUTCDate() - last.getUTCDay());
    return last.getUTCDate();
}

function londonOffset(date, time) {
    const [year, month, day] = String(date).split("-").map(Number);
    const [hour, minute] = String(time).split(":").map(Number);
    const key = month * 1e6 + day * 1e4 + hour * 100 + minute;
    const bstStart = 3 * 1e6 + lastSunday(year, 3) * 1e4 + 100;
    const bstEnd = 10 * 1e6 + lastSunday(year, 10) * 1e4 + 200;
    return key >= bstStart && key < bstEnd ? "+01:00" : "+00:00";
}

export function calendarLinks(event) {
    const title = event.title || "Chorlton Bikes";
    const date = String(event.date).replaceAll("-", "");
    const start = String(event.start).replace(":", "") + "00";
    const end = String(event.end).replace(":", "") + "00";
    const google = new URL("https://calendar.google.com/calendar/render");
    google.searchParams.set("action", "TEMPLATE");
    google.searchParams.set("text", title);
    google.searchParams.set("dates", `${date}T${start}/${date}T${end}`);
    google.searchParams.set("ctz", "Europe/London");
    if (event.location) google.searchParams.set("location", event.location);
    if (event.message) google.searchParams.set("details", event.message);
    const outlook = new URL("https://outlook.live.com/calendar/0/deeplink/compose");
    outlook.searchParams.set("path", "/calendar/action/compose");
    outlook.searchParams.set("rru", "addevent");
    outlook.searchParams.set("subject", title);
    outlook.searchParams.set("startdt", `${event.date}T${event.start}:00${londonOffset(event.date, event.start)}`);
    outlook.searchParams.set("enddt", `${event.date}T${event.end}:00${londonOffset(event.date, event.end)}`);
    if (event.location) outlook.searchParams.set("location", event.location);
    if (event.message) outlook.searchParams.set("body", event.message);
    return { google: google.toString(), outlook: outlook.toString() };
}

export function calendarIcs(event) {
    const date = String(event.date).replaceAll("-", "");
    const start = String(event.start).replace(":", "") + "00";
    const end = String(event.end).replace(":", "") + "00";
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Chorlton Bikes//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        LONDON_ZONE,
        "BEGIN:VEVENT",
        `UID:${event.id || date}@chorltonbikes.coop`,
        `DTSTAMP:${stamp}`,
        `DTSTART;TZID=Europe/London:${date}T${start}`,
        `DTEND;TZID=Europe/London:${date}T${end}`,
        `SUMMARY:${icsText(event.title || "Chorlton Bikes")}`,
        event.location ? `LOCATION:${icsText(event.location)}` : "",
        event.message ? `DESCRIPTION:${icsText(event.message)}` : "",
        "END:VEVENT",
        "END:VCALENDAR",
        ""
    ].filter(Boolean);
    return lines.join("\r\n");
}
