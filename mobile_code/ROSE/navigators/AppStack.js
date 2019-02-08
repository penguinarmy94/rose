/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import LoginStack from '../navigators/LoginStack';
import LandingStack from '../navigators/LandingStack';
import LoadingScreen from '../screens/LoadingScreen';


const appNav = createSwitchNavigator(
    {
        Main: { screen: LoginStack },
        Home: { screen: LandingStack },
        Loading: { screen: LoadingScreen }
    }, 
    {
        initialRouteName: "Main"
    }
);

const AppContainer =  createAppContainer(appNav);

export default class AppStack extends Component {
  render() {
    return <AppContainer />
  }
}
