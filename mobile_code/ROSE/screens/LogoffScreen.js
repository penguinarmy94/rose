import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TextInput, Image, Button} from 'react-native';
import firebase from 'react-native-firebase';
import {NavigationActions, StackActions} from 'react-navigation';
import LandingStack from '../navigators/LandingStack';

const logo = require("../assets/images/logo.png");
const title = "R.O.S.E";

export default class LogoffScreen extends Component {
  constructor(props) {
    super(props);
    this.users = firebase.firestore().collection('Users');
    this.state = { username: null, password: null };
    this.authenticate = this.authenticate.bind(this);
    this.register = this.register.bind(this);
  }

  authenticate() {
    let current = this.state;
    current.title = "";

    firebase.firestore().collection("Users").get().then((query) => {
        query.forEach((doc) => {
            current.title += (doc.data().username + " ");
        });

        this.setState(current);
        //this.props.navigation.navigate("Home", { "state": current});
    });
  }

  register() {
      /*
    this.props.navigation.dispatch(
        StackActions.reset({
            index: 0,
            key: null,
            actions: [NavigationActions.navigate({ routeName: "Info"})]
        })
    )
    */
    firebase.auth().signOut().then(() => {
      this.props.screenProps.rootNav.navigate("Main");
      alert("You have been signed out!");
    }).catch((error) => {
      alert(error.message);
    });
   
  }

  render() {
    return(
      <View style={styles.container}>
        <Image source={logo} />
        <Text style={styles.welcome}>{title}</Text>
        <Button title="Logoff" onPress={this.register} />
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
