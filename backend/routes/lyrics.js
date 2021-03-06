var express = require("express");
var router = express.Router();
var path = require('path');
const youtubedl = require('youtube-dl');
const geniusLyrics = require('genius-lyrics-api').getLyrics;
const geniusSong = require('genius-lyrics-api').getSong;
const fsPromise = require('fs').promises;
const geniusKey = require('../secrets/secrets').geniusKey;
const fs = require('fs');

router.post("/:id", function (req, res, next) {
    var url = req.body.url;
    youtubedl.getInfo(url, function (err, info) {
        // handle errors here
        if (err) {
            console.log(err);
            res.status(500).send("youtube-dl error");
        } else {
            var fields = info.title.split('-');
            var artist = sanitizeArtistOrTitle(fields[0].trim()).replace(/'|,|\./g, '');
            var title = sanitizeArtistOrTitle(fields[1].trim()).replace(/'|,|\./g, '');

            const options = {
                apiKey: geniusKey,
                title: title,
                artist: artist,
                optimizeQuery: true
            };

            geniusSong(options)
                .then(function (result) {
                    urlFields = result.url.split('/');
                    // check if the name of the song and artist are in the url 
                    // since the api seems to return a random lyric page
                    // when the actual page cannot be found
                    var titleAndArtist = urlFields[3].split('-').join(' ').toLowerCase().replace(/'|,|\./g, '')
                    console.log(titleAndArtist)
                    if (titleAndArtist.includes(artist.toLowerCase()) &&
                        titleAndArtist.includes(title.toLowerCase())) {
                        // get the lyrics and write to a file
                        req.options = options;
                        next();
                    } else {
                        console.log(artist)
                        console.log(title);
                        res.status(500).send("genius API error on retrieving lyrics");
                    }

                }).catch(function (err) {
                    console.log(err);
                    res.status(500).send("genius API unknown error");
                })
        }
    })
}, function (req, res) {
    var id = req.params.id;
    console.log(__dirname);
    geniusLyrics(req.options)
        .then(lyrics => sanitizeLyrics(lyrics))
        .then(sanitizedLyrics => fsPromise.writeFile(`./aux_files/${id}.txt`,
            sanitizedLyrics.toString()))
        .then(console.log("written to file"))
        .then(
            setTimeout(() => {
                res.status(200).sendFile(path.join(__dirname, "../aux_files", `${id}.txt`),
                    { headers: { 'Content-Type': 'text/plain' } })
            }, 2500)
        )
        .catch(function (err) {
            console.log(err);
            res.status(500).send("Could not write lyrics to file");
        });
})


// remove unnecessary tags from lyrics e.g. [Chorus]
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

module.exports = router