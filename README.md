# youtube-karaoke

![](karaoke.gif)

# How to Use
For the application to work properly, the title of the given youtube video must be in the form {Artist}-{Song_Name}. It's okay if there are extra bits as long as the main information is where it's supposed to be.\
Examples:
* Watsky-Ten Fingers
* Grover Washington Jr. - Just the Two of Us (feat. Bill Withers) (Official Audio)
* Bobby McFerrin - Don't Worry Be Happy (Official Video)

The aligner depends on accurate lyrics from Genius to work properly. **If the lyrics from Genius are not word-for-word (e.g. if instead of rewriting a repeating line, it puts "Repeat x2", then the alignment will be off and the lyric highlighting will be inaccurate**. This will also occur if the aligner has a difficult time understanding what is being  said.


# Installation
This project uses the [gentle forced aligner](https://github.com/lowerquality/gentle). Using the Docker image is recommended. Also ensure that [FFmpeg](https://ffmpeg.org/) is installed on your local system.

# Usage
1. Start up the [gentle forced aligner](https://github.com/lowerquality/gentle#using-gentle). Ensure that the aligner is listening at http://localhost:8765.
If you are using the docker image, run 
`docker run -p 8765:8765 lowerquality/gentle`.

2. Download the source code. Get a [Genius API key](https://docs.genius.com/). Then, find the path to your `ffmpeg` binary files. Navigate to `/backend/secrets`, create `secrets.js`, and paste the following:
```
const geniusKey = 'API_KEY_HERE';
const pathToffmpeg = 'PATH_TO_FFMPEG_HERE'
exports.geniusKey = geniusKey;
exports.pathToFfmpeg = pathToffmpeg
```

3. Get a [Youtube Data API v3 key](https://console.developers.google.com). Navigate to `/frontend/src/secrets`, create `secrets.js`, and paste the following:
```
const key = 'API_KEY_HERE';
exports.key = key;
```
4. Navigate to the backend folder, then run `npm start`. Then navigate to the frontend folder and run `npm start`.
