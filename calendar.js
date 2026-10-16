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
