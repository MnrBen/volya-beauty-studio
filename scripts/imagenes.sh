#!/usr/bin/env bash
# Genera recortes y tamaños web en img/ a partir de imagenes/ (los originales no se tocan).
# Uso: bash scripts/imagenes.sh   (requiere ffmpeg con libwebp)
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=imagenes
OUT=img
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

# Portada: uñas rojas sobre cuero negro (principal) y labios (acompañante en escritorio)
recorte manicura-23 4x5 600:750:66:220    480 600
recorte labios-5    4x5 688:860:0:15      480 688

# Servicios (miniatura en móvil y vista previa en escritorio, 4:5)
recorte manicura-16 4x5 739:924:100:0     480 739
recorte pestanas-1  4x5 752:940:0:230     480 752
recorte cejas-1     4x5 452:565:300:720   452

# Micropigmentación de labios destacada: resultado y proceso
recorte labios-1    4x5 683:854:0:16      480 683
recorte labios-6    4x5 516:645:0:25      516

# Favicon e icono táctil a partir del logo (con su transparencia)
ffmpeg -v error -y -i "$SRC/logo.webp" -vf "scale=32:32:flags=lanczos" "$OUT/favicon-32.png"
ffmpeg -v error -y -i "$SRC/logo.webp" -vf "scale=180:180:flags=lanczos" "$OUT/apple-touch-icon.png"
ffmpeg -v error -y -i "$SRC/logo.webp" -vf "scale=160:160:flags=lanczos" \
  -c:v libwebp -quality 90 "$OUT/logo-160.webp"

echo "Hecho: $(ls "$OUT" | wc -l) archivos en $OUT/"
