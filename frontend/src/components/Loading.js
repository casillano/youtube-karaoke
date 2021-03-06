import React from "react";
import FadeIn from "react-fade-in";
import "bootstrap/dist/css/bootstrap.css";
import * as loadingAnimation from "../animations/loadingAnimation.json";
import * as doneLoading from "../animations/done.json";
import * as errorLoading from "../animations/error.json";
import LoadingInformation from "./loadingInformation";
import { Redirect } from "react-router-dom";
import uuid from "react-uuid";

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
            doneAll: false,
            errorMessage: "",
        }
        this.uuid = uuid();
        this.audio = null;
        this.transcript = null;
        this.alignedText = null;
        this.controller = new AbortController();
        this.fetchLyricsOrAudio = this.fetchLyricsOrAudio.bind(this);
    }


    componentDidMount() {

        // fetch the files from the backend
        this.fetchLyricsOrAudio("lyrics")
            .then(response => {
                if (response.status === 200) {
                    this.setState({ lyricsDone: true });
                    return response.text();
                } else {
                    this.setState({ lyricsError: true });
                    throw new Error("Error fetching lyrics");
                }
            })
            .then((text) => {
                // split the transcript into a list of lines and remove all 
                // empty lines
                var wordLst = text.split('\n');
                for (var i = wordLst.length - 1; i >= 0; i--) {
                    if (wordLst[i] === "") {
                        wordLst.splice(i, 1);
                    } else {
                        wordLst[i] = wordLst[i].split(/-| /);
                    }
                }
                this.transcript = wordLst;
            })
            .then(devnull => this.fetchLyricsOrAudio("audio"))
            .then(response => {
                if (response.status === 200) {
                    this.setState({ audioDone: true });
                    return response.blob();
                } else {
                    this.setState({ audioError: true });
                    throw new Error("Error fetching audio");
                }
            })
            .then((myBlob) => {
                this.audio = URL.createObjectURL(myBlob);
            })
            .then(devnull => this.fetchAligner())
            .then(response => {
                if (response.status === 200) {
                    this.setState({ alignerDone: true })
                    return response.json();
                } else {
                    this.setState({ alignerError: true });
                    throw new Error("Error fetching aligner");
                }
            }).then((jsonText) => {
                this.alignedText = jsonText.words;
                setTimeout(() => {
                    this.setState({ doneAll: true })
                }, 1000);

            })
            .catch(error => {
                // update the loading icons depending on which fetch returned
                // and error
                this.setState({
                    lyricsError: this.state.lyricsDone ? false : true,
                    audioError: this.state.audioDone ? false : true,
                    alignerError: this.state.alignerDone ? false : true,
                    errorMessage: error.message
                })
                // go back to the home page
                setTimeout(() => {
                    this.props.history.goBack();
                }, 3500)
            })
    }

    async fetchAligner() {
        var response = await fetch(`http://localhost:9000/api/aligner/${this.uuid}`, {
            method: 'POST'
        })
        return response;
    }

    async fetchLyricsOrAudio(option) {
        var response = await fetch(`http://localhost:9000/api/${option}/${this.uuid}`, {
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
                pathname: "/karaoke",
                state: {
                    audio: this.audio,
                    transcript: this.transcript,
                    alignedText: this.alignedText
                }
            }} />
        }

        return (
            <div>
                <FadeIn>
                    <div className="d-flex justify-content-center align-items-center">
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
                    <div className="d-flex justify-content-center align-items-center">
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

                <h4>{this.state.errorMessage}</h4>
            </div>

        )
    }
}