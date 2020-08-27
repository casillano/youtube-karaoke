const youtubedl = require('youtube-dl');
const fs = require('fs');


function downloadVideo(url) {
    var video = youtubedl(url);
    const file = fs.createWriteStream('./aux_files/song.mp3');
    file.on('error', function(err) {
        console.log(err);
        throw "Could not download video";
        // handle writestream error
    })
    .on('open', function() {
        var stream = video.pipe(file);
        stream.on('finish', function() {
            file.close();
        })
        stream.on('error', function() {
            throw "Error writing to audio file";
        })
    })
    
}

exports.downloadVideo = downloadVideo;

