# youtube-karaoke

# How to Use
For the application to work properly, the title of the given youtube video must be in the form {Artist}-{Song_Name}. It's okay if there are extra bits as long as the main information is where it's supposed to be.\
Examples:
* Watsky-Ten Fingers
* Grover Washington Jr. - Just the Two of Us (feat. Bill Withers) (Official Audio)
* Bobby McFerrin - Don't Worry Be Happy (Official Video)


# Installation
This project uses the [gentle forced aligner](https://github.com/lowerquality/gentle). Using the Docker image is recommended.

# Usage
1. Start up the [gentle forced aligner](https://github.com/lowerquality/gentle#using-gentle). Ensure that the aligner is listening at http://localhost:8765.
If you are using the docker image, run 
`docker run -p 8765:8765 lowerquality/gentle`.

2. Download the source code. Get a [Genius API key](https://docs.genius.com/). Navigate to `/backend/secrets`, create `secrets.js`, and paste the following:
```
const geniusKey = 'API_KEY_HERE';
exports.geniusKey = geniusKey;
```

3. Get a [Youtube Data API v3 key](https://console.developers.google.com). Navigate to `/frontend/src/secrets`, create `secrets.js`, and paste the following:
```
const key = 'API_KEY_HERE';
exports.key = key;
```
4. Navigate to the backend folder, then run `npm start`. Then navigate to the frontend folder and run `npm start`.
