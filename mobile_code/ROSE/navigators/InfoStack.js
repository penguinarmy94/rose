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
    }
);

const InfoContainer =  createAppContainer(infoNav);

export default class InfoStack extends Component {
  static navigationOptions = ({navigation}) => {
    return({
      tabBarIcon: ({tintColor}) => {
        return(<Icon color={tintColor} type="material-community" name="information-outline" />);
    }
    });
   }

  render() {
    return <InfoContainer screenProps={{rootNav: this.props.screenProps.rootNav, data: this.props.screenProps.data}} />
  }
}
