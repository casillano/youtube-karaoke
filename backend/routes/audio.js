var express = require("express");
var router = express.Router();
var path = require('path');
const youtubedl = require('youtube-dl');
const fs = require('fs');

router.post('/', function(req, res) {
    var url = req.body.url;
    var video = youtubedl(url);
    const file = fs.createWriteStream('./aux_files/song.mp3');
    file.on('error', function(err) {
        console.log(err);
        res.status(500).send("Error creating audio file");
        // handle writestream error
    })
    .on('open', function() {
        var stream = video.pipe(file);
        stream.on('finish', function() {
            file.close();
            res.status(200).sendFile(path.join(__dirname, "../aux_files", "song.mp3"));
        })
        stream.on('error', function() {
            res.status(500).send("Error writing to audio file");
        })
    })
})

module.exports = router