const youtubedl = require('youtube-dl');
const geniusLyrics = require('genius-lyrics-api').getLyrics;
const geniusSong = require('genius-lyrics-api').getSong;
const fsPromise = require('fs').promises;
const geniusKey = require('../secrets/secrets').geniusKey;

getLyrics('https://www.youtube.com/watch?v=E-DRkixL3rA');

function getLyrics(url) {
    youtubedl.getInfo(url, function (err, info) {
        // handle errors here
        if (err) {
            console.log(err);
            throw "Error retrieving lyrics (youtube-dl)";
        } else {
            var fields = info.title.split('-');
            var artist = sanitizeArtistOrTitle(fields[0].trim());
            // TODO: handle possibility of - in artist/song name
            var title = sanitizeArtistOrTitle(fields[1].trim());


            const options = {
                apiKey: geniusKey,
                title: title,
                artist: artist,
                optimizeQuery: true
            };
           
            geniusSong(options)
            .then(function (result) {
                console.log(result);
                urlFields = result.url.split('/');
                // check if the name of the song and artist are in the url 
                // since the api seems to return a random lyric page
                // when the actual page cannot be found
                var titleAndArtist = urlFields[3].split('-').join(' ').toLowerCase();
                if (titleAndArtist.includes(artist.toLowerCase()) &&
                    titleAndArtist.includes(title.toLowerCase())) {
                    // get the lyrics and write to a file
                    writeLyrics(options);
                } else {
                    throw "Lyrics page does not match the song details"
                }

            }).catch(function (err) {
                console.log(err);
                throw "wtf going on";
            })
        }
    })
}
function writeLyrics(options) {
    geniusLyrics(options)
        .then(lyrics => sanitizeLyrics(lyrics))
        .then(sanitizedLyrics => fsPromise.writeFile("./aux_files/words.txt",
            sanitizedLyrics.toString()))
        .then(console.log("written to file"))
        .catch(function (err) {
            console.log(err);
            throw "Could not lyrics to file";
        });
}

function sanitizeLyrics(lyrics) {
    var regexp = /\[[\w ]*\]/g;
    return lyrics.replace(regexp, '');
}

// remove unncessary parts of the video title e.g. "feat. ...", 
// "[Official Music Video]"
function sanitizeArtistOrTitle(value) {
    var regexp = /(ft\..*$|\(.*$|\[.*$|feat\..*$)/
    return value.replace(regexp, '');
}

exports.getLyrics = getLyrics;