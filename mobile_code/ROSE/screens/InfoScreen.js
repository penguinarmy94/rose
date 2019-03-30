import React, {Component} from 'react';
import { Platform, StyleSheet, Text, View, TextInput, Image } from 'react-native';
import { CheckBox, colors } from 'react-native-elements';
import firebase from 'react-native-firebase';
import NotificationManager from '../controllers/NotificationManager';
import Loader from '../helpers/Loader';
import User from '../controllers/User';
import { config } from '../assets/config/config';

let isMounted = false;

export default class InfoScreen extends Component {

  static navigationOptions = ({navigation}) => {
   return({
     title: navigation.getParam("headerTitle", "No Robot Selected"),
     headerTintColor: "black",
     headerStyle: {
        backgroundColor: "white",
        color: "white"
     }
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
      notificationsOn: false,
      loaded: 0
    };

    this.notifier = new NotificationManager(this.state.id);

    if(config.session) {
      isMounted = true;
      config.robotSnapshot();
      this.updateRobot();
    }
    else {
        isMounted = true;
        this.updateRobot();
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
    current.loaded += 1;

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
    if(this.state.loaded >= 2) {
      return(
        <View style={[styles.container, styles.rose_background]}>
          <View style={{backgroundColor: "white", width: 350, height: 480, justifyContent: "center", padding: 20, borderRadius: 50, borderWidth: 1, borderColor: "black"}}>
            <View style={[styles.row]}>
              <Text style={[styles.text, styles.label]}>ID: </Text>
              <Text style={[styles.text, styles.value]}>{this.state.id}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.text, styles.label]}>Battery: </Text>
              <Text style={[{ color: this.state.batteryColor}, styles.text]}>{this.state.battery}%</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.text, styles.label]}>Wi-Fi: </Text>
              <Text style={[{ color: this.state.connectionColor}, styles.text]}>{this.state.connection}%</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.text, styles.label]}>Charging: </Text>
              <Text style={[styles.text, styles.value]}>{this.state.charging}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.text, styles.label]}>Idle: </Text>
              <Text style={[styles.text, styles.value]}>{this.state.idle}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.text, styles.label]}>Detect: </Text>
              <Text style={[styles.text, styles.value]}>{this.state.detect}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.text, styles.label]}>Recordings:</Text> 
              <Text style={[styles.text, styles.value]}>{this.state.recordings}</Text>
            </View>
            <View style={[styles.row, {justifyContent: "center"}]}>
              <CheckBox 
                title="Notifications" 
                checked={this.state.notificationsOn} 
                onPress={() => this.updateNotifications()} 
                containerStyle={{backgroundColor: "white", borderWidth: 0}}
                textStyle={[styles.value, styles.text]}/>
            </View>
          </View>
        </View>
      );
    }
    else {
      return(<Loader text="Loading your robot" />);
    }
  }
}

const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: "space-between",
      marginTop: 15,
      marginLeft: 10,
      marginRight: 10
    },
    text: {
      fontSize: 20,
    },
    label: {
      color: "black",
      fontWeight: "bold",
      borderBottomWidth: 1,
      borderBottomColor: "black"
    },
    value: {
      color: "black"
    },
    rose_background: {
      backgroundColor: "#64a2b7"
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
