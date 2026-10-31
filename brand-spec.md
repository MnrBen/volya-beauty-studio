# VOLYA Beauty Studio — brand spec

Referencia de marca para la web. Las imágenes originales viven en `imagenes/` y no se modifican; los recortes y tamaños web se generan en `img/` con `scripts/imagenes.sh`.

## Idea: «Al detalle»
Los trabajos de Olga en primer plano son los protagonistas, sobre marfil y arena cálidos con el negro y el dorado del logo como acentos. Sin fondos negros: el negro queda para el logo, el texto y los botones. Las fotos se descubren y «enfocan» al aparecer.

## Alcance (demo reducida)
1. Portada: muro de trabajos de Olga en columnas que se desplazan despacio, con el título superpuesto sobre un velo cálido.
2. Servicios, con la micropigmentación de labios destacada en un bloque arena.
3. Olga y 2–3 reseñas.
4. Contacto (dirección, horario, botones) y pie con el aviso legal.

La longitud en móvil ya no está limitada. Sin galería ni secciones extra.

## Resolución de las fotos
Los originales miden unos 700 px de ancho. En escritorio se muestran como mucho a ~430 px (portada, desde 764 px: nítida hasta densidad ≈1,8) y ~465 px (labios, nítida hasta ≈1,4). En pantallas Retina (densidad 2) se amplían ~1,4×. Para nitidez total en Retina harían falta los originales del móvil de Olga.

## Logo
- `imagenes/logo.webp` — insignia redonda, dorado sobre negro, con transparencia. Se usa tal cual (sin recortar, redibujar ni recolorear).
- Derivados: `img/logo-160.webp` (cabecera y menú), `img/favicon-32.png`, `img/apple-touch-icon.png`.

## Color
Medido del logo (negro #070302, dorado medio #CAAE58, bronce #8F5E31) + marfil cálido.

| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `--ink` | #0B0807 | Texto y botón principal | 17,7:1 sobre marfil |
| `--ivory` | #F6F1E8 | Fondo principal | — |
| `--sand` | #EDE5D8 | Bloques destacados (labios, contacto) | — |
| `--gold` | #CAAE58 | Filetes y estrellas (nunca texto sobre claro) | 1,9:1 sobre marfil |
| `--bronze` | #7A4E26 | Etiquetas y enlaces pequeños; derivado del bronce del logo | 6,3:1 marfil · 5,7:1 arena |
| `--stone` | #6B6157 | Texto secundario | 5,4:1 |

Sin degradados. Sin rosa pastel.

## Tipografía (alojada en `fonts/`, subconjunto latino)
- **Bodoni Moda** (variable, con eje óptico; normal e itálica) — títulos, solo desde 28 px.
- **Jost** 300–600 — texto e interfaz; mayúsculas espaciadas solo donde informan (eco del «BEAUTY STUDIO» del logo).

## Forma y movimiento
- Fotos y bloques con esquina recta; botones en píldora; el círculo, solo en el logo y el botón de llamar.
- Sombra única para elementos flotantes (barra de cita).
- Parallax en escritorio solo por traslación: las fotos nunca se amplían por encima de su tamaño.
- GSAP 3.15.0 (ScrollTrigger, SplitText) y Lenis 1.3.27 en `vendor/`, versiones fijadas.
- Curva `cubic-bezier(.16,1,.3,1)`; revelados de 1–1,5 s; solo `transform`, `opacity` y `clip-path`.
- «Enfoque»: cada foto aparece sobre una miniatura borrosa de 24 px incrustada (sin animar filtros).
- Movimiento reducido: sin animaciones ni Lenis; el contenido se ve igual.

## Imágenes: dónde va cada una

| Uso | Original | Recorte (`img/`) |
|---|---|---|
| Portada (muro, 4:5 · 360/560) | `manicura-17, 16, 3, 4, 5, 13, 14, 18, 20, 21`, `labios-5`, `labios-2` | Móvil 2 columnas, tablet 3, escritorio 4 |
| Servicios · Uñas (collage) | `manicura-2` (principal), `manicura-19`, `manicura-24` | 4:5 |
| Servicios · Pestañas | `pestanas-1` + detalle de las pestañas | 4:5 + detalle 300 px |
| Servicios · Cejas | `cejas-1` + detalle de la ceja superior | 4:5 (zona inferior, sin las fotos insertadas) + detalle 232 px |
| Pie (tira a Instagram) | `manicura-15, 21, 5, 18, 4, 16` | recortes del muro, en cuadrado |
| Labios destacado | `labios-1` (resultado) + `labios-6` (proceso) | 4:5 |
| Olga | `olga-2` con el cartel de VOLYA, a sangre en móvil con su nombre superpuesto; la mesa queda bajo el velo | 4:5 · 480 / 680 |

**Reseñas (texto literal):** en servicios, Maria C. (uñas), Ainhoa O. (pestañas) y Alma H. (cejas); en Olga, Evangéline M., Laura y Natalia P.

**Botones de cita:** solo en portada, cabecera (escritorio), barra fija (móvil), menú y contacto. Los servicios no llevan botón propio.

**No se usan:**
- `manicura-11` — etiqueta de una marca de vino.
- `manicura-8`, `-6`, `-7`, `-9`, `-12`, `-22` — mandan el paisaje, las orquídeas o las hojas.
- `manicura-1` — lámpara de secado.
- `manicura-10` — el turquesa choca con la paleta.
- `labios-3` — menos nivel.
- `labios-4` — crema anestésica.
- `olga-1`, `olga-3` — se mantiene `olga-2` para la sección de Olga.
- `manicura-7` — en el muro mandaba la orquídea.
- `manicura-23` — descartada para la portada.

## Pendientes de confirmar con la dueña
- Precios y duraciones (hueco comentado en cada servicio).
- Fotos del local (no hay sección que dependa de ellas).
- Que WhatsApp y teléfono de reservas son el mismo número (+34 637 052 157).
- Datos del titular para el aviso legal.
- Dominio definitivo: canonical, `og:url`, `og:image`, hreflang y URL absoluta del logo en schema.org.
