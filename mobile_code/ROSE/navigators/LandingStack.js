/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {createBottomTabNavigator, createAppContainer} from 'react-navigation';
import InfoStack from '../navigators/InfoStack';
import VideoStack from '../navigators/VideoStack';
import SettingsStack from '../navigators/SettingsStack';
import LogoffScreen from '../screens/LogoffScreen';


const landingNav = createBottomTabNavigator(
    {
        Info: InfoStack,
        Videos: VideoStack,
        Settings: SettingsStack,
        Logoff: LogoffScreen,
    }, 
    {
        tabBarOptions: {
            activeTintColor: 'blue',
            inactiveTintColor: 'gray',
        },
        initialRouteName: "Info",
        backBehavior: "none",
    }
);

const LandingContainer =  createAppContainer(landingNav);

export default class LandingStack extends Component {
  render() {
    return <LandingContainer screenProps={{ rootNav: this.props.navigation, data: this.props.navigation.getParam("sessionVar", "none") }} />
  }
}
