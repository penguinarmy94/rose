import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TextInput, Image, Button} from 'react-native';
import firebase from 'react-native-firebase';
import NotificationManager from '../controllers/NotificationManager';
import Session from '../controllers/Session';
import User from '../controllers/User';

let isMounted = false;

export default class InfoScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: 0,
      battery: 0,
      connection: 0,
      charging: false,
      idle: "none",
      detect: "none",
      recordings: 0,
      connectionColor: "green",
      batteryColor: "green"
    };

    this.session = this.props.screenProps.data;
    isMounted = true;

    alert("Welcome back!");

    this.session.createUser().then((user) => {
      if(user.exists) {
        this.session.setUser(new User(user.data()));
        this.robotSnapshot = this.session.currentRobot().onSnapshot((robot) => {
          if(robot.exists && isMounted) {
            let idle = robot.data().idle_behavior;
            let detect = robot.data().detect_behavior;
            this.currentRobot = robot.data();
            this.currentRobot.idle_behavior = "";
            this.currentRobot.detect_behavior = "";

            idle.get().then((doc) => { 
              if(doc.exists && isMounted) { 
                this.currentRobot.idle_behavior = doc.data().name;
                this.updateInfo();
              }
            }).catch((error) => {
              alert(error);
            });

            detect.get().then((doc) => {
              if(doc.exists && isMounted) {
                this.currentRobot.detect_behavior = doc.data().name;
                this.updateInfo();
              }
            }).catch((error) => {
              alert(error);
            });

          }
        });
      }
    }).catch((error) => {
      alert(error);
    });
  }

  componentWillUnmount = () => {
    this.isMounted = false;
    this.robotSnapshot();
  }

  updateInfo = () => {
    let current = this.state;
    let robot = this.currentRobot;

    current.id = robot.id;
    current.battery = robot.battery;
    current.batteryColor = robot.battery > 40 ? "green" : "red";
    current.connection = robot.connection;
    current.connectionColor = robot.connection > 2 ? "green" : "red";
    current.charging = robot.charging ? "yes" : "no";
    current.idle = robot.idle_behavior;
    current.detect = robot.detect_behavior; 
    current.recordings = robot.num_of_videos;

    this.setState(current);
  }

  render() {
    return(
      <View style={styles.container}>
        <Text style={[]}>ID: {this.state.id}</Text>
        <Text style={[{ color: this.state.batteryColor}]}>Battery Level: {this.state.battery}</Text>
        <Text style={[{ color: this.state.connectionColor}]}>Wireless Connection Level: {this.state.connection}</Text>
        <Text style={[]}>Charging: {this.state.charging}</Text>
        <Text style={[]}>Idle Behavior: {this.state.idle}</Text>
        <Text style={[]}>Detect Behavior: {this.state.detect}</Text>
        <Text style={[]}>Number of Recordings: {this.state.recordings}</Text>
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
