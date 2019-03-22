import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import Loader from '../helpers/Loader';

export default class LoadingScreen extends Component {

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
            <Loader text="Waiting for new robot to load" />
        );
    }
}