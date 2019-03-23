/**
 * @author Luis Otero
 * @title R.O.S.E - LoginScreen
 * @description Login UI with username/password authentication, link to registration page, and password recovery
 */

import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, Button, TouchableOpacity} from 'react-native';
import {FormInput} from 'react-native-elements';
import firebase from 'react-native-firebase';
import Session from '../controllers/Session';
import {config} from '../assets/config/config';

const logo = require("../assets/images/logo.png");
const title = "R.O.S.E";

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = { username: "", password: ""};
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
      <View style={[styles.container, styles.rose_background]}>
        <View style={styles.login_container}>
          <View style={{marginTop: 5}}>
            <Image source={logo} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <FormInput placeholder="username" 
              ref={input => this.usernameField = input}
              onChangeText={this.usernameChange} 
              value={this.state.username} 
              containerStyle={{width: 300, borderBottomWidth: 1}}/>
          <FormInput placeholder="password"
              ref={input => this.passwordField = input} 
              secureTextEntry={true} 
              onChangeText={this.passwordChange} 
              value={this.state.password} 
              containerStyle={{width: 300, borderBottomWidth: 1}}/>
          <View style={{width: 300, margin: 15}} >
            <Button title="Login" color="pink" onPress={this.authenticate} style={{margin: 20}}/>
          </View>
          <View style={{flexDirection: "row", justifyContent: "space-between", width: 200, margin: 15}}>
            <TouchableOpacity onPress={this.debugLogin} underlayColor={"white"}>
              <Text style={[styles.hyperlink]}>Debug Login</Text>
            </TouchableOpacity>
            <View><Text onPress={this.register} style={styles.hyperlink}>Register</Text></View>
          </View>
        </View>
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
    login_container: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: "white",
      borderWidth: 1,
      borderRadius: 50,
      paddingLeft: 10,
      paddingRight: 10
    },
    rose_background: {
      backgroundColor: "#BDE7B0"
    },
    hyperlink: { 
      fontWeight: "bold",
      borderBottomWidth: 1,
      color: "blue",
      borderBottomColor: "blue"
    },
    title: {
      fontSize: 25,
      textAlign: 'center',
      margin: 10,
      marginBottom: 25
    },
    instructions: {
      textAlign: 'center',
      color: '#333333',
      marginBottom: 5,
    },
  });
