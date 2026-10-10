#!/bin/sh
# Ré-encodage final : yuv420p plage limitée BT.709 (Remotion sort du yuvj420p à partir de frames JPEG), faststart.
set -e
for f in out/ADF2026_Sabek_GardonMollard_*.mp4; do
  ffmpeg -v error -y -i "$f" -c:v libx264 -crf 17 -preset slow \
    -vf "scale=in_range=full:out_range=tv,format=yuv420p" \
    -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
    -movflags +faststart -c:a copy "$f.tmp.mp4"
  mv "$f.tmp.mp4" "$f"
  echo "ok $f"
done
