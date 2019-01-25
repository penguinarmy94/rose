import React, { Component } from 'react';
import { View, Text } from 'react-native';

export default class BehaviorAddScreen extends Component {
    render() {
        return(
            <View style={{flex: 1, justifyContents: "center"}}>
                <Text>You are now in the BehaviorAdd Screen</Text>
            </View>
        );
    }
}