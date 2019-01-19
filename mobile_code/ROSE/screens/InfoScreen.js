import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TextInput, Image, Button} from 'react-native';
import firebase from 'react-native-firebase';
import NotificationManager from '../controllers/NotificationManager';
import Session from '../controllers/Session';
import User from '../controllers/User';

export default class InfoScreen extends Component {
  constructor(props) {
    super(props);

    this.updateInfo = this.updateInfo.bind(this);
    //this.changePowerOption = this.changePowerOption.bind(this);

    let id = this.props.screenProps.data;
    this.session = new Session(id);
  }

  updateInfo() {
    let current = this.state;
    let robot = this.session.currentRobot();

    current.id = 0;
    current.battery = robot.battery;
    current.connection = robot.connection;
    current.charging = robot.charging ? "yes" : "no";
    current.idle = "" //robot.idle_behavior;
    current.detect = "" //robot.detect_behavior;
    current.recordings = robot.num_of_videos;

    alert(JSON.stringify(current));

    this.setState(current);
  }

  render() {
    return(
      <View style={styles.container}>
        <Text style={[{ color: this.state.color}]}>ID: {this.state.id}</Text>
        <Text style={[{ color: this.state.color}]}>Battery Level: {this.state.battery}</Text>
        <Text style={[{ color: this.state.color}]}>Wireless Connection Level: {this.state.connection}</Text>
        <Text style={[{ color: this.state.color}]}>Charging: {this.state.charging}</Text>
        <Text style={[{ color: this.state.color}]}>Idle Behavior: {this.state.idle}</Text>
        <Text style={[{ color: this.state.color}]}>Detect Behavior: {this.state.detect}</Text>
        <Text style={[{ color: this.state.color}]}>Number of Recordings: {this.state.recordings}</Text>
        <Button title="update" onPress={this.updateInfo} />
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
