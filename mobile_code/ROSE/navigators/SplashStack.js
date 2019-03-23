/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import AppStack from '../navigators/AppStack';
import SplashScreen from '../screens/SplashScreen';


const splashNav = createSwitchNavigator(
    {
        Splash: { screen: SplashScreen },
        Home: { screen: AppStack }
    }, 
    {
        initialRouteName: "Splash"
    }
);

const SplashContainer =  createAppContainer(splashNav);

export default class SplashStack extends Component {
  render() {
    return <SplashContainer />
  }
}
