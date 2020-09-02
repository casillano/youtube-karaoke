import React from 'react';

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
            prevWordFinished: true
        };

        this.playing = this.playing.bind(this);
        this.paused = this.paused.bind(this);

        this.index = 0;
        this.index2 = 0;
        this.wordIndex = 0;
        this.line = [];

    }

    playing() {
        if (!this.state.started) {
            this.setState({ startTime: Date.now() });
        }
        var delay = this.state.remainingTime;
        setTimeout(() => {
            var newDuration = parseFloat(this.state.currentDuration + parseFloat(0.01));
            this.setState({ currentDuration: newDuration, remainingTime: 0 });
            this.karaokeText();
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
        var remainingTime = Math.round((currTime % 0.01) * 1000)
        if (remainingTime > 0) {
            this.setState({ remainingTime: remainingTime })
        }
    }

    karaokeText() {

        // var floorTime = Math.floor((this.state.currentDuration + 0.00001) * 100) / 100;
        // var ceilTime = Math.ceil((this.state.currentDuration + 0.00001) * 100) / 100;

        if (this.index2 < this.props.location.state.transcript.length) {
            this.line = this.props.location.state.transcript[this.index2];
            if (this.state.prevWordFinished) {
                var wordInfo = this.props.location.state.alignedText[this.index];
                if (wordInfo.case === "success") {
                    // var wordTime = Math.round((wordInfo.start + 0.00001) * 100) / 100
                    if ((wordInfo.start - this.state.currentDuration) < Number.EPSILON) {

                        console.log(this.line[this.wordIndex]);
                        console.log(this.index2)
                        this.setState({ currWord: this.wordIndex, prevWordFinished: false })
                        this.index += 1;
                        this.wordIndex += 1;
                    }
                } else {
                    console.log(this.line[this.wordIndex]);
                    console.log(this.index2)
                    this.setState({ currWord: this.wordIndex });
                    this.index += 1;
                    this.wordIndex += 1;
                }
            } else {
                if ((this.props.location.state.alignedText[this.index - 1].end - this.state.currentDuration) < Number.EPSILON) {
                    this.setState({ prevWordFinished: true });
                }
            }

            if (this.wordIndex >= this.line.length) {
                var lastWord = this.props.location.state.alignedText[this.index - 1];
                if (lastWord.case === "success") {
                    //var lastWordTime = Math.round((lastWord.end + 0.00001) * 100) / 100;
                    if ((lastWord.end - this.state.currentDuration) < Number.EPSILON) {
                        this.setState({ currWord: -1 })
                        this.wordIndex = 0;
                        this.index2 += 1;
                    }
                } else {
                    this.setState({ currWord: -1 })
                    this.wordIndex = 0;
                    this.index2 += 1;
                }
            }

        } else {
            this.line = [];
            this.setState({ currWord: null })
        }

    }

    render() {

        return (
            <React.Fragment>
                <audio
                    controls="controls"
                    src={this.props.location.state.audio}
                    type="audio/mpeg"
                    preload="auto"
                    onPlaying={this.playing}
                    onPause={this.paused}
                    onEnded={() => {
                        this.setState({ currentDuration: parseFloat(0) })
                    }}
                />
                <p>{this.line.map((word, i) => {
                    if (this.state.currWord >= i) {
                        return (<span key={i} style={{ color: 'red' }}>{word + " "}</span>)
                    } else {
                        return (<span key={i}>{word + " "}</span>)
                    }
                })}
                </p>
            </React.Fragment>
        )
    }
}