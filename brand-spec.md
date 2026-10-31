# VOLYA Beauty Studio — brand spec

Referencia de marca para la web. Las imágenes originales viven en `imagenes/` y no se modifican; los recortes y tamaños web se generan en `img/` con `scripts/imagenes.sh`.

## Idea: «Al detalle»
Los trabajos de Olga en primer plano son los protagonistas, sobre negro y marfil con el dorado del logo. Las fotos se descubren y «enfocan» al aparecer.

## Alcance (demo reducida)
1. Portada muy visual (fondo tinta).
2. Servicios, con la micropigmentación de labios destacada en un bloque oscuro.
3. Olga y 2–3 reseñas.
4. Contacto (dirección, horario, botones) y pie con el aviso legal.

Móvil: unas 4 pantallas. Sin galería ni secciones extra.

## Resolución de las fotos
Los originales miden unos 700 px de ancho. En escritorio se muestran como mucho a ~430 px (portada, desde 764 px: nítida hasta densidad ≈1,8) y ~465 px (labios, nítida hasta ≈1,4). En pantallas Retina (densidad 2) se amplían ~1,4×. Para nitidez total en Retina harían falta los originales del móvil de Olga.

## Logo
- `imagenes/logo.webp` — insignia redonda, dorado sobre negro, con transparencia. Se usa tal cual (sin recortar, redibujar ni recolorear).
- Derivados: `img/logo-160.webp` (cabecera y menú), `img/favicon-32.png`, `img/apple-touch-icon.png`.

## Color
Medido del logo (negro #070302, dorado medio #CAAE58, bronce #8F5E31) + marfil cálido.

| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `--ink` | #0B0807 | Texto y capítulos oscuros | 17,7:1 sobre marfil |
| `--ivory` | #F6F1E8 | Fondo principal (~70 %) | — |
| `--gold` | #CAAE58 | Filetes, lupa, estrellas; texto solo sobre tinta | 9,2:1 sobre tinta · 1,9:1 sobre marfil (nunca texto) |
| `--bronze` | #8F5E31 | Texto dorado pequeño sobre marfil | 4,9:1 |
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
| Portada (principal) | `manicura-17` — almendra nude con degradado | 4:5 · 480 / 764 |
| Portada (acompañante, solo escritorio) | `labios-5` | 4:5 · 480 / 688 |
| Servicios · Uñas | `manicura-24` — francesa negra con lazos | 4:5 (miniatura en móvil, vista previa en escritorio) |
| Servicios · Pestañas | `pestanas-1` | 4:5 |
| Servicios · Cejas | `cejas-1` | 4:5 (zona inferior, sin las fotos insertadas) |
| Labios destacado | `labios-1` (resultado) + `labios-6` (proceso) | 4:5 |
| Olga (pendiente) | `olga-2` recortada; si no queda limpia, `olga-3` | 3:4 |

**No se usan:**
- `manicura-11` — etiqueta de una marca de vino.
- `manicura-8`, `-6`, `-7`, `-9`, `-12`, `-22` — mandan el paisaje, las orquídeas o las hojas.
- `manicura-1` — lámpara de secado.
- `manicura-10` — el turquesa choca con la paleta.
- `labios-3` — menos nivel.
- `labios-4` — crema anestésica.
- `olga-1` — fondo de globos rosas.

## Pendientes de confirmar con la dueña
- Precios y duraciones (hueco comentado en cada servicio).
- Fotos del local (no hay sección que dependa de ellas).
- Que WhatsApp y teléfono de reservas son el mismo número (+34 637 052 157).
- Datos del titular para el aviso legal.
- Dominio definitivo: canonical, `og:url`, `og:image`, hreflang y URL absoluta del logo en schema.org.
