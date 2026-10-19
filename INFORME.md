# Evaluación de scroll-craft para demos de comercios locales

Evaluación sin claves de API, sin kie.ai y sin datos de clientes. Nada publicado ni enviado.

## 1. Revisión de seguridad (engine/ y scripts/)
Sin hallazgos graves. No hay `eval`, `new Function`, `sendBeacon`, WebSocket ni telemetría.

| Qué | Dónde | Valoración |
|---|---|---|
| `fetch(src)` del vídeo de la propia página | engine/scrollcraft.js:660 | Normal (carga el clip como blob) |
| Llamadas a api.kie.ai y kieai.redpandaai.co (subida base64 de imágenes, crear tarea, consultar crédito, descargar) | scripts/kie.mjs:26-27, 69, 83, 96, 118, 139 | Es el único destino externo. Solo corre si lo invocas y hay clave. Sube tus imágenes a un tercero. |
| Lee `KIE_AI_API_KEY` del entorno o de un `.env` subiendo hasta 8 carpetas | kie.mjs:48-55; doctor.mjs:128-132 | Lectura fuera del proyecto limitada a ese `.env`. doctor solo comprueba que existe, no la imprime. |
| `execFileSync` / `spawnSync` (ffmpeg, kie.mjs probe) con argumentos en array, sin shell | doctor.mjs:33, 175; shoot.mjs:647-648 | Sin inyección de comandos evidente |
| Lee `HOME`/`USERPROFILE`/`LOCALAPPDATA` y variables `SCROLLCRAFT_*` para localizar ffmpeg y Chrome | doctor.mjs:46-111; shoot.mjs:46-52, 632-642; workspace.mjs:43 | Solo rutas de herramientas |
| Servidor HTTP local con control contra salida de la raíz; por defecto 127.0.0.1 | serve.mjs:28-65 | Correcto. `--lan` abre 0.0.0.0 y lo avisa. |
| `encode.sh` solo llama a ffmpeg | scripts/encode.sh | Sin red |

Riesgo real: se instruye al agente con ~180 KB de Markdown (SKILL.md más referencias). No encontré instrucciones maliciosas, pero conviene leerlas antes de dar permisos amplios.

## 2. doctor.mjs y workspace.mjs --ensure
- Node v22.22 OK. ffmpeg completo OK (564 filtros, libwebp presente).
- Faltan (opcionales, solo para verificar): `playwright-core` y Chrome. Playwright se instaló con `npm i playwright-core` (2 s) y usé el Chromium ya presente en /opt/pw-browsers.
- Sin `KIE_AI_API_KEY` (solo hace falta para generar imágenes).
- `workspace --ensure` creó `scrollcraft/` en la raíz del repo (builds + FINGERPRINTS.md). Es una carpeta nueva sin seguimiento en git.

## 3. Demo «Demo Estética»
Ruta: `scrollcraft/builds/demo-estetica/index.html`. Capturas móviles en `shots/`.
- 3 secciones: hero con fondo en degradado, carrusel horizontal de 3 tratamientos, cierre con botón. Sin imágenes ni vídeo: degradados CSS y datos inventados. El repo no trae fotos ni vídeos libres reutilizables, solo capturas de sus ejemplos.
- Tiempo: unos 20 s de ejecución (copiar motor, escribir HTML, servir, capturar), más el tiempo de leer la plantilla y el motor.
- Pasos: 6 (workspace, copiar css/js, escribir HTML, servir, instalar playwright, capturar).
- Móvil (390x844): sin scroll horizontal, textos legibles, botón visible. Un único error de consola, un 404 (casi seguro el favicon). El diseño es correcto pero genérico. No usé vídeo, así que no medí el efecto principal (vídeo que avanza con el scroll).
- No ejecuté la verificación completa de shoot.mjs (contraste, scroll muerto). Solo capturas manuales.

## 4. Veredicto
- Para demos rápidas de comercios pequeños, solo compensa en su versión ligera: motor + `pin`/`pan`/`flow` con fotos propias del cliente, sin vídeo ni kie.ai. Funciona, pesa poco y es seguro.
- El flujo completo (entrevista, huella de unicidad, curva de sensaciones, vídeos generados, verificación) está pensado para webs premium. Es lento y gasta muchos créditos: el skill son ~45k tokens de instrucciones. No lo uses para cada demo.
- Coste: ligero, minutos y pocos créditos. Completo con vídeo, horas y créditos de IA más kie.ai de pago.
- Riesgos: dependencia de ffmpeg completo y Chrome; vídeos pesados en móvil; kie.ai sube tus imágenes a un tercero; cuidado con rutas absolutas o `.env` en carpetas superiores.
- Sí lo usaría para: estudios de grabación, academias creativas, estética de gama alta o clínicas que tengan buen material visual y presupuesto para una web que impresione.
- No lo usaría para: podología o negocios de barrio que solo necesitan teléfono, horario y reserva. Ahí una plantilla simple vende igual y cuesta mucho menos.
