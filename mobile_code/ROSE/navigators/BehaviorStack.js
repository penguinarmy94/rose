/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, {Component} from 'react';
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import BehaviorEditHomeScreen from "../screens/BehaviorEditHomeScreen";
import BehaviorAddScreen from "../screens/BehaviorAddScreen";


const behaviorNav = createSwitchNavigator(
    {
        BehaviorHome: { screen: BehaviorEditHomeScreen },
        BehaviorAdd: { screen: BehaviorAddScreen },
    }, 
    {
        initialRouteName: "Main",
    }
);

const BehaviorContainer =  createAppContainer(behaviorNav);

export default class BehaviorStack extends Component {
  render() {
    return <BehaviorContainer />
  }
}
