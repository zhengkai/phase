#!/bin/bash

cd "$(dirname "$(readlink -f "$0")")" || exit 1

colors=(
    "ff9bbb"
    "ffa365"
    "ceba00"
    "00d470"
    "00ccdb"
    "89bcff"
    "d0a7ff"
)

mkdir -p output
mkdir -p tmp

for i in "${!colors[@]}"; do
	export COLOR="${colors[i]}"
	SVG_OUT="tmp/${i}.svg"
	envsubst < ./network.svg > "$SVG_OUT"
	convert -density 300  -background none "$SVG_OUT" -resize 24x24 "output/${i}.png"
done
