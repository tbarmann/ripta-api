# ripta-api

### Ripta route and trip schedule: GTFS data link on [https://www.ripta.com/mobile-applications](https://www.ripta.com/mobile-applications)

### Update local json files:
1. Download latest zip file from above address
2. Save unzipped files in the `static/google_transit` directory.
3. From project root, run $node csv-to-json.js

### Deploy master to Heroku
See https://devcenter.heroku.com/articles/git#prerequisites-installing-git-and-the-heroku-cli
1. Use `heroku create` to create a new empty application on Heroku
2. Run `git push heroku master` or `git push heroku a-different-branch:master` if deploying another branch


