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
            text: null,
            currWord: ""
        };

        this.playing = this.playing.bind(this);
        this.paused = this.paused.bind(this);

        this.index = 0;
        this.index2 = 0;
        this.wordIndex = 0;
        this.line = "";
        this.display = "";

    }

    playing() {
        if (!this.state.started) {
            this.setState({startTime: Date.now()});
        }
            var delay = this.state.remainingTime;
            setTimeout(() => {
                var newDuration = parseFloat(this.state.currentDuration + parseFloat(0.01));
                this.setState({currentDuration: newDuration, remainingTime: 0});
                this.karaokeText();
                var intervalId = setInterval(() => {
                    var newDuration = parseFloat(this.state.currentDuration + parseFloat(0.01));
                    this.setState({currentDuration: newDuration});
                    this.karaokeText();
                }, 10);
                this.setState({intervalId: intervalId});
            }, delay)

    }

    paused() {
        if (this.state.intervalId) {
            clearInterval(this.state.intervalId);
            this.setState({intervalId: null})
        }
        var currTime = Date.now() - this.state.startTime;
        var remainingTime = Math.round((currTime % 0.01) * 1000)
        if (remainingTime > 0) {
            this.setState({remainingTime: remainingTime})
        }
    }

    karaokeText() {
        this.line = this.props.location.state.transcript[this.index2];
        this.display = this.line.join(" ");
        var wordInfo = this.props.location.state.alignedText[this.index];
        if (wordInfo.case === "success") {
            if (this.state.currentDuration.toFixed(2) === wordInfo.start.toFixed(2)) {
                this.setState({currWord: wordInfo.word})
                this.index += 1;
                this.wordIndex += 1;
            }
        } else {
            this.setState({currWord: wordInfo.word});
            this.index += 1;
            this.wordIndex += 1;
        }

        if (this.wordIndex === this.line.length) {
            this.wordIndex = 0;
            this.index2 += 1;
        }
    }

    render() {

        return (
            <React.Fragment>
                <h1>{this.state.currentDuration.toFixed(2)}</h1>
                <audio
                    controls="controls"
                    src={this.props.location.state.audio}
                    type="audio/mpeg"
                    preload="auto"
                    onPlaying={this.playing}
                    onPause={this.paused}
                    onEnded={() => {
                        this.setState({currentDuration: parseFloat(0)})
                    }}
                />
                <p>{this.display}</p>
            </React.Fragment>
        )
    }
}