import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, Button} from 'react-native';
import {FormInput} from 'react-native-elements';
import {NavigationActions, StackActions} from 'react-navigation';
import firebase from 'react-native-firebase';
import Session from '../controllers/Session';

const logo = require("../assets/images/logo.png");
const title = "R.O.S.E";

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = { username: "", password: "" };
    this.errorCodes = ["auth/invalid-eamil", "auth/user-disabled", "auth/user-not-found", "auth/auth-wrong-passowrd"];
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
    this.authenticate = this.authenticate.bind(this);
    this.register = this.register.bind(this);
  }

  authenticate() {
    let current = this.state;

    this.usernameField.blur();
    this.passwordField.blur();

    if(current.username == "" || current.password == "") {
        //alert("Username and/or password are missing!");
        return;
    }
    firebase.auth().signInWithEmailAndPassword(current.username, current.password).catch((error) => {
        let code = error.code;

        if(code == this.errorCodes[3]) {
            //alert("Password is incorrect");
            this.passwordField.shake();
        }
        else if(code == this.errorCodes[0]) {
            alert("Username is incorrect");
        }
        else if(code == this.errorCodes[1]) {
            alert("You have been disabled. Please try again later");
        }
        else if(code == this.errorCodes[2]) {
            //alert("No user found with this email");
            this.usernameField.shake();
            this.passwordField.shake();
        }
        else {
            alert(error.message);
        }
    });

    firebase.auth().onAuthStateChanged((user) => {
        if(user) {
            alert("You are signed in");
            this.props.screenProps.rootNav.navigate("Home", {userId: user.uid});
        }
        else {
            //nothing
        }
    });
    
  }

  register() {
    this.props.navigation.navigate("Register", {errorCodes: this.errorCodes});
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
