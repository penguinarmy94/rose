import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, Button, Alert} from 'react-native';
import { Icon } from 'react-native-elements';
import firebase from 'react-native-firebase';
import { config } from '../assets/config/config';

let logout_message = "Are you sure you want to logout?";

export default class LogoffScreen extends Component {
  static navigationOptions = ({navigation}) => {
    return({
      tabBarIcon: ({focused, tintColor}) => {
        return(<Icon color={tintColor} type="material-community" name="logout" />);
      },
      tabBarOnPress: ({navigation, defaultHandler}) => {
        Alert.alert(
          'Logout',
          "Are you sure you want to log out?",
          [
              {text: 'Yes', onPress: () => {
                defaultHandler();
              }},
              {text: 'No', onPress: () => {}}
          ]
        );
      }
    });
   }

  constructor(props) {
    super(props);
    //this.debugLogout();
    this.logout();
  }

  logout = () => {
      firebase.auth().signOut().then(() => {
        config.session = null;
        config.robotSnapshot();
        config.robotSnapshot = null;
        this.props.screenProps.rootNav.navigate("Main");
        alert("You have been signed out!");
      }).catch((error) => {
        alert(error.message);
      }); 
  }

  debugLogout = () => {
    this.props.screenProps.rootNav.navigate("Main");
    alert("You have been signed out!");
  }

  render() {
    return(
      <View></View>
    );
  }
}