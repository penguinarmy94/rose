/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import { Icon } from 'react-native-elements';
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import SettingsHomeStack from '../navigators/SettingsHomeStack';
import AddRobotStack from '../navigators/AddRobotStack';
import ChangeRobotStack from '../navigators/ChangeRobotStack';
import BehaviorStack from '../navigators/BehaviorStack';
import { config } from '../assets/config/config';


const settingsNav = createSwitchNavigator(
    {
        SettingsHome: { screen: SettingsHomeStack },
        AddRobot: { screen: AddRobotStack },
        ChangeRobot: { screen: ChangeRobotStack },
        Behaviors: { screen: BehaviorStack }
    }, 
    {
        initialRouteName: "SettingsHome",
        headerMode: "screen"
    }
);

const SettingsContainer =  createAppContainer(settingsNav);

export default class SettingsStack extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarOnPress: ({navigation, defaultHandler}) => {
            navigation.setParams({headerTitle: config.headerTitle});
            defaultHandler();
        },
        tabBarIcon: ({tintColor}) => {
            return(<Icon color={tintColor} type="material-community" name="settings-outline" />);
        }
    });

  render() {
    return <SettingsContainer screenProps={{rootNav: this.props.screenProps.rootNav, parentNav: this.props.navigation}} />
  }
}
