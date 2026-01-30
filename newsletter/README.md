# Newsletter – January 2026

## Files

- **2026-01.html** – Web page for this newsletter. Deploy as usual; link: `https://chorltonbikes.coop/newsletter/2026-01.html`. Use this URL in the email body as “Read this newsletter on the website”.
- **2026-01-email.html** – Email body (HTML). For **Airtable**: copy from the first `<table>` to the last `</table>` and paste into the email body field. For **preview**: open this file in a browser.

## Images

Add these three images into `assets/images/newsletter/` (see that folder’s README):

- `bikes-for-refugees.jpeg`
- `long-bois.jpeg`
- `ali-s.jpeg`

Until they’re there and the site is deployed, the newsletter page and email will show broken images. Use the same filenames so the links in both the page and email HTML work.

## Testing the email

- **Airtable**: In your “Send email” automation, set the body to “HTML” and paste the table from `2026-01-email.html`. Send a test to your own address.
- **Gmail**: Gmail compose doesn’t accept pasted HTML. To test the design, either send via Airtable or send an email that only contains the link to the web version: `https://chorltonbikes.coop/newsletter/2026-01.html`.
