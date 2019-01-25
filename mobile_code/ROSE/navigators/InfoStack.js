/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import InfoScreen from '../screens/InfoScreen';


const infoNav = createStackNavigator(
    {
        InfoHome: { screen: InfoScreen },
    }, 
    {
        initialRouteName: "InfoHome",
    }
);

const InfoContainer =  createAppContainer(infoNav);

export default class InfoStack extends Component {
  render() {
    return <InfoContainer screenProps={{rootNav: this.props.screenProps.rootNav, data: this.props.screenProps.data}} />
  }
}
