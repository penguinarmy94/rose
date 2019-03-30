import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import Loader from '../helpers/Loader';

export default class LoadingScreen extends Component {

    constructor(props) {
        super(props);

    }

    componentDidMount() {
        this.props.navigation.navigate("Home");
    }

    render() {
       return(<View></View>);
    }
}