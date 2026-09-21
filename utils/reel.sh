#!/bin/bash

INPUT="$HOME/Desktop/reel--short.mp4"
OUTPUT_MP4="$HOME/Desktop/reel--short-small.mp4"
OUTPUT_WEBM="$HOME/Desktop/reel--short-small.webm"

# Target aproximado por archivo
TARGET_MB=5

# Obtener duración
DURATION=$(ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$INPUT")

# Calcular bitrate disponible en kbps
# Dejamos ~3% de margen para container/overhead
BITRATE=$(awk "BEGIN {
  print int(($TARGET_MB * 8192 * 0.97) / $DURATION)
}")

echo "Duration: ${DURATION}s"
echo "Target bitrate: ${BITRATE} kbps"

# -------------------------
# MP4 / H.264 - 2 PASS
# -------------------------

ffmpeg -y -i "$INPUT" \
  -c:v libx264 \
  -preset slow \
  -b:v "${BITRATE}k" \
  -pass 1 \
  -an \
  -f null /dev/null

ffmpeg -y -i "$INPUT" \
  -c:v libx264 \
  -preset slow \
  -b:v "${BITRATE}k" \
  -pass 2 \
  -an \
  -movflags +faststart \
  -pix_fmt yuv420p \
  "$OUTPUT_MP4"

rm -f ffmpeg2pass-0.log ffmpeg2pass-0.log.mbtree

# -------------------------
# WEBM / VP9 - 2 PASS
# -------------------------

ffmpeg -y -i "$INPUT" \
  -c:v libvpx-vp9 \
  -b:v "${BITRATE}k" \
  -pass 1 \
  -an \
  -f null /dev/null

ffmpeg -y -i "$INPUT" \
  -c:v libvpx-vp9 \
  -b:v "${BITRATE}k" \
  -pass 2 \
  -an \
  -row-mt 1 \
  -cpu-used 1 \
  "$OUTPUT_WEBM"

rm -f ffmpeg2pass-0.log

echo ""
echo "Done:"
ls -lh "$OUTPUT_MP4" "$OUTPUT_WEBM"