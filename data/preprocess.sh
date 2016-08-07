#!/usr/bin/bash

# Takes a wordlist from https://invokeit.wordpress.com/frequency-word-lists/ and extracts the first MAXIMUM_AMOUNT words as long as they occur at least MINIMUM_FREQUENCY times

if [[ ! $# -eq 2 ]]; then
   echo "Usage: $0 INPUT OUTPUT" >&2
fi

INPUT="$1"
OUTPUT="$2"

TEMPFILE=$(mktemp)
dos2unix -n "$INPUT" "$TEMPFILE"


# Minimum numbers of occurences
MINIMUM_FREQUENCY=100
# Maximum numbers of words
MAXIMUM_AMOUNT=10000

# open the input
exec 3<> "$TEMPFILE"

rm "$OUTPUT"

COUNTER=1
while read -u 3 WORD FREQUENCY; do
   if [[ $FREQUENCY -lt $MINIMUM_FREQUENCY ]]; then
      break
   fi

   if [[ $COUNTER -gt $MAXIMUM_AMOUNT ]]; then
      break
   fi

   echo "$WORD" >> "$OUTPUT"
   echo "$COUNTER: $WORD ($FREQUENCY)"

   COUNTER=$((COUNTER + 1))
done
