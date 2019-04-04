import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator} from 'react-native';

export default class Loader extends Component {

    constructor(props) {
        super(props);

        if(!this.props.color) {
            this.props.color = "black";
        }
    }

    render() {
        if (!this.props.style && !this.props.text) {
            return(
                <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                    <ActivityIndicator size="large" color={this.props.color}/>
                </View>
            );
        }
        else if (!this.props.style) {
            return(
                <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                    <ActivityIndicator size="large" color={this.props.color} />
                    <Text>{this.props.text}</Text>
                </View>
            );
        }
        else if (!this.props.text) {
            return(
                <View style={this.props.style}>
                    <ActivityIndicator size="large" color={this.props.color} />
                </View>
            );
        }
        else {
            return(
                <View style={this.props.style}>
                    <ActivityIndicator size="large" color={this.props.color} />
                    <Text>{this.props.text}</Text>
                </View>
            );
        }
    }
}