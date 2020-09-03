var express = require("express");
var router = express.Router();
var path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');

router.post("/", function(req, res) {
    req.on('close', deleteFiles);
    var data = FormData();
    data.append("audio", fs.createReadStream("./aux_files/song.mp3"));
    data.append("transcript", fs.createReadStream("./aux_files/words.txt"));
    // var audio = fs.createReadStream("./aux_files/song.mp3");
    // var transcript = fs.createReadStream("./aux_files/words.txt");

    // transcript.on('open', () => { data.append("transcript", transcript) });
    // transcript.on('error', function (err) {
    //     console.log(err);
    //     res.status(500).send("Error opening transcript file");
    // });

    // audio.on('open', () => {
    //     data.append("audio", audio);
    //     data.append("conservative", "true");

        /*
         putting fetch after audio file is found since it takes longer to
         open than the txt file. If I were to put it outside of this block,
         it is possible that the file has not yet been found when the request
         is sent
         */

        fetch("http://localhost:8765/transcriptions?async=false", {
            body: data,
            method: "post"
        }).then((response) => {
            if (response.ok) {
                response.json().then((data) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).send(data);
                })
            } else {
                res.status(500).send("request to aligner failed");
            }
        })
            .catch((err) => {
                console.log(err);
                // handle aligner fetch error
                res.status(500).send("aligner fetch error");
            })
            .finally(() => {
                // audio.close();
                // transcript.close();
                deleteFiles();
            })
    });
    // audio.on('error', function (err) {
    //     console.log(err);
    //     res.status(500).send("Error opening audio file");
    // });

function deleteFiles() {
    if (fs.existsSync(path.join(__dirname, "../aux_files", "words.txt"))) {
        fs.unlinkSync(path.join(__dirname, "../aux_files", "words.txt"))
    }
    if (fs.existsSync(path.join(__dirname, "../aux_files", "song.mp3"))) {
        fs.unlinkSync(path.join(__dirname, "../aux_files", "song.mp3"))
    }
}

module.exports = router