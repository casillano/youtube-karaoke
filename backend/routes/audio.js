var express = require("express");
var router = express.Router();
var path = require('path');
const youtubedl = require('youtube-dl');
const fs = require('fs');
const pathToFfmpeg = require('../secrets/secrets').pathToFfmpeg;

router.post('/', function(req, res) {
    // delete files if request closes (e.g. due to browser exit)
    req.on('close', function(err) {
        // if (fs.existsSync(path.join(__dirname, "../aux_files", "words.txt"))) {
        //     fs.unlinkSync(path.join(__dirname, "../aux_files", "words.txt"))
        // }
        // if (fs.existsSync(path.join(__dirname, "../aux_files", "song.mp3"))) {
        //     fs.unlinkSync(path.join(__dirname, "../aux_files", "song.mp3"))
        // }
    })
    var url = req.body.url;
    // convert youtube video to mp3 and download
    youtubedl.exec(url,
    ['-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0', '-o', "./aux_files/song.mp3", '--prefer-ffmpeg', '--ffmpeg-location', pathToFfmpeg],
    {}, function(err, output) {
        if (err) {
            console.log(err);
            res.status(500).send("Error creating audio file");
        } else {
            console.log(output.join('\n'))
            setTimeout(() => {
                res.status(200).sendFile(path.join(__dirname, "../aux_files", "song.mp3"),
                {headers: {'Content-Type': 'audio/mpeg'}});
            }, 2500);
        }
    })
})

module.exports = router