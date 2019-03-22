import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator} from 'react-native';

export default class Loader extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={{flex:1, alignItems: "center", justifyContent: "center"}}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>{this.props.text}</Text>
            </View>
        );
    }
}