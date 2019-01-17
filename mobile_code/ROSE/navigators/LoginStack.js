/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';


const loginNav = createSwitchNavigator(
    {
        Login: { screen: LoginScreen },
        Register: { screen: RegisterScreen },
    }, 
    {
        initialRouteName: "Login",
        backBehavior: "none",
        //headerMode: 'none',
        navigationOptions: {
            headerVisible: true,
            headerTitle: 'this is a title'
        }
    }
);

const LoginContainer =  createAppContainer(loginNav);

export default class LoginStack extends Component {
  render() {
    return <LoginContainer screenProps={{ rootNav: this.props.navigation }}/>
  }
}
