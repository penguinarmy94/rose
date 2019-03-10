import React, {Component} from 'react';
import { Platform, StyleSheet, Text, View, TextInput, Image } from 'react-native';
import { CheckBox } from 'react-native-elements';
import firebase from 'react-native-firebase';
import NotificationManager from '../controllers/NotificationManager';
import Session from '../controllers/Session';
import User from '../controllers/User';
import { config } from '../assets/config/config';

let isMounted = false;

export default class InfoScreen extends Component {

  static navigationOptions = ({navigation}) => {
    return({
      title: navigation.getParam("headerTitle", "No Robot Selected")
    });
  }

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
      batteryColor: "green",
      header: config.headerTitle,
      notificationsOn: false
    };

    this.notifier = new NotificationManager(this.state.id);

    if(config.session) {
      config.robotSnapshot();
      this.updateRobot();
    }
    else {
        config.session = this.props.screenProps.data;
        alert("Welcome back!");

        isMounted = true;

        config.session.createUser().then((user) => {
          if(user.exists) {
            config.session.setUser(new User(user));
            this.updateRobot();
          }
        }).catch((error) => {
          alert(error);
        });
    }
  }

  componentWillUnmount = () => {
    this.isMounted = false;
    config.robotSnapshot();
  }

  updateRobot = () => {
    config.robotSnapshot = config.session.currentRobot().onSnapshot((robot) => {
      if(robot.exists && isMounted) {
        let idle = robot.data().idle_behavior;
        let detect = robot.data().detect_behavior;
        this.currentRobot = {
          battery: robot.data().battery,
          charging: robot.data().charging,
          connection: robot.data().connection,
          detect_behavior: "",
          idle_behavior: "",
          id: robot.data().id,
          num_of_videos: robot.data().num_of_videos,
        };

        this.notifier.setTopic(robot.id);
        config.headerTitle = robot.data().name;
        config.robotObject = robot.data();
        this.props.navigation.setParams({headerTitle: config.headerTitle});


        idle.get().then((doc) => { 
          if(doc.exists && isMounted) { 
            this.currentRobot.idle_behavior = doc.data().name;
            config.session.setIdleBehavior(doc.data().name);
            this.updateInfo();
          }
        }).catch((error) => {
          alert(error);
        });

        detect.get().then((doc) => {
          if(doc.exists && isMounted) {
            this.currentRobot.detect_behavior = doc.data().name;
            config.session.setDetectBehavior(doc.data().name);
            this.updateInfo();
          }
        }).catch((error) => {
          alert(error);
        });

      }
    });
  }

  updateInfo = () => {
    let current = this.state;
    let robot = this.currentRobot;

    current.id = robot.id;
    current.battery = robot.battery;
    current.batteryColor = robot.battery > 60 ? "green" : robot.battery >= 20 ? "#E1DD5E" : "red";
    current.connection = robot.connection;
    current.connectionColor = robot.connection > 60 ? "green" : robot.connection >= 20 ? "#E1DD5E" : "red";
    current.charging = robot.charging ? "yes" : "no";
    current.idle = robot.idle_behavior;
    current.detect = robot.detect_behavior; 
    current.recordings = robot.num_of_videos;
    current.header = config.headerTitle;

    this.setState(current);
  }

  updateNotifications = () => { 
      if(this.state.notificationsOn) {
        this.setState({notificationsOn: false});
        this.notifier.unsubscribeFromRobot();
      }
      else {
        this.setState({notificationsOn: true});
        this.notifier.subscribeToRobot();
      }
  }

  render() {
    return(
      <View style={styles.container}>
        <Text style={[styles.text]}>ID: {this.state.id}</Text>
        <View style={styles.row}>
          <Text style={styles.text}>Battery Level: </Text>
          <Text style={[{ color: this.state.batteryColor}, styles.text]}>{this.state.battery}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.text}>Wireless Connection Level: </Text>
          <Text style={[{ color: this.state.connectionColor}, styles.text]}>{this.state.connection}%</Text>
        </View>
        <Text style={[styles.text]}>Charging: {this.state.charging}</Text>
        <Text style={[styles.text]}>Idle Behavior: {this.state.idle}</Text>
        <Text style={[styles.text]}>Detect Behavior: {this.state.detect}</Text>
        <Text style={[styles.text]}>Number of Recordings: {this.state.recordings}</Text>
        <CheckBox 
          title="Notifications" 
          checked={this.state.notificationsOn} 
          onPress={() => this.updateNotifications()} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
    row: {
      flexDirection: 'row'
    },
    text: {
      fontSize: 20,
    },
    container: {
      flex: 1,
      flexDirection: 'column',
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
