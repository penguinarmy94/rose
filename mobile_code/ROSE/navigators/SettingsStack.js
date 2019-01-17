/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';


const settingsNav = createStackNavigator(
    {
        Login: {screen: LoginScreen, navigationOptions: {headerLeft: null}},
        Register: {screen: RegisterScreen},
    }, 
    {
        initialRouteName: "Login",
        backBehavior: "none",
        headerMode: 'none',
        navigationOptions: {
            headerVisible: false,
        }
    }
);

const SettingsContainer =  createAppContainer(settingsNav);

export default class SettingsStack extends Component {
  render() {
    return <SettingsContainer />
  }
}
