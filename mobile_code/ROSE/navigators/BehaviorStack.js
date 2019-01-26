/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, {Component} from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import BehaviorEditHomeScreen from "../screens/BehaviorEditHomeScreen";
import BehaviorAddScreen from "../screens/BehaviorAddScreen";


const behaviorNav = createStackNavigator(
    {
        BehaviorHome: { screen: BehaviorEditHomeScreen },
        BehaviorAdd: { screen: BehaviorAddScreen },
    }, 
    {
        initialRouteName: "BehaviorHome",
    }
);

const BehaviorContainer =  createAppContainer(behaviorNav);

export default class BehaviorStack extends Component {
  render() {
    return <BehaviorContainer screenProps={{rootNav: this.props.screenProps.rootNav, parentNav: this.props.navigation}} />
  }
}
