import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import { Icon } from 'react-native-elements';
import { config } from "../assets/config/config";
import { StackActions, NavigationActions } from 'react-navigation';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

export default class LoadingScreen extends Component {

    componentDidMount() {
        setTimeout(() => {
            this.props.navigation.navigate("Home");
        }, 3000);
    }

    render() {
        return(
            <View style={{flex:1, alignItems: "center", justifyContent: "center"}}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading New Robot</Text>
            </View>
        );
    }
}