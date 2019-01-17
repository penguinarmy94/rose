import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TextInput, Image, Button} from 'react-native';
import firebase from 'react-native-firebase';

const logo = require("../assets/images/logo.png");
const title = "R.O.S.E";

export default class VideosScreen extends Component {
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
    this.props.navigation.navigate("Register");
  }

  render() {
    return(
      <View style={styles.container}>
        <Image source={logo} />
        <Text style={styles.welcome}>{title}</Text>
        <TextInput placeholder="username"/>
        <TextInput placeholder="password" secureTextEntry={true} />
        <Button title="Login" onPress={this.authenticate} />
        <Button title="Register" onPress={this.register} />
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
