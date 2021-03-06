import React from 'react';
import "bootstrap/dist/css/bootstrap.css";
import "./css/styles.css";

export default class Karaoke extends React.Component {
    constructor(props) {
        super(props);
        var value = 0;
        this.state = {
            currentDuration: parseFloat(value),
            started: false,
            startTime: undefined,
            remainingTime: 0,
            intervalId: undefined,
            currWord: -1,
            prevWordFinished: true,
            totalDuration: "0:00",
            playing: false
        };
        // index for aligned words json
        this.index = 0;
        // index for current line in transcript
        this.lineIndex = 0;
        // index for current word in the current line
        this.wordIndex = 0;
        this.line = [];

        this.playing = this.playing.bind(this);
        this.paused = this.paused.bind(this);
        this.ended = this.ended.bind(this);
        this.playAudio = this.playAudio.bind(this);
        this.pauseAudio = this.pauseAudio.bind(this);
        this.audioRef = React.createRef();
        this.videoRef = React.createRef();

    }

    playing() {
        if (!this.state.started) {
            // set the start time in order to calculate time passed
            this.setState({ startTime: Date.now(), started: true});
        }
        var delay = this.state.remainingTime;
        // set a timeout to make up for the remaining time from when the audio was
        // stopped
        setTimeout(() => {
            var newDuration = parseFloat(this.state.currentDuration + parseFloat(0.01));
            this.setState({ currentDuration: newDuration, remainingTime: 0 });
            this.karaokeText();
            // update the time every 10ms
            var intervalId = setInterval(() => {
                var newDuration = parseFloat(this.state.currentDuration + parseFloat(0.01));
                this.setState({ currentDuration: newDuration });
                this.karaokeText();
            }, 10);
            this.setState({ intervalId: intervalId });
        }, delay)

    }

    paused() {
        if (this.state.intervalId) {
            clearInterval(this.state.intervalId);
            this.setState({ intervalId: null })
        }
        var currTime = Date.now() - this.state.startTime;
        // check if the audio was paused in the middle of the 10ms intervals
        var remainingTime = Math.round((currTime % 0.01) * 1000)
        if (remainingTime > 0) {
            this.setState({ remainingTime: remainingTime })
        }
    }

    // reset everything when the audio has finished
    ended() {
        clearInterval(this.state.intervalId);
        this.setState({
            intervalId: null,
            started: false,
            startTime: null, currWord: -1,
            currentDuration: parseFloat(0),
            playing: false
        });
        this.index = 0;
        this.lineIndex = 0;
        this.wordIndex = 0;
        this.line = [];
        this.videoRef.current.pause();
    }

    playAudio() {
        this.setState({ playing: true });
        var audio = this.audioRef.current;
        var video = this.videoRef.current;
        if (audio.duration) {
            // split up the duration of the audio into minutes and seconds
            // to display to the user
            if (this.state.totalDuration === "0:00") {
                var minutes = Math.floor(audio.duration / 60);
                var seconds = ('0' + (audio.duration % 60).toFixed(0)).slice(-2);
                this.setState({ totalDuration: `${minutes}:${seconds}` })
            }
        }
        audio.play();
        video.play();
    }

    pauseAudio() {
        this.setState({ playing: false })
        var audio = this.audioRef.current;
        var video = this.videoRef.current;
        audio.pause();
        video.pause();
    }


    karaokeText() {
        // check if the end of the transcript has been reached
        if (this.lineIndex < this.props.location.state.transcript.length) {
            this.line = this.props.location.state.transcript[this.lineIndex];
            // check if the duration of the previous page has ended
            if (this.state.prevWordFinished) {
                var wordInfo = this.props.location.state.alignedText[this.index];
                // check if the aligner was successful in aligning the current word
                if (wordInfo.case === "success") {
                    // highlight the word when its start time matches the current time
                    if ((wordInfo.start - this.state.currentDuration) < Number.EPSILON) {
                        this.setState({ currWord: this.wordIndex, prevWordFinished: false })
                        this.index += 1;
                        this.wordIndex += 1;
                    }
                } else {
                    // word wasn't aligned, so highlight immediately and move on
                    // to the next word
                    this.setState({ currWord: this.wordIndex });
                    this.index += 1;
                    this.wordIndex += 1;
                }
            } else {
                // check if the end time of the previous word matches the current time
                if ((this.props.location.state.alignedText[this.index - 1].end - this.state.currentDuration) < Number.EPSILON) {
                    this.setState({ prevWordFinished: true });
                }
            }

            // check if the last word of the current line has been reached and
            // move onto the next line of the transcript
            if (this.wordIndex === this.line.length) {
                var lastWord = this.props.location.state.alignedText[this.index - 1];
                // on successful alignment, wait until the last word has ended
                // before moving onto the next line
                if (lastWord.case === "success") {
                    if ((lastWord.end - this.state.currentDuration) < Number.EPSILON) {
                        this.setState({ currWord: -1 })
                        this.wordIndex = 0;
                        this.lineIndex += 1;
                    }
                } else {
                    this.setState({ currWord: -1 })
                    this.wordIndex = 0;
                    this.lineIndex += 1;
                }
            }

        } else {
            // empty everything when the end of the transcript has been reached
            this.line = [];
            this.setState({ currWord: null })
        }

    }

    render() {

        var audioEvent;
        var buttonText;
        // change the text in the audio button depending on its state
        if (this.state.playing) {
            audioEvent = this.pauseAudio;
            buttonText = "Pause";
        } else {
            audioEvent = this.playAudio;
            buttonText = "Play";
        }
        return (
            <React.Fragment>
            <div className="d-flex flex-column">
                <audio
                    id="audio"
                    ref={this.audioRef}
                    src={this.props.location.state.audio}
                    type="audio/mpeg"
                    preload="auto"
                    onPlaying={this.playing}
                    onPause={this.paused}
                    onEnded={this.ended}
                />

                <div id="audioControls">
                    <button onClick={audioEvent}>{buttonText}</button>
                    <p>{Math.floor(this.state.currentDuration / 60)}:
                    {('0' + (this.state.currentDuration.toFixed(0) % 60).toFixed(0)).slice(-2)}
                    - {this.state.totalDuration}</p>
                </div>
            </div>
                <div id="karaoke">
                    <video ref={this.videoRef} autoplay muted loop>
                        <source src="http://localhost:9000/video/video.mp4" />
                        Your browser does not support mp4 video.
                    </video>
                    <p>{this.line.map((word, i) => {
                        if (this.state.currWord >= i) {
                            return (<span key={i} className="wordDone">{word + " "}</span>)
                        } else {
                            return (<span key={i} className="wordNotDone">{word + " "}</span>)
                        }
                    })}
                    </p>
                </div>
                </React.Fragment>
        )
    }
}