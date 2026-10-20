# DESIGN.md: sistema de diseño de las demos de comercios

Léelo antes de diseñar. Es propio y libre de licencias de terceros. Si algo choca con el `CLAUDE.md`, manda el `CLAUDE.md`.

## Principios
1. Editorial, de revista: una idea fuerte por pantalla, mucho aire, el producto como protagonista.
2. Original antes que correcto: nada de rejilla de productos genérica, cabecera con carrusel ni «sobre nosotros» de plantilla.
3. El movimiento cuenta algo (apertura, mitad, salida de cada escena); no es adorno.
4. Rápido y legible en móvil primero (375 px).

## Color (tokens)
Define siempre variables CSS y úsalas, nunca colores sueltos.
- `--fondo`: crema cálido (`#FBF8F3`, `#F4F5F0`) o muy oscuro (`#121013`). Nunca blanco puro `#FFFFFF`.
- `--superficie`: un tono más claro u oscuro que el fondo, para tarjetas.
- `--texto` y `--suave`: texto principal y secundario con contraste mínimo de 4,5:1 sobre su fondo.
- `--acento`: un único color de marca (sacado del logo o de las fotos). `--acento-texto`: el texto sobre ese acento.
- Máximo cinco tonos en total, más uno de apoyo para detalles dorados o metálicos si la marca lo pide.

## Tipografía
- Titulares: serif elegante (Fraunces, Playfair Display, Cormorant Garamond). Tamaño fluido, por ejemplo `clamp(2.6rem, 8vw, 6rem)`; interlineado 1,0 a 1,1; como máximo 2 o 3 líneas en móvil.
- Cuerpo: sans limpia (Inter, Plus Jakarta Sans), 16 a 18 px, interlineado 1,5 a 1,6, líneas de 45 a 70 caracteres.
- Etiquetas y botones: mayúsculas con `letter-spacing` de 0,12 a 0,2 em, 12 a 13 px, peso 600.
- Contraste extremo entre titular y cuerpo: ese es el sello visual.

## Espaciado y forma
- Rejilla base de 8 px. Secciones separadas por 96 a 160 px en escritorio y 64 a 96 px en móvil.
- Bordes redondeados generosos (`24px` a `32px` en imágenes y tarjetas; píldoras en botones).
- Sombras suaves y largas (`0 20px 60px rgba(0,0,0,.18)`); nunca sombras duras.

## Componentes
- **Botón principal (WhatsApp):** píldora oscura minimalista, texto en mayúsculas espaciadas y microicono de WhatsApp discreto. Nada de verde estándar. Altura táctil de al menos 48 px. Abre `wa.me` con un mensaje ya escrito que mencione lo que se pide.
- **Botón secundario:** contorno fino, mismo tamaño y radio.
- **Tarjeta de producto:** imagen grande con radio, nombre, una línea de descripción y acción. Sin precios inventados.
- **Carrusel horizontal:** desliza con el dedo, con borde de la siguiente tarjeta visible para invitar a seguir.
- **Cabecera:** logo o nombre a la izquierda y una sola acción a la derecha. Sin menús largos.
- **Pie:** dirección, horario, redes y WhatsApp.

## Movimiento
- Solo `transform` y `opacity`. Duraciones de 250 a 700 ms; curvas suaves de salida (`cubic-bezier(.22,1,.36,1)`).
- Cada escena tiene un estado de apertura, uno de mitad y uno de salida.
- Planos de profundidad con velocidades distintas (parallax suave), sin marear.
- Microinteracciones en botones y tarjetas (elevación o desplazamiento de pocos píxeles).
- `prefers-reduced-motion`: versión estática correcta, no solo «sin animación».

## Rendimiento y accesibilidad
- Primera imagen visible en menos de 2,5 s en móvil; página por debajo de unos 3 MB con fotos en WebP (ancho máximo 1600 px).
- Imágenes con `alt` descriptivo y carga diferida salvo la primera.
- Contraste, foco visible en teclado, botones de al menos 48 px.
- Sin desplazamiento horizontal ni errores de consola.

## Texto
Lenguaje llano y cercano, sin jerga técnica. Solo datos verificables. Una propuesta visual concreta como opinión, ligada a lo que vende el negocio.

## Referencias de inspiración (gratuitas de consultar)
The Component Gallery (component.gallery) para estructura de componentes. Úsalas para pensar, no para copiar diseños de otros.
