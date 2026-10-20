# Reglas para sesiones que construyen demos web de comercios locales (Málaga)

Esta carpeta es una plantilla pública. NO guardes aquí datos reales de clientes (teléfonos, conversaciones, facturas, fotos privadas): la demo de un cliente se construye en una copia local o se entrega en el informe de la sesión, nunca en commits a este repositorio.

## Cómo trabajar (ahorrar créditos sin bajar calidad)
1. Lee solo `plantilla-negocio/README.md` y el JSON del sector más parecido en `plantilla-negocio/negocios/` (estética, podología, estudio, academia, floristería). No explores el resto.
2. Copia ese JSON a `negocios/<slug>.json`, cambia textos, colores, servicios y WhatsApp, y ejecuta `node build.mjs negocios/<slug>.json` (unos 20 s, ~0,5 MB). Con `SIN_ARTE=1` solo regenera el HTML.
3. Requisitos: Node 20+, ffmpeg completo, `npm i playwright-core` y Chrome (`SCROLLCRAFT_CHROME` con su ruta).
4. Si hay fotos reales del cliente, sustituye `dist/<slug>/servicio-N.webp` y `poster*.webp`. Conviértelas a WebP (ancho máximo 1600 px) en una sola pasada.
5. Verifica UNA vez al final: captura móvil (375 px) y de escritorio, sin desplazamiento horizontal y sin errores de consola. No repitas capturas tras cada cambio.

## Diseño (editorial, de revista, no «tienda corriente»)
- Títulos en serif grande y elegante (Fraunces, Playfair Display, Cormorant Garamond); cuerpo en sans limpia (Inter, Plus Jakarta Sans). Contraste tipográfico claro.
- Nada de blanco puro: fondos orgánicos o lavados (`#FBF8F3`, `#F4F5F0`, `#121013`) o fondos oscuros con acento suave. Mucho aire entre secciones.
- El producto manda: imágenes con bordes redondeados, sombras suaves, composición asimétrica.
- El botón de WhatsApp no es un botón verde estándar: píldora oscura minimalista, mayúsculas espaciadas y un microicono discreto.
- Movimiento solo con `transform` y `opacity`; respetar `prefers-reduced-motion`.

## Texto
- Lenguaje llano, sin jerga técnica (nada de «LCP», «PageSpeed», «viewport» en lo que lee el cliente).
- Datos verificables o marcados «(ejemplo)». No inventes cifras, reseñas ni premios de un cliente real.
- Una mejora visual concreta como opinión, ligada a lo que vende el negocio, sin afirmar nada que no se haya visto.

## Entrega
Deja la demo en `dist/<slug>/` en tu copia, no publiques ni hagas push, y termina con un informe corto: qué se hizo, qué falta (fotos reales, precio, dominio) y cómo verlo.
