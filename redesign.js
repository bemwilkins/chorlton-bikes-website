/* Homepage behaviour for the redesign/on-the-move preview.
   Stories and films are edited in index.html.
   Set data-video to an mp4 on this site, or a YouTube, Vimeo, or Instagram
   reel URL, to play it in the page. With no data-video, the card's link is followed. */
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
        measureHead();
    });

    const announce = document.querySelector(".announce");
    if (announce) {
        const until = announce.dataset.until;
        const today = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Europe/London",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).format(new Date());
        if (!until || today >= until) announce.remove();
    }

    function measureHead() {
        const head = document.querySelector(".nav");
        if (head) document.documentElement.style.setProperty("--head-h", head.offsetHeight + "px");
    }
    measureHead();
    window.addEventListener("resize", measureHead);

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

    function contactRow(subject, message, label) {
        const row = document.createElement("div");
        row.className = "sheet-contact";
        const mail = document.createElement("a");
        mail.className = "btn btn-green";
        mail.href = "mailto:hello@chorltonbikes.coop?subject=" + encodeURIComponent(subject);
        mail.textContent = label || "Get in touch";
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
            const label = card.dataset.lane === "commercial" ? "Enquire about this" : "Get in touch";
            wrap.append(copy, contactRow(card.dataset.subject || "Hello", card.dataset.wa || "Hi, I'd like to get in touch about Chorlton Bikes", label));
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
        dialog.querySelectorAll("iframe, video").forEach((el) => {
            if (el.tagName === "VIDEO") {
                el.pause();
                el.removeAttribute("src");
                el.load();
            }
            el.remove();
        });
    });

    function embedUrl(url) {
        try {
            const parsed = new URL(url);
            const host = parsed.hostname.replace(/^www\./, "");
            if (host === "youtu.be") {
                const id = parsed.pathname.slice(1).split("/")[0];
                if (id) return { src: "https://www.youtube-nocookie.com/embed/" + id, portrait: false };
            }
            if (host === "youtube.com" || host === "m.youtube.com") {
                const id = parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop();
                if (id && id !== "watch") return { src: "https://www.youtube-nocookie.com/embed/" + id, portrait: false };
            }
            if (host === "vimeo.com") {
                const id = parsed.pathname.split("/").filter(Boolean).pop();
                if (id) return { src: "https://player.vimeo.com/video/" + id, portrait: false };
            }
            if (host === "instagram.com") {
                const parts = parsed.pathname.split("/").filter(Boolean);
                const kind = parts[0];
                const id = parts[1];
                if ((kind === "reel" || kind === "p" || kind === "tv") && id) {
                    return { src: "https://www.instagram.com/" + kind + "/" + id + "/embed", portrait: true };
                }
            }
        } catch (error) {
            return null;
        }
        return null;
    }

    function fileVideo(url) {
        if (!url || !/\.(mp4|webm)(\?|$)/i.test(url)) return null;
        return url;
    }

    document.querySelectorAll(".film").forEach((film) => {
        film.addEventListener("click", (event) => {
            const src = film.dataset.video || "";
            const file = fileVideo(src);
            const embed = file ? null : embedUrl(src);
            if ((!file && !embed) || !dialog) return;
            event.preventDefault();
            const caption = document.createElement("p");
            caption.textContent = film.querySelector("figcaption p")?.textContent || "";
            const wrap = document.createElement("div");
            if (file) {
                const video = document.createElement("video");
                video.className = "sheet-video";
                video.controls = true;
                video.autoplay = true;
                video.playsInline = true;
                video.preload = "metadata";
                video.src = file;
                const poster = film.querySelector("img")?.getAttribute("src");
                if (poster) video.poster = poster;
                video.title = film.querySelector("h3")?.textContent || "Film";
                wrap.append(video, caption);
            } else {
                const frame = document.createElement("iframe");
                frame.className = embed.portrait ? "sheet-frame is-portrait" : "sheet-frame";
                frame.src = embed.src;
                frame.title = film.querySelector("h3")?.textContent || "Film";
                frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
                frame.allowFullscreen = true;
                wrap.append(frame, caption);
            }
            openSheet(wrap);
        });
    });

    const filmsMore = document.querySelector(".films-more");
    filmsMore?.addEventListener("click", () => {
        const open = filmsMore.getAttribute("aria-expanded") === "true";
        document.querySelectorAll(".film-later").forEach((film) => {
            film.hidden = open;
        });
        filmsMore.setAttribute("aria-expanded", open ? "false" : "true");
        filmsMore.textContent = open ? "More films" : "Fewer films";
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

    document.querySelectorAll(".story img").forEach((img) => {
        const fit = () => {
            if (!img.naturalWidth || img.classList.contains("is-fit")) return;
            const ratio = img.naturalWidth / img.naturalHeight;
            if (ratio > 1.55 || ratio < 0.62 || (ratio > 0.92 && flatGraphic(img))) {
                img.classList.add("is-fit");
            }
        };
        if (img.complete) fit();
        else img.addEventListener("load", fit);
    });

    function flatGraphic(img) {
        try {
            const canvas = document.createElement("canvas");
            const size = 24;
            canvas.width = size;
            canvas.height = size;
            const context = canvas.getContext("2d", { willReadFrequently: true });
            context.drawImage(img, 0, 0, size, size);
            const data = context.getImageData(0, 0, size, size).data;
            const spots = [[1, 1], [size - 2, 1], [1, size - 2], [size - 2, size - 2]];
            const samples = spots.map(([x, y]) => {
                const index = (y * size + x) * 4;
                return [data[index], data[index + 1], data[index + 2]];
            });
            const average = samples.reduce((sum, sample) => [sum[0] + sample[0], sum[1] + sample[1], sum[2] + sample[2]], [0, 0, 0]).map((value) => value / samples.length);
            const spread = samples.reduce((max, sample) => Math.max(max, Math.abs(sample[0] - average[0]), Math.abs(sample[1] - average[1]), Math.abs(sample[2] - average[2])), 0);
            return spread < 28;
        } catch {
            return false;
        }
    }

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
    if (reduced) {
        stats.forEach(runStat);
    } else if ("IntersectionObserver" in window) {
        const proof = document.querySelector(".proof");
        const seen = new IntersectionObserver((entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            stats.forEach(runStat);
            seen.disconnect();
        }, { threshold: 0.25 });
        if (proof) seen.observe(proof);
        else stats.forEach(runStat);
    } else {
        stats.forEach(runStat);
    }

    const arrivals = document.querySelectorAll(".arrive");
    if (reduced) {
        arrivals.forEach((el) => el.classList.add("is-in"));
    } else if ("IntersectionObserver" in window) {
        const arriving = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-in");
                arriving.unobserve(entry.target);
            });
        }, { threshold: 0.35 });
        arrivals.forEach((el) => arriving.observe(el));
    } else {
        arrivals.forEach((el) => el.classList.add("is-in"));
    }

    const route = document.querySelector(".route");
    const stops = [...document.querySelectorAll(".route-stop")];
    const sections = stops.map((stop) => document.querySelector(stop.getAttribute("href")));
    let ticking = false;

    function placeRoute() {
        ticking = false;
        if (!route) return;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        const ats = sections.map((section) => (
            section && max > 0 ? Math.min(0.96, Math.max(0.02, section.offsetTop / max)) : 0
        ));
        let current = -1;
        ats.forEach((at, index) => {
            if (progress + 0.02 >= at) current = index;
        });
        ats.forEach((at, index) => {
            stops[index].style.setProperty("--at", at.toFixed(4));
            stops[index].classList.toggle("is-passed", index < current);
            stops[index].classList.toggle("is-here", index === current);
            if (index === current) stops[index].setAttribute("aria-current", "true");
            else stops[index].removeAttribute("aria-current");
        });
        route.style.setProperty("--ride", progress.toFixed(4));
    }

    window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(placeRoute);
    }, { passive: true });
    window.addEventListener("resize", placeRoute);
    placeRoute();
})();
