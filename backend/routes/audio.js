var express = require("express");
var router = express.Router();
var path = require('path');
const youtubedl = require('youtube-dl');
const fs = require('fs');
const pathToFfmpeg = require('../secrets/secrets').pathToFfmpeg;

router.post('/:id', function(req, res) {
    var url = req.body.url;
    var id = req.params.id;
    // convert youtube video to mp3 and download
    youtubedl.exec(url,
    ['-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0', '-o', `./aux_files/${id}.mp3`, '--prefer-ffmpeg', '--ffmpeg-location', pathToFfmpeg],
    {}, function(err, output) {
        if (err) {
            console.log(err);
            res.status(500).send("Error creating audio file");
        } else {
            console.log(output.join('\n'))
            setTimeout(() => {
                res.status(200).sendFile(path.join(__dirname, "../aux_files", `${id}.mp3`),
                {headers: {'Content-Type': 'audio/mpeg'}});
            }, 2500);
        }
    })
})

module.exports = router