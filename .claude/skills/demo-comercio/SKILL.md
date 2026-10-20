---
name: demo-comercio
description: Construir la demo web de un comercio local a partir de la plantilla de este repositorio (JSON por negocio, build en 20 s). Usar cuando se pida hacer la propuesta o demo de una tienda, floristería, clínica o academia.
---

# Demo de comercio con la plantilla

1. Elige el JSON de ejemplo más cercano en `plantilla-negocio/negocios/` (`demo-estetica`, `demo-podologia`, `demo-estudio`, `demo-academia`, `demo-floristeria`).
2. Cópialo a `negocios/<slug>.json`. Cambia: `nombre`, `eyebrow`, `ciudad`, `titular`, `sub`, `cta`, `whatsapp` (`34` + número), `direccion`, `horario`, `motivo` (`petalos`, `ondas`, `anillos`, `lineas`), `colores`, `mensaje` (2 a 4 frases), `servicios`, `numeros`, `pasos`. Quita las marcas «(ejemplo)» solo si el dato es real y verificado.
3. `node build.mjs negocios/<slug>.json` desde `plantilla-negocio/`. Chrome: variable `SCROLLCRAFT_CHROME`.
4. Fotos reales: sustituir `servicio-N.webp` y `poster*.webp` en `dist/<slug>/`. Convertir a WebP de una vez.
5. Comprobar en móvil (375 px): sin desplazamiento horizontal, sin errores de consola, botón de WhatsApp con el número correcto, titular legible.
6. Entregar con un informe corto. No subir datos del cliente a este repositorio público.

Reglas de diseño y de texto: ver `CLAUDE.md` de la raíz.
