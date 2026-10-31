#!/usr/bin/env bash
# Genera recortes y tamaños web en img/ a partir de imagenes/ (los originales no se tocan).
# Uso: bash scripts/imagenes.sh   (requiere ffmpeg con libwebp)
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=imagenes
OUT=img
rm -rf "$OUT"
mkdir -p "$OUT" "$OUT/lqip"

# recorte <origen> <proporción> <crop w:h:x:y> <anchos...>
# Nunca se amplía por encima del ancho del recorte.
recorte() {
  local name=$1 ratio=$2 crop=$3; shift 3
  local cw=${crop%%:*}
  for w in "$@"; do
    (( w > cw )) && w=$cw
    ffmpeg -v error -y -i "$SRC/$name.webp" \
      -vf "crop=$crop,scale=$w:-2:flags=lanczos" \
      -c:v libwebp -quality 80 -compression_level 6 \
      "$OUT/$name-$ratio-$w.webp"
  done
  # Miniatura de 24 px para el efecto de enfoque (se incrusta en el HTML)
  ffmpeg -v error -y -i "$SRC/$name.webp" \
    -vf "crop=$crop,scale=24:-2:flags=area" \
    -c:v libwebp -quality 50 "$OUT/lqip/$name-$ratio.webp"
}

# Portada: muro de fotos (4:5). Cada pieza se ve a ~185–280 px, así que 360/560 bastan.
recorte manicura-17 4x5 764:955:70:0      360 560
recorte manicura-16 4x5 739:924:100:0     360 560
recorte manicura-3  4x5 752:940:0:280     360 560
recorte manicura-4  4x5 752:940:0:100     360 560
recorte manicura-5  4x5 752:940:0:60      360 560
recorte manicura-7  4x5 752:940:0:0       360 560
recorte manicura-13 4x5 636:795:0:100     360 560
recorte manicura-14 4x5 638:798:0:150     360 560
recorte manicura-15 4x5 636:795:0:150     360 560
recorte manicura-18 4x5 817:1021:0:150    360 560
recorte manicura-20 4x5 636:795:0:0       360 560
recorte manicura-21 4x5 636:795:0:80      360 560
recorte labios-5    4x5 688:860:0:15      360 560
recorte labios-2    4x5 687:859:0:0       360 560

# Servicios
recorte manicura-2  4x5 752:940:0:150     480 752
recorte manicura-19 4x5 808:1010:0:0      360 560
recorte manicura-24 4x5 515:644:0:150     515
recorte pestanas-1  4x5 752:940:0:230     480 752
recorte pestanas-1  det 300:375:430:470   300
recorte cejas-1     4x5 452:565:300:720   452
recorte cejas-1     det 232:290:380:210   232

# Micropigmentación de labios destacada: resultado y proceso
recorte labios-1    4x5 683:854:0:16      480 683
recorte labios-6    4x5 516:645:0:25      516

# Olga: olga-2 recortada para que mande ella (cara nítida, sin el cartel ni la mesa)
recorte olga-2      3x4 396:528:0:40      396

# Favicon e icono táctil a partir del logo (con su transparencia)
ffmpeg -v error -y -i "$SRC/logo.webp" -vf "scale=32:32:flags=lanczos" "$OUT/favicon-32.png"
ffmpeg -v error -y -i "$SRC/logo.webp" -vf "scale=180:180:flags=lanczos" "$OUT/apple-touch-icon.png"
ffmpeg -v error -y -i "$SRC/logo.webp" -vf "scale=160:160:flags=lanczos" \
  -c:v libwebp -quality 90 "$OUT/logo-160.webp"

echo "Hecho: $(ls "$OUT" | wc -l) archivos en $OUT/"
