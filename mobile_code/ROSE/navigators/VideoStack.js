/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import VideoScreen from '../screens/VideoScreen';
import { config } from "../assets/config/config";


const videoNav = createStackNavigator(
    {
        VideoHome: { screen: VideoScreen },
    }, 
    {
        initialRouteName: "VideoHome",
    }
);

const VideoContainer =  createAppContainer(videoNav);

export default class VideoStack extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarOnPress: ({navigation, defaultHandler}) => {
            navigation.setParams({headerTitle: config.headerTitle});
            defaultHandler();
        }
    });

    render() {
        return <VideoContainer screenProps={{rootNav: this.props.screenProps.rootNav, data: this.props.screenProps.data}} />
    }
}
