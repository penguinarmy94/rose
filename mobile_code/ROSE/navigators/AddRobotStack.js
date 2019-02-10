
import React, {Component} from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import AddRobotScreen from '../screens/AddRobotScreen';


const addRobotNav = createStackNavigator(
    {
        AddHome: { screen: AddRobotScreen },
    }, 
    {
        initialRouteName: "AddHome",
    }
);

const AddContainer =  createAppContainer(addRobotNav);

export default class InfoStack extends Component {
  render() {
    return <AddContainer screenProps={{rootNav: this.props.screenProps.rootNav, parentNav: this.props.navigation}} />
  }
}
