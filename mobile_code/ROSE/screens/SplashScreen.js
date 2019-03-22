import React, { Component } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator} from 'react-native';

const image = require('../assets/images/logo.png');
export default class SplashScreen extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        setTimeout(() => {
            this.props.navigation.navigate("Home");
        }, 3000);
    }

    render() {
        return(
            <View style={{backgroundColor: "#BDE7B0", flex: 1, alignItems: "center", justifyContent: "center"}}>
                <Image source={image} />
            </View>
        );
    }
}