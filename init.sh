#!/bin/sh

URL="https://www.ripta.com/stuff/contentmgr/files/0/3cda81dfa140edbe9aae214b26245b4a/files/google_transit.zip"
echo 'Downloading...'
cd ./static/google_transit
rm *.txt
curl -sS "${URL}" > file.zip && \
unzip file.zip
rm file.zip

psql \
  -d $DATABASE_URL \
  -f seed.sql \
  --echo-all

cd ../..
node csv-to-json.js




