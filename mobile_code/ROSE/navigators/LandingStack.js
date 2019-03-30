/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {createMaterialTopTabNavigator, createAppContainer} from 'react-navigation';
import InfoStack from '../navigators/InfoStack';
import ImageStack from '../navigators/ImageStack';
import SettingsStack from '../navigators/SettingsStack';
import LogoffScreen from '../screens/LogoffScreen';


const landingNav = createMaterialTopTabNavigator(
    {
        Info: InfoStack,
        Images: ImageStack,
        Settings: SettingsStack,
        Logoff: LogoffScreen,
    }, 
    {
        tabBarOptions: {
            activeTintColor: '#64a2b7',
            labelStyle: {
              fontSize: 10
            },
            inactiveTintColor: 'black',
            style: {
              backgroundColor: "white"
            },
            indicatorStyle: {
              backgroundColor: "#64a2b7"
            },
            showIcon: true
        },
        lazy: true,
        initialRouteName: "Info",
        tabBarPosition: "bottom",
        swipeEnabled: false,
        animationEnabled: false,
        order: ["Info", "Images", "Settings", "Logoff"]
    }
);

const LandingContainer =  createAppContainer(landingNav);

export default class LandingStack extends Component {
  render() {
    return <LandingContainer screenProps={{ rootNav: this.props.navigation, data: this.props.navigation.getParam("sessionVar", "none") }} />
  }
}
