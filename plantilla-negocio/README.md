# Plantilla de negocio local (scroll animado)

Una web de scroll animado completa por negocio, a partir de **un archivo JSON**. Sin claves, sin kie.ai, sin fotos: el arte se genera con los colores del negocio.

## Crear una demo nueva (5 minutos)
1. Copia `negocios/demo-estetica.json` a `negocios/mi-negocio.json`.
2. Cambia nombre, textos, servicios, colores (`fondo`, `acento`, `a`, `b`, `c`), `motivo` y el `whatsapp` (`34` + número, sin espacios).
3. `node build.mjs negocios/mi-negocio.json`  →  sale en `dist/mi-negocio/` (≈ 0,6 MB, 16 s).
4. Pruébala: `node -e "require('http').createServer((q,r)=>{let f='dist'+q.url.split('?')[0];if(f.endsWith('/'))f+='index.html';require('fs').createReadStream(f).on('error',()=>r.end()).pipe(r)}).listen(4501)"` y abre `http://localhost:4501/mi-negocio/`.
5. `node build.mjs --all` regenera todas y la galería `dist/index.html`.

Requisitos: Node 20+, ffmpeg completo, `npm i playwright-core` y Chrome (o `SCROLLCRAFT_CHROME`). Con `SIN_ARTE=1` no se regenera el arte (solo el HTML, 1 s).

## Qué personalizar
| Campo | Efecto |
|---|---|
| `motivo` | `petalos`, `ondas`, `anillos`, `lineas`: forma del arte |
| `colores` | paleta completa de la web y del arte |
| `fuentes` | par tipográfico (Google Fonts) |
| `mensaje` | 2 a 4 frases que van apareciendo al hacer scroll |
| `servicios` | tarjetas del carrusel horizontal (una imagen por servicio) |
| `numeros`, `pasos` | cifras animadas y cómo funciona |

## Fotos reales
El arte generado vale para enseñar la idea. Para la web final, sustituye `dist/<negocio>/servicio-N.webp` y `poster*.webp` por fotos del cliente. Un vídeo real se codifica con `scripts/encode.sh` del skill y reemplaza `hero.mp4` y `hero-m.mp4`.

## Rendimiento
Todo el movimiento va por `transform` y `opacity`, con un único bucle de animación. Sin librerías, ≈ 0,6 MB por web, fuente cargada con `display=swap`, imágenes con carga diferida. Respeta `prefers-reduced-motion`.

## Antes de enseñarla
Los datos de los JSON de ejemplo son inventados (teléfono `34600000000`, cifras con «(ejemplo)»). Sustitúyelos por los reales del cliente y no inventes cifras ni reseñas.
