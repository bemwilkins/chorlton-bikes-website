/* Homepage behaviour for the redesign/on-the-move preview.
   Stories and films are edited in index.html.
   Set data-video="https://www.youtube.com/watch?v=…" or a Vimeo URL on a film
   card to play it in the page. With no data-video, the card's link is followed. */
(function () {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("js");

    const flag = document.querySelector(".preview-flag");
    if (flag && sessionStorage.getItem("cb-preview-dismissed") === "1") {
        flag.remove();
    }
    flag?.querySelector("button")?.addEventListener("click", () => {
        sessionStorage.setItem("cb-preview-dismissed", "1");
        flag.remove();
    });

    const toggle = document.querySelector(".nav-toggle");
    toggle?.addEventListener("click", () => {
        const open = document.body.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".nav-links a").forEach((link) => {
        link.addEventListener("click", () => {
            document.body.classList.remove("nav-open");
            toggle?.setAttribute("aria-expanded", "false");
        });
    });

    function showPath(name) {
        document.querySelectorAll(".panel").forEach((panel) => {
            panel.classList.toggle("is-active", panel.id === "panel-" + name);
        });
        document.querySelectorAll(".path").forEach((link) => {
            const on = link.dataset.path === name;
            link.classList.toggle("is-active", on);
            if (on) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
        });
    }

    document.addEventListener("click", (event) => {
        const link = event.target.closest("[data-path]");
        if (!link) return;
        event.preventDefault();
        showPath(link.dataset.path);
        if (!link.closest("#join")) {
            document.getElementById("join")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
        }
    });

    const hashPath = location.hash.replace("#panel-", "");
    if (document.getElementById("panel-" + hashPath)) showPath(hashPath);

    document.querySelectorAll(".filter").forEach((button) => {
        button.addEventListener("click", () => {
            const lane = button.dataset.lane;
            document.querySelectorAll(".filter").forEach((item) => {
                const on = item === button;
                item.classList.toggle("is-on", on);
                item.setAttribute("aria-pressed", on ? "true" : "false");
            });
            document.querySelectorAll(".job").forEach((job) => {
                job.hidden = lane !== "all" && job.dataset.lane !== lane;
            });
        });
    });

    const dialog = document.getElementById("sheet");
    const sheetBody = dialog?.querySelector(".sheet-body");

    function contactRow(subject, message) {
        const row = document.createElement("div");
        row.className = "sheet-contact";
        const mail = document.createElement("a");
        mail.className = "btn btn-green";
        mail.href = "mailto:hello@chorltonbikes.coop?subject=" + encodeURIComponent(subject);
        mail.textContent = "Email us";
        const whats = document.createElement("a");
        whats.className = "btn btn-line";
        whats.href = "https://wa.me/447561737986?text=" + encodeURIComponent(message);
        whats.target = "_blank";
        whats.rel = "noopener noreferrer";
        whats.textContent = "WhatsApp";
        row.append(mail, whats);
        return row;
    }

    function openSheet(node) {
        if (!dialog || !sheetBody) return;
        sheetBody.replaceChildren(node);
        dialog.showModal();
        dialog.querySelector(".sheet-close")?.focus();
    }

    document.addEventListener("click", (event) => {
        const opener = event.target.closest(".job-open, .person-open");
        if (!opener || !sheetBody) return;
        const card = opener.closest(".job, .person");
        const source = card?.querySelector(".job-copy, .person-copy");
        if (!source) return;
        const copy = source.cloneNode(true);
        copy.hidden = false;
        if (card.classList.contains("job")) {
            const wrap = document.createElement("div");
            wrap.append(copy, contactRow(card.dataset.subject || "Hello", card.dataset.wa || "Hi, I'd like to get in touch about Chorlton Bikes"));
            openSheet(wrap);
            return;
        }
        openSheet(copy);
    });

    dialog?.querySelector(".sheet-close")?.addEventListener("click", () => dialog.close());
    dialog?.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
    });
    dialog?.addEventListener("close", () => {
        dialog.querySelectorAll("iframe").forEach((frame) => frame.remove());
    });

    function embedUrl(url) {
        try {
            const parsed = new URL(url);
            const host = parsed.hostname.replace(/^www\./, "");
            if (host === "youtu.be") {
                return "https://www.youtube-nocookie.com/embed/" + parsed.pathname.slice(1);
            }
            if (host === "youtube.com" || host === "m.youtube.com") {
                const id = parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop();
                if (id) return "https://www.youtube-nocookie.com/embed/" + id;
            }
            if (host === "vimeo.com") {
                const id = parsed.pathname.split("/").filter(Boolean).pop();
                if (id) return "https://player.vimeo.com/video/" + id;
            }
        } catch (error) {
            return "";
        }
        return "";
    }

    document.querySelectorAll(".film").forEach((film) => {
        film.addEventListener("click", (event) => {
            const src = embedUrl(film.dataset.video || "");
            if (!src || !dialog) return;
            event.preventDefault();
            const frame = document.createElement("iframe");
            frame.className = "sheet-frame";
            frame.src = src;
            frame.title = film.querySelector("h3")?.textContent || "Film";
            frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            frame.allowFullscreen = true;
            const caption = document.createElement("p");
            caption.textContent = film.querySelector("figcaption p")?.textContent || "";
            const wrap = document.createElement("div");
            wrap.append(frame, caption);
            openSheet(wrap);
        });
    });

    const quotes = Array.from(document.querySelectorAll(".voice-quote"));
    let quoteIndex = Math.max(0, quotes.findIndex((quote) => quote.classList.contains("is-active")));
    function setQuote(next) {
        if (!quotes.length) return;
        quoteIndex = (next + quotes.length) % quotes.length;
        quotes.forEach((quote, index) => quote.classList.toggle("is-active", index === quoteIndex));
    }
    document.querySelectorAll("[data-quote]").forEach((button) => {
        button.addEventListener("click", () => setQuote(quoteIndex + Number(button.dataset.quote)));
    });
    const voice = document.querySelector(".voice");
    let quoteTimer = 0;
    function startQuotes() {
        if (reduced || quotes.length < 2) return;
        clearInterval(quoteTimer);
        quoteTimer = window.setInterval(() => setQuote(quoteIndex + 1), 9000);
    }
    voice?.addEventListener("mouseenter", () => clearInterval(quoteTimer));
    voice?.addEventListener("mouseleave", startQuotes);
    voice?.addEventListener("focusin", () => clearInterval(quoteTimer));
    voice?.addEventListener("focusout", startQuotes);
    startQuotes();

    const road = document.querySelector(".road");
    document.querySelectorAll("[data-nudge]").forEach((button) => {
        button.addEventListener("click", () => {
            road?.scrollBy({
                left: road.clientWidth * 0.8 * Number(button.dataset.nudge),
                behavior: reduced ? "auto" : "smooth",
            });
        });
    });

    const stats = document.querySelectorAll("[data-count]");
    function paintStat(el, value) {
        const suffix = el.dataset.suffix || "";
        el.textContent = Math.round(value).toLocaleString("en-GB") + suffix;
    }
    function runStat(el) {
        const target = Number(el.dataset.count);
        if (reduced || !target) {
            paintStat(el, target);
            return;
        }
        const start = performance.now();
        function tick(now) {
            const t = Math.min(1, (now - start) / 900);
            paintStat(el, target * (1 - Math.pow(1 - t, 3)));
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }
    if ("IntersectionObserver" in window) {
        const seen = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                runStat(entry.target);
                seen.unobserve(entry.target);
            });
        }, { threshold: 0.6 });
        stats.forEach((el) => seen.observe(el));
    } else {
        stats.forEach(runStat);
    }

    const bike = document.querySelector(".route");
    let ticking = false;
    function placeBike() {
        ticking = false;
        if (!bike) return;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? window.scrollY / max : 0;
        document.documentElement.style.setProperty("--ride", progress.toFixed(4));
        document.documentElement.style.setProperty("--spin", String(Math.round(window.scrollY / 3)));
    }
    window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(placeBike);
    }, { passive: true });
    placeBike();

    if (!("animationTimeline" in document.documentElement.style || CSS.supports?.("animation-timeline", "view()"))) {
        document.querySelectorAll(".reveal").forEach((el) => {
            el.style.opacity = "1";
            el.style.transform = "none";
        });
    }
})();
