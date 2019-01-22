/**
 * @author Luis Otero
 * @title R.O.S.E - LoginScreen
 * @description Login UI with username/password authentication, link to registration page, and password recovery
 */

import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, Button} from 'react-native';
import {FormInput} from 'react-native-elements';
import firebase from 'react-native-firebase';
import Session from '../controllers/Session';
import {config} from '../assets/config/config';

const logo = require("../assets/images/logo.png");
const title = "R.O.S.E";

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = { username: "", password: "" };
    this.errorCodes = config.errorCodes;

    this.usernameChange = (text) => {
        let currentState = this.state;
        currentState.username = text;
        this.setState(currentState);
    }

    this.passwordChange = (text) => {
        let currentState = this.state;
        currentState.password = text;
        this.setState(currentState);
    }

    this.register = this.register.bind(this);
  }

  authenticate = () => {
    let {username, password} = this.state;

    this.usernameField.blur();
    this.passwordField.blur();

    if(username == "" || password == "") {
        alert("Username and/or password are missing!");
        return;
    }

    firebase.auth().signInWithEmailAndPassword(username, password).catch((error) => {
        let code = error.code;

        if(code == this.errorCodes[3]) {
            //alert("Password is incorrect");
            this.passwordField.shake();
        }
        else if(code == this.errorCodes[0]) {
            this.usernameField.shake();
            //alert("Username is incorrect");
        }
        else if(code == this.errorCodes[1]) {
            alert("You have been disabled. Please try again later");
        }
        else if(code == this.errorCodes[2]) {
            this.usernameField.shake();
            this.passwordField.shake();
            alert("No user found with this email");
        }
        else {
            alert(code);
        }
    });

    firebase.auth().onAuthStateChanged((user) => {
        if(user) {
            let session = new Session(user.uid);
            this.props.screenProps.rootNav.navigate("Home", {sessionVar: session});
        }
    });
    
  }

  register() {
    this.props.navigation.navigate("Register", {errorCodes: this.errorCodes});
  }

  debugLogin = () => {
    let session = new Session(config.debugId);
    this.props.screenProps.rootNav.navigate("Home", {sessionVar: session})
  }

  render() {
    return(
      <View style={styles.container}>
        <Image source={logo} />
        <Text style={styles.welcome}>{title}</Text>
        <FormInput placeholder="username" 
            ref={input => this.usernameField = input}
            onChangeText={this.usernameChange} 
            value={this.state.username} />
        <FormInput placeholder="password"
            ref={input => this.passwordField = input} 
            secureTextEntry={true} 
            onChangeText={this.passwordChange} 
            value={this.state.password} />
        <Button title="Login" onPress={this.authenticate} />
        <Button title="Debug Login" onPress={this.debugLogin} />
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
