import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, Button} from 'react-native';
import firebase from 'react-native-firebase';

let logout_message = "Are you sure you want to logout?";

export default class LogoffScreen extends Component {
  constructor(props) {
    super(props);
  }

  logout = () => {
      firebase.auth().signOut().then(() => {
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
      <View style={styles.container}>
        <Text style={styles.welcome}>{logout_message}</Text>
        <Button title="Logout" onPress={this.logout} />
        <Button title="Debug Logout" onPress={this.debugLogout} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5FCFF',
    },
    welcome: {
      fontSize: 20,
      textAlign: 'center',
      margin: 10,
    },
    instructions: {
      textAlign: 'center',
      color: '#333333',
      marginBottom: 5,
    },
  });
