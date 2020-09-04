var express = require("express");
var router = express.Router();
var path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');

router.post("/", function(req, res) {
    req.on('close', deleteFiles);
    var data = FormData();
    // append files to form data 
    data.append("audio", fs.createReadStream("./aux_files/song.mp3"));
    data.append("transcript", fs.createReadStream("./aux_files/words.txt"));
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
                deleteFiles();
            })
    });

function deleteFiles() {
    if (fs.existsSync(path.join(__dirname, "../aux_files", "words.txt"))) {
        fs.unlinkSync(path.join(__dirname, "../aux_files", "words.txt"))
    }
    if (fs.existsSync(path.join(__dirname, "../aux_files", "song.mp3"))) {
        fs.unlinkSync(path.join(__dirname, "../aux_files", "song.mp3"))
    }
}

module.exports = router