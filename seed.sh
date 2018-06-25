#!/bin/sh

URL=$RIPTA_DATA_URL
echo 'Downloading...'
cd ./static/google_transit
rm *.txt
curl -sS "${URL}" > file.zip && \
unzip file.zip
rm file.zip
sed -i .bak '/^.$/d' *.txt  # removes blank lines
rm *.bak

psql \
  -d $DATABASE_URL \
  -f ./seed.sql \
  --echo-all

cd ../..
node csv-to-json.js




