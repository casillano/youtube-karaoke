import React from "react";
import Lottie from "react-lottie";
import "bootstrap/dist/css/bootstrap.css";

export default class loadingInformation extends React.PureComponent {

    render () {
        // render the loading animation when the fetch is ready
        if (this.props.ready) {
            if (!this.props.done) {
                // render the proper animation depending on the state of the fetch
                if (!this.props.error) {
                    return (
                        <React.Fragment>
                            <h1>{this.props.info}</h1>
                            <Lottie options={this.props.loadingAnimationOptions} height={120} width={120} />
                        </React.Fragment>
                    )
                } else {
                    return (
                        <React.Fragment>
                            <h1>{this.props.info}</h1>
                            <Lottie options={this.props.errorAnimationOptions} height={120} width={120} />
                        </React.Fragment>
                    )
                }
            } else {
                return (
                    <React.Fragment>
                        <h1>{this.props.info}</h1>
                        <Lottie options={this.props.doneAnimationOptions} height={120} width={120} />
                    </React.Fragment>
                )
            } 
        } else {
            return null;
        }
    }
}