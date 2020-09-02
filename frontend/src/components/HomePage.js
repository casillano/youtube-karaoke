import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "./css/styles.css";
const key = require('../secrets/secrets').key;

class HomePage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            youtubeLink:"https://www.youtube.com/watch?v=E-DRkixL3rA",
            error: ""
        }
        this.handleFocus = this.handleFocus.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleFocus(e) { e.target.select() };

    handleChange(e) {
        this.setState({youtubeLink: e.target.value});
    }

    _youtubeParser(url) {
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        var match = url.match(regExp);
        return (match&&match[7].length===11)? match[7] : false;
    }

    handleSubmit(e) {
        e.preventDefault();
        var url = this.state.youtubeLink;
        if (url.includes("www.youtube.com") || url.includes("youtu.be")) {
            var videoId = this._youtubeParser(this.state.youtubeLink);
            if (!videoId) {
                this.setState({error: "Invalid youtube link"});
            } else {
                fetch("https://www.googleapis.com/youtube/v3/videos?part=id,snippet" +
                `&id=${videoId}&key=${key}`)
                .then((response) => response.json())
                .then(data => {
                    if (data.items.length) {
                        // video exists, check if title matches required format
                        var title = data.items[0].snippet.title;
                        var titleRegExp = /[\w ]+ ?- ?[\w]+/;
                        if (titleRegExp.test(title)) {
                            // title matches required format, send api requests on next page
                            this.setState({error: ""});
                            this.props.history.push({
                                pathname: '/loading',
                                state: {link: url}
                            })
                        } else {
                            // title does not match requred format
                            this.setState({error: "Title does not match required format"});
                        }
                    } else {
                        // video does not exist
                        this.setState({error: "Video does not exist"})
                    }
                });
            }
        } else {
            this.setState({error: "Invalid link"});
        }


    }

    render() {
        return(
            <div className="homePage">
                <h1>Youtube Karaoke</h1>
                <div className="d-flex justify-content-center align-items-center">
                    <form id="linkForm" onSubmit={this.handleSubmit}>
                        <label htmlFor="youtubeLink">Paste youtube link here:</label>
                        <input type="text" name="youtubeLink"
                        className="youtubeLink"
                        size="43" 
                        value={this.state.youtubeLink}
                        onChange={this.handleChange}
                        onFocus={this.handleFocus} required/>
                        <p id="errorText">{this.state.error}</p>
                        <input className="submitButton"type="submit" value="Submit" />
                    </form>
                </div>
            </div>
        )
    }
}

export default HomePage;