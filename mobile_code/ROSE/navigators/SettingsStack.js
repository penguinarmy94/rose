/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import SettingsScreen from '../screens/SettingsScreen';
import AddRobotScreen from '../screens/AddRobotScreen';
import ChangeRobotScreen from '../screens/ChangeRobotScreen';
import BehaviorStack from '../navigators/BehaviorStack';
import { config } from '../assets/config/config';


const settingsNav = createStackNavigator(
    {
        SettingsHome: { screen: SettingsScreen },
        //AddRobot: { screen: AddRobotScreen },
        //ChangeRobot: { screen: ChangeRobotScreen },
        //Behaviors: { screen: BehaviorStack }
    }, 
    {
        initialRouteName: "SettingsHome",
    }
);

const SettingsContainer =  createAppContainer(settingsNav);

export default class SettingsStack extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarOnPress: ({navigation, defaultHandler}) => {
            navigation.setParams({headerTitle: config.headerTitle});
            defaultHandler();
        }
    });

  render() {
    return <SettingsContainer screenProps={{rootNav: this.props.screenProps.rootNav}} />
  }
}
