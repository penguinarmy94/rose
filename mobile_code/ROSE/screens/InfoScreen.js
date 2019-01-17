import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TextInput, Image, Button} from 'react-native';
import firebase from 'react-native-firebase';
import NotificationManager from '../controllers/NotificationManager';

export default class InfoScreen extends Component {
  constructor(props) {
    super(props);
    this.users = firebase.firestore().collection('Users');
    this.state = { username: null, password: null, power: "ON", color: "green"};
    this.authenticate = this.authenticate.bind(this);
    this.changePowerOption = this.changePowerOption.bind(this);
  }

  authenticate() {
    
  }

  changePowerOption() {
    let data = this.state;

    if(data.power == "ON") {
      data.power = "OFF";
      data.color = "red";
    }
    else {
      data.power = "ON";
      data.color = "green";
    }

    this.setState(data);
    //this.props.navigation.navigate("Register");
  }

  render() {
    return(
      <View style={styles.container}>
        <Text style={[{ color: this.state.color}]}>{this.state.power}</Text>
        <Button title="Power" onPress={this.changePowerOption} />
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
