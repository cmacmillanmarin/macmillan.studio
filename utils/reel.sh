#!/bin/bash
#
# Genera las variantes comprimidas del reel corto (mp4 H.264 + webm VP9).
#
#   ./utils/reel.sh                    # desktop: 1920px, ~5 MB   -> reel--short-desktop.{mp4,webm}
#   ./utils/reel.sh mobile 1280 2.5    # mobile:  1280px, ~2.5 MB -> reel--short-mobile.{mp4,webm}
#
# Argumentos: [variante] [ancho px] [tamaño objetivo MB]
# El input se puede sobreescribir con INPUT=/ruta/al/master.mp4

set -euo pipefail

VARIANT="${1:-desktop}"
WIDTH="${2:-1920}"
TARGET_MB="${3:-5}"

VIDEO_DIR="$(cd "$(dirname "$0")/../public/assets/video" && pwd)"
INPUT="${INPUT:-$VIDEO_DIR/reel--short.mp4}"
OUTPUT_MP4="$VIDEO_DIR/reel--short-$VARIANT.mp4"
OUTPUT_WEBM="$VIDEO_DIR/reel--short-$VARIANT.webm"

# Logs del 2-pass fuera del cwd para no dejar residuos
PASSLOG="$(mktemp -d)/ffmpeg2pass"
trap 'rm -rf "$(dirname "$PASSLOG")"' EXIT

# Obtener duración
DURATION=$(ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$INPUT")

# Calcular bitrate disponible en kbps
# Dejamos ~3% de margen para container/overhead
BITRATE=$(awk "BEGIN {
  print int(($TARGET_MB * 8192 * 0.97) / $DURATION)
}")
# Techo para picos de bitrate: evita stalls en redes móviles
MAXRATE=$(awk "BEGIN { print int($BITRATE * 1.5) }")
BUFSIZE=$(awk "BEGIN { print int($BITRATE * 2) }")

# Escala manteniendo aspect ratio (-2 = altura par, requisito de yuv420p)
SCALE="scale=$WIDTH:-2"

echo "Input:    $INPUT"
echo "Variant:  $VARIANT (${WIDTH}px, ~${TARGET_MB} MB)"
echo "Duration: ${DURATION}s"
echo "Bitrate:  ${BITRATE} kbps (max ${MAXRATE} kbps)"

# -------------------------
# MP4 / H.264 - 2 PASS
# -------------------------

ffmpeg -y -i "$INPUT" \
  -vf "$SCALE" \
  -c:v libx264 \
  -preset slow \
  -b:v "${BITRATE}k" -maxrate "${MAXRATE}k" -bufsize "${BUFSIZE}k" \
  -pass 1 -passlogfile "$PASSLOG" \
  -an \
  -f null /dev/null

ffmpeg -y -i "$INPUT" \
  -vf "$SCALE" \
  -c:v libx264 \
  -preset slow \
  -b:v "${BITRATE}k" -maxrate "${MAXRATE}k" -bufsize "${BUFSIZE}k" \
  -pass 2 -passlogfile "$PASSLOG" \
  -an \
  -movflags +faststart \
  -pix_fmt yuv420p \
  "$OUTPUT_MP4"

# -------------------------
# WEBM / VP9 - 2 PASS
# -------------------------

ffmpeg -y -i "$INPUT" \
  -vf "$SCALE" \
  -c:v libvpx-vp9 \
  -b:v "${BITRATE}k" -maxrate "${MAXRATE}k" -bufsize "${BUFSIZE}k" \
  -pass 1 -passlogfile "$PASSLOG" \
  -an \
  -f null /dev/null

ffmpeg -y -i "$INPUT" \
  -vf "$SCALE" \
  -c:v libvpx-vp9 \
  -b:v "${BITRATE}k" -maxrate "${MAXRATE}k" -bufsize "${BUFSIZE}k" \
  -pass 2 -passlogfile "$PASSLOG" \
  -an \
  -row-mt 1 \
  -cpu-used 1 \
  "$OUTPUT_WEBM"

echo ""
echo "Done:"
ls -lh "$OUTPUT_MP4" "$OUTPUT_WEBM"
