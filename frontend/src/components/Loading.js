import React from "react";
import FadeIn from "react-fade-in";
import "bootstrap/dist/css/bootstrap.css";
import * as loadingAnimation from "../animations/loadingAnimation.json";
import * as doneLoading from "../animations/done.json";
import * as errorLoading from "../animations/error.json";
import LoadingInformation from "./loadingInformation";
import { Redirect } from "react-router-dom";

// options for the animations
const loadingAnimationOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation.default,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
    }
}

const errorAnimationOptions = {
    loop: false,
    autoplay: true,
    animationData: errorLoading.default,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
    }
}

const doneAnimationOptions = {
    loop: false,
    autoplay: true,
    animationData: doneLoading.default,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
    }
}

export default class Loading extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            audioDone: false,
            audioError: false,
            lyricsDone: false,
            lyricsError: false,
            alignerDone: false,
            alignerError: false,
            doneAll: false
        }

        this.audio = null;
        this.transcript = null;
        this.alignedText = null;

        this.fetchLyricsOrAudio = this.fetchLyricsOrAudio.bind(this);
    }

    componentDidMount() {
        this.fetchLyricsOrAudio("lyrics")
            .then(response => {
                if (response.status === 200) {
                    this.setState({ lyricsDone: true });
                } else {
                    this.setState({ lyricsError: true });
                    throw new Error("Error fetching lyrics");
                }
            })
            .then(devnull => this.fetchLyricsOrAudio("audio"))
            .then(response => {
                if (response.status === 200) {
                    this.setState({ audioDone: true })
                } else {
                    this.setState({ audioError: true });
                    throw new Error("Error fetching audio");
                }
            })
            .then(devnull => this.fetchAligner())
            .then(response => {
                if (response.status === 200) {
                    this.setState({ alignerDone: true })
                    setTimeout(() => {
                        this.setState({doneAll : true})
                    }, 1500);
                } else {
                    this.setState({ alignerError: true });
                    throw new Error("Error fetching aligner");
                }
            })
            .catch(error => {
                this.setState({
                    lyricsError: this.state.lyricsDone ? false : true,
                    audioError: this.state.audioDone ? false : true,
                    alignerError: this.state.alignerDone ? false : true
                })
                console.log(error.message);
            })
    }


    async fetchAligner() {
        var response = await fetch('http://localhost:9000/api/aligner', {
            method: 'POST'
        })
        return response;
    }

    async fetchLyricsOrAudio(option) {
        var response = await fetch(`http://localhost:9000/api/${option}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `url=${this.props.location.state.link}`
        })
        return response;

    }

    render() {

        if (this.state.doneAll) {
            return <Redirect to={{
                pathname: "/karaoke"
            }}/>
        }

        return (
            <div>
                <FadeIn>
                    <div class="d-flex justify-content-center align-items-center">
                        <LoadingInformation
                            info="fetching lyrics"
                            ready={true}
                            done={this.state.lyricsDone}
                            error={this.state.lyricsError}
                            loadingAnimationOptions={loadingAnimationOptions}
                            doneAnimationOptions={doneAnimationOptions}
                            errorAnimationOptions={errorAnimationOptions} />
                    </div>
                </FadeIn>

                <FadeIn>
                    <div class="d-flex justify-content-center align-items-center">
                        <LoadingInformation
                            info="fetching audio"
                            ready={this.state.lyricsDone}
                            done={this.state.audioDone}
                            error={this.state.audioError}
                            loadingAnimationOptions={loadingAnimationOptions}
                            doneAnimationOptions={doneAnimationOptions}
                            errorAnimationOptions={errorAnimationOptions} />
                    </div>
                </FadeIn>

                <FadeIn>
                    <div class="d-flex justify-content-center align-items-center">
                        <LoadingInformation
                            info="aligning lyrics"
                            ready={this.state.lyricsDone && this.state.audioDone}
                            done={this.state.alignerDone}
                            error={this.state.alignerError}
                            loadingAnimationOptions={loadingAnimationOptions}
                            doneAnimationOptions={doneAnimationOptions}
                            errorAnimationOptions={errorAnimationOptions} />
                    </div>
                </FadeIn>
            </div>

        )
    }
}