/**
 * @author Luis Otero
 * @title R.O.S.E - LoginScreen
 * @description Login UI with username/password authentication, link to registration page, and password recovery
 */

import React, {Component} from 'react';
import {StyleSheet, Text, View, ScrollView, Image, Button, TouchableOpacity} from 'react-native';
import {FormInput} from 'react-native-elements';
import firebase from 'react-native-firebase';
import Session from '../controllers/Session';
import {config} from '../assets/config/config';

const logo = require("../assets/images/logo.png");
const title = "R.O.S.E";
const flexState = 1;

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
      <ScrollView contentContainerStyle={[styles.container, styles.rose_background]}>
        <View style={styles.login_container}>
          <View style={styles.logo_container}>
            <Image source={logo} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <FormInput placeholder="username" 
              ref={input => this.usernameField = input}
              onChangeText={this.usernameChange} 
              value={this.state.username} 
              containerStyle={styles.text_input}/>
          <FormInput placeholder="password"
              ref={input => this.passwordField = input} 
              secureTextEntry={true} 
              onChangeText={this.passwordChange} 
              value={this.state.password} 
              containerStyle={styles.text_input}/>
          <TouchableOpacity onPress={this.authenticate} style={styles.login_button}>
            <Text style={[styles.login_text]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.register} style={{marginTop: 15, width: 300}}>
            <Text style={[styles.hyperlink]}>Register ></Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => alert("not yet")} style={{marginTop: 5, width: 300}}>
            <Text style={[styles.hyperlink]}>Recover Password ></Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.debugLogin} style={{marginTop: 5, marginBottom: 15, width: 300}}>
            <Text style={[styles.hyperlink]}>Debug ></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: flexState,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo_container: {
      marginTop: 15
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
    login_button: {
      width: 300, 
      backgroundColor: "#64a2b7", 
      alignItems: "center", 
      marginTop: 15
    },
    login_text: {
      color: "white", 
      margin: 10, 
      fontWeight: "bold"
    },
    rose_background: {
      backgroundColor: "#000000"
    },
    text_input: {
      width: 300, 
      borderBottomWidth: 1
    },
    hyperlink: { 
      color: "black",
      borderBottomColor: "black",
      textAlign: "right"
    },
    title: {
      fontSize: 25,
      fontWeight: "bold",
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
