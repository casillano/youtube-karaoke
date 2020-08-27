const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');


function alignText() {
    var data = FormData();
    var audio = fs.createReadStream("./aux_files/song.mp3");
    var transcript = fs.createReadStream("./aux_files/words.txt");

    transcript.on('open', () => { data.append("transcript", transcript) });
    transcript.on('error', function (err) {
        console.log(err);
        throw "Error with the transcript file";
    });

    audio.on('open', () => {
        data.append("audio", audio);

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
                response.json().then(data => {
                    console.log(data);
                })
            } else {
                throw "Request to aligner failed";
            }
        })
            .catch((err) => {
                console.log(err);
                // handle aligner fetch error
                throw "aligner fetch error";
            })
            .finally(() => {
                audio.close();
                transcript.close();
            })
    });
    audio.on('error', function (err) {
        console.log(err);
        throw "Audio file failed to open";
        // handle error
    });

}

exports.alignText = alignText;