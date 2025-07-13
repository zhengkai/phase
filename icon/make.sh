#!/bin/bash

cd "$(dirname "$(readlink -f "$0")")" || exit 1

colors=(
	"cccccc"
	"999999"
	"00d0b3"
	"00c8f8"
	"9db7ff"
	"dba3ff"
	"ff9bbb"
	"ffa273"
	"e3b200"
	"7ace32"
)

mkdir -p output
mkdir -p tmp

set -x
for i in "${!colors[@]}"; do
	export COLOR="${colors[i]}"
	SVG_OUT="tmp/${i}.svg"
	envsubst < ./network.svg > "$SVG_OUT"
	inkscape "$SVG_OUT" --export-type=png --export-width=128 --export-filename="output/s$((i - 2)).png"
	cp "$SVG_OUT" "output/s$((i - 2)).svg"
done
