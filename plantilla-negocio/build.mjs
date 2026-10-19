#!/usr/bin/env node
/**
 * Genera una web de scroll animado para un negocio local a partir de un JSON.
 *   node build.mjs negocios/demo-estetica.json        -> dist/demo-estetica/
 *   node build.mjs --all                              -> todos los de negocios/
 * Sin claves, sin kie.ai, sin fotos: el arte (video de scroll + tarjetas) se genera
 * aqui mismo con colores del negocio. Sustituye por fotos reales cuando las haya.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE = fs.existsSync(path.join(HERE, "motor")) ? path.join(HERE, "motor") : path.resolve(HERE, "../plugins/nateherk-design/skills/scroll-craft/engine");
const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function load(name) {
  for (const base of [HERE, process.cwd(), "/tmp/pw"]) {
    try { return createRequire(path.join(base, "x.js"))(name); } catch {}
  }
  throw new Error(`Falta ${name}. Ejecuta: npm i playwright-core`);
}
const { chromium } = load("playwright-core");
const chrome = [process.env.SCROLLCRAFT_CHROME, "/opt/pw-browsers/chromium", "/usr/bin/chromium", "/usr/bin/google-chrome",
  "C:/Program Files/Google/Chrome/Application/chrome.exe"].find((p) => p && fs.existsSync(p));
const ffmpeg = process.env.SCROLLCRAFT_FFMPEG || "ffmpeg";
const ff = (args) => { const r = spawnSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", ...args]); if (r.status) throw new Error(r.stderr + ""); };

async function art(cfg, out) {
  const tmp = path.join(out, ".frames"); fs.mkdirSync(tmp, { recursive: true });
  const browser = await chromium.launch({ executablePath: chrome, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto("file://" + path.join(HERE, "art.html"));
  const save = async (file, w, h, t, seed) => {
    const url = await page.evaluate(([c, w, h, t, s]) => window.render(c, w, h, t, s), [cfg, w, h, t, seed]);
    fs.writeFileSync(file, Buffer.from(url.split(",")[1], "base64"));
  };
  // video de scroll: 2 tamanos (movil / escritorio)
  const N = 60;
  for (const [tag, w, h] of [["m", 540, 960], ["d", 1280, 720]]) {
    for (let i = 0; i < N; i++) await save(path.join(tmp, `${tag}${String(i).padStart(3, "0")}.png`), w, h, i / N, 3);
    ff(["-framerate", "24", "-i", path.join(tmp, `${tag}%03d.png`), "-an", "-c:v", "libx264", "-profile:v", "high", "-preset", "slow",
      "-crf", tag === "m" ? "27" : "26", "-g", "4", "-keyint_min", "4", "-sc_threshold", "0", "-pix_fmt", "yuv420p",
      "-movflags", "+faststart", path.join(out, tag === "m" ? "hero-m.mp4" : "hero.mp4")]);
    ff(["-i", path.join(tmp, `${tag}000.png`), "-quality", "82", path.join(out, tag === "m" ? "poster-m.webp" : "poster.webp")]);
  }
  // tarjetas de servicios (4:5) y fondo del cierre
  for (let i = 0; i < cfg.servicios.length; i++) {
    await save(path.join(tmp, `s${i}.png`), 640, 800, (i * 0.17 + 0.1) % 1, 11 + i * 5);
    ff(["-i", path.join(tmp, `s${i}.png`), "-quality", "80", path.join(out, `servicio-${i}.webp`)]);
  }
  await browser.close(); fs.rmSync(tmp, { recursive: true, force: true });
}

function html(c) {
  const k = c.colores, wa = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(c.mensajeWhatsapp || "Hola, quiero pedir cita")}`;
  const fonts = c.fuentes?.url ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${esc(c.fuentes.url)}">` : "";
  const servicios = c.servicios.map((s, i) => `
        <article class="card" data-sc-tilt="5">
          <div class="card__img"><img src="servicio-${i}.webp" width="640" height="800" alt="" loading="lazy" decoding="async"></div>
          <div class="card__txt"><h3>${esc(s.nombre)}</h3><p>${esc(s.desc)}</p><span class="price">${esc(s.precio)}</span></div>
        </article>`).join("");
  const numeros = c.numeros.map((n) => `
        <div class="stat"><b class="sc-display"><span data-sc-count="0 ${n.valor}">${n.valor}</span>${esc(n.sufijo || "")}</b><span>${esc(n.etiqueta)}</span></div>`).join("");
  const pasos = c.pasos.map((p, i) => `
        <li><span class="n">${i + 1}</span><div><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p></div></li>`).join("");
  const cues = c.mensaje.map((m, i, a) => `<p data-sc-cue="${(i * 0.3).toFixed(2)} ${(i * 0.3 + 0.38).toFixed(2)}${i === a.length - 1 ? "" : ""}">${esc(m)}</p>`).join("\n      ");
  const horario = c.horario.map((h) => `<li><span>${esc(h[0])}</span><span>${esc(h[1])}</span></li>`).join("");
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(c.nombre)} · ${esc(c.ciudad)}</title>
<meta name="description" content="${esc(c.sub)}">
<meta name="theme-color" content="${k.fondo}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='${encodeURIComponent(k.acento)}'/></svg>">
${fonts}
<link rel="preload" as="image" href="poster-m.webp" media="(max-width:860px)"><link rel="preload" as="image" href="poster.webp" media="(min-width:861px)">
<link rel="stylesheet" href="scrollcraft.css">
<style>
:root{--sc-canvas:${k.fondo};--sc-surface:${k.superficie};--sc-ink:${k.texto};--sc-ink-soft:${k.suave};--sc-accent:${k.acento};--sc-accent-ink:${k.acentoTexto};
 --sc-font-display:${c.fuentes?.display || "Georgia,serif"};--sc-font-text:${c.fuentes?.texto || "system-ui,sans-serif"}}
html{scroll-behavior:auto}
body{padding-bottom:env(safe-area-inset-bottom)}
.bar{position:fixed;inset:0 0 auto 0;z-index:70;display:flex;justify-content:space-between;align-items:center;padding:.9rem var(--sc-gutter);
 background:linear-gradient(to bottom,color-mix(in oklab,var(--sc-canvas) 82%,transparent),transparent)}
.brand{font:600 1.05rem var(--sc-font-display);letter-spacing:.01em;color:var(--sc-ink);text-decoration:none}
.btn{display:inline-flex;align-items:center;gap:.5rem;padding:.8rem 1.35rem;border-radius:999px;background:var(--sc-accent);color:var(--sc-accent-ink);
 font:600 .95rem var(--sc-font-text);text-decoration:none;box-shadow:var(--sc-e2),var(--sc-edge);transition:transform var(--sc-d-base) var(--sc-ease-out)}
.btn:hover{transform:translateY(-2px)}
.btn--ghost{background:transparent;color:var(--sc-ink);box-shadow:inset 0 0 0 1px var(--sc-hairline-strong)}
.hero-copy h1{max-width:13ch;margin:.4rem 0 1rem}
.hero-copy .sc-body{margin-bottom:1.6rem;font-size:var(--sc-t-lg);color:color-mix(in oklab,var(--sc-ink) 82%,transparent)}
.row{display:flex;flex-wrap:wrap;gap:.7rem}
.argument{display:grid;align-content:center;padding:0 var(--sc-gutter);background:radial-gradient(70% 60% at 80% 20%,color-mix(in oklab,var(--sc-accent) 14%,transparent),transparent 70%),var(--sc-surface)}
.argument p{position:absolute;left:var(--sc-gutter);right:var(--sc-gutter);margin:0;font:400 clamp(1.9rem,6.2vw,4.4rem)/1.08 var(--sc-font-display);letter-spacing:-.025em;max-width:20ch;top:50%;translate:0 -50%}
.argument p:last-child{color:var(--sc-accent)}
.rail{align-items:center;height:100%;gap:clamp(1rem,3vw,2.2rem);padding:0 var(--sc-gutter)}
.rail__lead{flex:0 0 min(78vw,26rem)}
.card{flex:0 0 min(74vw,22rem);border-radius:var(--sc-r-lg);background:var(--sc-surface);overflow:hidden;box-shadow:var(--sc-e3),var(--sc-edge)}
.card__img img{display:block;width:100%;aspect-ratio:4/5;object-fit:cover;max-height:46svh}
.card__txt{padding:1.1rem 1.2rem 1.3rem}.card h3{font:600 1.35rem var(--sc-font-display);margin:0 0 .3rem}
.card p{margin:0 0 .8rem;color:var(--sc-ink-soft);font-size:var(--sc-t-sm)}.price{font:600 .9rem var(--sc-font-text);color:var(--sc-accent)}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:2rem 1.5rem;margin-top:3rem}
.stat b{display:flex;align-items:baseline;white-space:nowrap;font-size:var(--sc-t-3xl);color:var(--sc-accent);line-height:1}.stat span:last-child{display:block;margin-top:.5rem;color:var(--sc-ink-soft)}
.steps{list-style:none;margin:3rem 0 0;padding:0;display:grid;gap:1.6rem;counter-reset:s}
.steps li{display:flex;gap:1.2rem;align-items:flex-start;padding-top:1.4rem;border-top:1px solid var(--sc-hairline)}
.steps .n{flex:none;width:2.6rem;height:2.6rem;border-radius:50%;display:grid;place-items:center;font:600 1rem var(--sc-font-text);background:var(--sc-accent);color:var(--sc-accent-ink)}
.steps h3{margin:0 0 .25rem;font:600 1.3rem var(--sc-font-display)}.steps p{margin:0;color:var(--sc-ink-soft)}
.close{display:grid;place-items:center;text-align:center;padding:0 var(--sc-gutter);background:radial-gradient(60% 50% at 50% 55%,color-mix(in oklab,var(--sc-accent) 20%,transparent),transparent 72%),var(--sc-canvas)}
.close h2{max-width:14ch;margin:0 auto 1.6rem}.close .row{justify-content:center}
.info{position:absolute;left:var(--sc-gutter);right:var(--sc-gutter);bottom:max(1.5rem,env(safe-area-inset-bottom));display:flex;flex-wrap:wrap;gap:1rem 3rem;justify-content:space-between;
 color:var(--sc-ink-soft);font-size:var(--sc-t-sm);text-align:left}
.info ul{list-style:none;margin:0;padding:0}.info li{display:flex;gap:1rem;justify-content:space-between}.info small{display:block;margin-top:.6rem;opacity:.7}
.dock{display:none}
.dock{transition:opacity .35s var(--sc-ease-out),transform .35s var(--sc-ease-out)}.dock.is-off{opacity:0;transform:translateY(120%);pointer-events:none}
@media(max-width:860px){
 .dock{position:fixed;z-index:80;left:.8rem;right:.8rem;bottom:max(.8rem,env(safe-area-inset-bottom));display:flex;gap:.6rem;padding:.5rem;border-radius:999px;
  background:color-mix(in oklab,var(--sc-surface) 88%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:var(--sc-e3),var(--sc-edge)}
 .dock .btn{flex:1;justify-content:center;padding:.85rem .5rem}.bar .btn{display:none}.info{bottom:5.6rem}
 .hero-copy{bottom:6.5rem!important}}
@media(prefers-reduced-motion:reduce){.sc-has-clip video{display:none}}
</style>
</head>
<body>
<span data-sc-progress></span>
<header class="bar"><a class="brand" href="#top">${esc(c.nombre)}</a><a class="btn" href="${wa}">${esc(c.cta)}</a></header>
<nav class="dock" aria-label="Contacto"><a class="btn" href="${wa}">${esc(c.cta)}</a><a class="btn btn--ghost" href="tel:+${c.whatsapp}">Llamar</a></nav>
<main id="top">

<section data-sc-act="scrub" data-sc-span="2.2" data-sc-dwell="0.3" data-sc-drift="${k.fondo}">
  <div data-sc-stage>
    <picture><source media="(max-width:860px)" srcset="poster-m.webp"><img class="sc-stage__poster" src="poster.webp" alt="" fetchpriority="high"></picture>
    <video data-sc-scrub data-sc-src="hero.mp4" data-sc-src-mobile="hero-m.mp4" muted playsinline preload="none"></video>
    <div class="sc-scrim sc-scrim--band" aria-hidden="true"></div>
    <div class="sc-copy sc-copy--lead hero-copy" data-sc-cue="0 0.85 0">
      <span class="sc-eyebrow">${esc(c.eyebrow)} · ${esc(c.ciudad)}</span>
      <h1 class="sc-display sc-display--xl" data-sc-kinetic="lines">${esc(c.titular)}</h1>
      <p class="sc-body">${esc(c.sub)}</p>
      <div class="row"><a class="btn" href="${wa}" data-sc-magnet="0.25">${esc(c.cta)}</a><a class="btn btn--ghost" href="#servicios">Ver servicios</a></div>
    </div>
  </div>
</section>

<section data-sc-act="pin" data-sc-span="${(c.mensaje.length * 1.05 + 0.6).toFixed(1)}" data-sc-drift="${k.superficie}">
  <div data-sc-stage class="argument">
      ${c.mensaje.map((m, i, a) => {
        const s = (i / a.length), e = ((i + 1) / a.length);
        return `<p data-sc-cue="${i ? (s - 0.04).toFixed(2) : "0"} ${i === a.length - 1 ? "" : (e - 0.02).toFixed(2)}">${esc(m)}</p>`.replace(/ "/, '"');
      }).join("\n      ")}
  </div>
</section>

<section id="servicios" data-sc-act="pan" data-sc-span="${(c.servicios.length * 0.9 + 1.4).toFixed(1)}" data-sc-drift="${k.fondo}">
  <div data-sc-stage>
    <div class="rail" data-sc-pan="0.08">
      <div class="rail__lead sc-stack"><span class="sc-eyebrow">${esc(c.serviciosEtiqueta || "Servicios")}</span>
        <h2 class="sc-display sc-display--lg">${esc(c.serviciosTitulo)}</h2><p class="sc-body">${esc(c.serviciosTexto)}</p></div>${servicios}
    </div>
  </div>
</section>

<section class="sc-section" data-sc-act="flow" data-sc-drift="${k.superficie}">
  <div class="sc-wrap">
    <div class="sc-stack" data-sc-in><span class="sc-eyebrow">${esc(c.numerosEtiqueta || "En cifras")}</span>
      <h2 class="sc-display sc-display--lg" data-sc-kinetic="lines">${esc(c.numerosTitulo)}</h2></div>
    <div class="stats" data-sc-in data-sc-stagger="90">${numeros}</div>
    <ol class="steps" data-sc-in data-sc-stagger="110">${pasos}</ol>
  </div>
</section>

<section id="contacto" data-sc-act="pin" data-sc-span="1.15" data-sc-drift="${k.fondo}">
  <div data-sc-stage class="close" data-sc-spotlight>
    <div>
      <h2 class="sc-display sc-display--lg" data-sc-cue="0.05" data-sc-kinetic="lines">${esc(c.cierreTitulo)}</h2>
      <div class="row"><a class="btn" href="${wa}" data-sc-magnet="0.26" data-sc-cue="0.05" data-sc-rise="0">${esc(c.cta)}</a>
      <a class="btn btn--ghost" href="tel:+${c.whatsapp}" data-sc-cue="0.05" data-sc-rise="0">Llamar</a></div>
    </div>
    <div class="info" data-sc-cue="0.05" data-sc-rise="0"><div><b>${esc(c.nombre)}</b><br>${esc(c.direccion)}<small>${esc(c.nota || "")}</small></div><ul>${horario}</ul></div>
  </div>
</section>
</main>
<script src="scrollcraft.js"></script>
<script>ScrollCraft.mount(document.body);(function(){var d=document.querySelector('.dock'),o=null;function u(){var off=scrollY<innerHeight*.9;if(off!==o){o=off;d.classList.toggle('is-off',off)}}addEventListener('scroll',u,{passive:true});u()})();</script>
</body>
</html>`;
}

const args = process.argv.slice(2);
const files = args[0] === "--all" ? fs.readdirSync(path.join(HERE, "negocios")).filter((f) => f.endsWith(".json")).map((f) => path.join(HERE, "negocios", f)) : args;
if (!files.length) { console.error("uso: node build.mjs negocios/<archivo>.json | --all"); process.exit(1); }
for (const f of files) {
  const t0 = Date.now(), cfg = JSON.parse(fs.readFileSync(f, "utf8"));
  const out = path.join(HERE, "dist", cfg.slug); fs.mkdirSync(out, { recursive: true });
  fs.copyFileSync(path.join(ENGINE, "scrollcraft.css"), path.join(out, "scrollcraft.css"));
  fs.copyFileSync(path.join(ENGINE, "scrollcraft.js"), path.join(out, "scrollcraft.js"));
  if (!process.env.SIN_ARTE || !fs.existsSync(path.join(out, "hero.mp4"))) await art(cfg, out);
  fs.writeFileSync(path.join(out, "index.html"), html(cfg));
  const size = fs.readdirSync(out).reduce((a, n) => a + fs.statSync(path.join(out, n)).size, 0);
  console.log(`${cfg.slug}: ${(size / 1e6).toFixed(1)} MB en ${((Date.now() - t0) / 1000).toFixed(0)} s -> dist/${cfg.slug}/`);
}

if (args[0] === "--all") {
  const items = files.map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
  const cards = items.map((c) => `<a class="g" href="${c.slug}/index.html" style="--a:${c.colores.acento};--b:${c.colores.fondo};--t:${c.colores.texto}"><span>${esc(c.eyebrow)}</span><b>${esc(c.nombre)}</b><i>${esc(c.titular)}</i></a>`).join("");
  fs.writeFileSync(path.join(HERE, "dist", "index.html"), `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Demos de comercios</title>
<style>:root{color-scheme:dark}body{margin:0;background:#0d0d10;color:#f2f2f4;font:16px/1.5 system-ui,sans-serif;padding:clamp(1.2rem,5vw,4rem)}h1{font-size:clamp(1.8rem,5vw,3rem);margin:0 0 .4rem;letter-spacing:-.02em}p{color:#9a9aa5;margin:0 0 2rem;max-width:44rem}
.grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))}.g{display:flex;flex-direction:column;gap:.35rem;min-height:11rem;padding:1.2rem;border-radius:18px;background:var(--b);color:var(--t);text-decoration:none;box-shadow:inset 0 0 0 1px #ffffff1f;justify-content:flex-end;transition:transform .25s cubic-bezier(.23,1,.32,1)}
.g:hover{transform:translateY(-3px)}.g span{font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:var(--a)}.g b{font-size:1.4rem}.g i{font-style:normal;opacity:.75}</style></head><body>
<h1>Demos de scroll animado</h1><p>Cuatro negocios inventados, una misma plantilla. Cada web sale de un archivo de datos. Ábrelas en el móvil.</p><div class="grid">${cards}</div></body></html>`);
}
