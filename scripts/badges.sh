#!/bin/bash
if grep -qvE "errors|warning" "report.html"; then
  npx generated-badges --label "Eslint" -s "0 problems" -c green -o badge-eslint.svg
  exit 0
fi
LINE=$(grep -m 1 -Eo '[0-9]+ problems \([0-9]+ errors, [0-9]+ warning\)' "report.html")
NBERRORS=$(grep -Eo '[0-9]+ errors' | grep -Eo '[0-9]+')
NBWARNING=$(grep -Eo '[0-9]+ warning' | grep -Eo '[0-9]+')
color=green
if [[ $NBERRORS > 0 ]]; then
  color=red
elif [[ $NBWARNING > 0 ]]; then
  color=orange
fi

npx generated-badges --label "Eslint" -s "$LINE" -c $color -o badge-eslint.svg

