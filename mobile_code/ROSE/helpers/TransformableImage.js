import React, {Component} from 'react';
import {Image} from 'react-native';

export default class TransformableImage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <Image style={this.props.style} source={this.props.source} />
        );
    }
}