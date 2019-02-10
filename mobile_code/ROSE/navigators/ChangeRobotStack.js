
import React, {Component} from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import ChangeRobotScreen from '../screens/ChangeRobotScreen';


const changeRobotNav = createStackNavigator(
    {
        ChangeRobotHome: { screen: ChangeRobotScreen },
    }, 
    {
        initialRouteName: "ChangeRobotHome",
    }
);

const ChangeRobotContainer =  createAppContainer(changeRobotNav);

export default class ChangeRobotStack extends Component {
  render() {
    return <ChangeRobotContainer screenProps={{rootNav: this.props.screenProps.rootNav, parentNav: this.props.navigation}} />
  }
}
