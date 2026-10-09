import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function shell(title, canonical, body) {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="canonical" href="${canonical}">
    <link rel="icon" type="image/png" href="../assets/images/logo.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../redesign.css">
</head>
<body class="issue" id="top">
    <header class="nav">
        <div class="nav-inner">
            <a href="../index.html" aria-label="Chorlton Bikes, back to the homepage">
                <img class="logo" src="../assets/images/logo-white.png" alt="Chorlton Bikes">
            </a>
            <button class="nav-toggle" type="button" aria-expanded="false" aria-label="Menu">
                <span></span>
            </button>
            <ul class="nav-links">
                <li><a href="../index.html#work">What we do</a></li>
                <li><a href="../index.html#book">Book a delivery</a></li>
                <li><a href="../index.html#road">On the road</a></li>
                <li><a href="../index.html#films">Films</a></li>
                <li><a href="index.html">Newsletters</a></li>
                <li><a href="../index.html#panel-friend">Donate</a></li>
                <li><a class="nav-join" href="../index.html#panel-member">Join — £1</a></li>
            </ul>
        </div>
    </header>
    <main>
${body.trim()}
    </main>
    <footer class="footer">
        <div class="wrap footer-grid">
            <div>
                <h2>Visit</h2>
                <p>Boiler House, 9 Wilcock Street<br>Moss Side, Manchester, M16 7DA</p>
                <p>Monday to Saturday, 9am–5pm</p>
                <p><a href="https://maps.app.goo.gl/LZXcpTXvTtkWwr8o9" target="_blank" rel="noopener noreferrer">Map</a></p>
            </div>
            <div>
                <h2>Talk to us</h2>
                <p><a href="mailto:hello@chorltonbikes.coop">hello@chorltonbikes.coop</a></p>
                <p><a href="tel:+447561737986">07561 737986</a></p>
                <p><a href="https://wa.me/447561737986" target="_blank" rel="noopener noreferrer">WhatsApp</a></p>
            </div>
            <div>
                <h2>Follow</h2>
                <p><a href="https://www.instagram.com/chorltonbikes" target="_blank" rel="noopener noreferrer">Instagram</a></p>
                <p><a href="https://www.facebook.com/chorltonbikedeliveries/" target="_blank" rel="noopener noreferrer">Facebook</a></p>
            </div>
            <div>
                <img class="footer-logo" src="../assets/images/real-living-wage-logo.webp" alt="Real Living Wage employer">
            </div>
        </div>
        <div class="wrap footer-base">
            <p>© 2026 Chorlton Bikes Community Benefit Society. <a href="../privacy-policy.html">Privacy</a></p>
        </div>
    </footer>
    <script src="../redesign.js"></script>
</body>
</html>
`;
}

const dir = path.join(repoRoot, 'newsletter');
const names = (await fs.readdir(dir)).filter((name) => /^\d{4}-\d{2}\.html$/.test(name));
for (const name of names) {
  const filePath = path.join(dir, name);
  const html = await fs.readFile(filePath, 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  const start = html.indexOf('<div class="newsletter-hello-block">');
  const end = html.indexOf('<footer');
  if (!title || !canonical || start < 0 || end < 0) {
    throw new Error(`Could not restyle ${name}`);
  }
  await fs.writeFile(filePath, shell(title, canonical, html.slice(start, end)));
  console.log(`Restyled ${name}`);
}
