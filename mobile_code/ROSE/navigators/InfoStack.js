/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import {Icon} from 'react-native-elements';
import InfoScreen from '../screens/InfoScreen';


const infoNav = createStackNavigator(
    {
        InfoHome: { screen: InfoScreen },
    }, 
    {
        initialRouteName: "InfoHome",
        headerMode: "screen"
    }
);

const InfoContainer =  createAppContainer(infoNav);

export default class InfoStack extends Component {
  static navigationOptions = ({nav}) => ({
    tabBarOnPress: ({navigation, defaultHandler}) => {

      defaultHandler();
    },
    tabBarIcon: ({tintColor}) => {
        return(<Icon color={tintColor} type="material-community" name="information-outline" />);
    },
    swipeEnabled: false
   });

  render() {
    return <InfoContainer screenProps={{rootNav: this.props.screenProps.rootNav, data: this.props.screenProps.data}} />
  }
}
