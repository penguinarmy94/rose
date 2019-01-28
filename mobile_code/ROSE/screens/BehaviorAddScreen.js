import React, { Component } from 'react';
import { View, Text } from 'react-native';

export default class BehaviorAddScreen extends Component {
    constructor(props) {
        super(props);

        /*
        this._actionRef.get().then((snapshot) => {
            let actionList = [];
            snapshot.forEach((doc) => {
                actionList.push(doc.data());
            });
            return actionList;
        }).catch((error) => {
            alert("No actions available");
        });
        */
    }

    render() {
        return(
            <View style={{flex: 1, justifyContents: "center"}}>
                <Text>You are now in the BehaviorAdd Screen</Text>
            </View>
        );
    }
}