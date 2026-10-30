# VOLYA Beauty Studio — brand spec

Referencia de marca para la web. Las imágenes originales viven en `imagenes/` y no se modifican; los recortes y tamaños web se generan en `img/` con `scripts/imagenes.sh`.

## Idea: «Al detalle»
La web mira el trabajo de Olga de cerca. El círculo del logo se convierte en una **lupa**: es la única forma circular además de los botones y la propia insignia.
- Portada: la lupa amplía las uñas (sigue al cursor en escritorio; recorre las uñas con el scroll en móvil).
- Labios (pendiente): la lupa se abre hasta descubrir el resultado.
- Galería de escritorio (pendiente): lupa al pasar el cursor.

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
- Fotos y bloques con esquina recta; botones en píldora; círculo solo para lupa y logo.
- Sombra única para elementos flotantes (barra de cita, lupa).
- GSAP 3.15.0 (ScrollTrigger, SplitText) y Lenis 1.3.27 en `vendor/`, versiones fijadas.
- Curva `cubic-bezier(.16,1,.3,1)`; revelados de 1–1,5 s; solo `transform`, `opacity` y `clip-path`.
- «Enfoque»: cada foto aparece sobre una miniatura borrosa de 24 px incrustada (sin animar filtros).
- Movimiento reducido: sin animaciones ni Lenis; el contenido se ve igual.

## Imágenes: dónde va cada una

| Uso | Original | Recorte (`img/`) |
|---|---|---|
| Portada | `manicura-17` | 4:5 · 480 / 764 |
| Servicios · Uñas | `manicura-16` | 1:1 (lupa) · 4:5 (vista previa escritorio) |
| Servicios · Pestañas | `pestanas-1` | 1:1 · 4:5 |
| Servicios · Cejas | `cejas-1` | 1:1 · 4:5 (zona inferior, sin las fotos insertadas) |
| Servicios · Micropigmentación | `labios-1` | 1:1 · 4:5 |
| Labios (pendiente) | `labios-5`, `labios-2`, `labios-6` (proceso) | — |
| Trabajos (pendiente) | `manicura-2, 3, 19, 24, 23, 18, 14, 4, 21` (selección) | 4:5 |
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
