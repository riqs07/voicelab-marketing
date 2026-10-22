#!/bin/sh
# Usage: ./sheet.sh out.png a.png b.png ... → side-by-side contact sheet, each 360 px wide
out=$1; shift
n=$#
inputs=""; i=0; chain=""
for f in "$@"; do inputs="$inputs -i $f"; chain="$chain[$i:v]scale=360:-1[v$i];"; i=$((i+1)); done
stack=""; i=0; while [ $i -lt $n ]; do stack="$stack[v$i]"; i=$((i+1)); done
ffmpeg -y -loglevel error $inputs -filter_complex "${chain}${stack}hstack=inputs=$n" "$out"
