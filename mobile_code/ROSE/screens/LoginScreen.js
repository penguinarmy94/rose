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
import User from '../controllers/User';
import Loader from '../helpers/Loader';

const logo = require("../assets/images/logo.png");
const title = "R.O.S.E";
const flexState = 1;

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);

    this.state = { 
      username: "", 
      password: "",
      authenticating: false
    };

    this.errorCodes = config.errorCodes;

    /*
     * Username input handler. Changes the input of the username field
     * as it is being changed.
     */
    this.usernameChange = (text) => {
        let currentState = this.state;
        currentState.username = text;
        this.setState(currentState);
    }

    /*
    * Password input handler. Changes the input of the password field
    * as it is being changed.
    */
    this.passwordChange = (text) => {
        let currentState = this.state;
        currentState.password = text;
        this.setState(currentState);
    }

    this.authState = firebase.auth().onAuthStateChanged((user) => {
      if(user) {
        let session = new Session(this.state.username);
    
        session.createUser().then((user) => {
          if(user.exists) {
            session.setUser(new User(user));
            config.robotSnapshot = session.currentRobot().onSnapshot((robot) => {
              if(robot.exists) {
                config.robotObject = robot.data(); 
                config.session = session;
                this.props.screenProps.rootNav.navigate("Home", {sessionVar: session});           
              }
            });
          }
        }).catch((error) => {
          alert(error);
        });
      }
    });

  }

  componentWillUnmount = () => {
    this.authState();
  }

  authenticate = () => {
    let {username, password} = this.state;

    this.usernameField.blur();
    this.passwordField.blur();

    if(username == "" || password == "") {
        alert("Username and/or password are missing!");
        return;
    }

    this.setState({authenticating: true});

    firebase.auth().signOut().then(() => {
        this.signIn(username, password);
    }).catch(() => {
        this.signIn(username, password);
      }
    );
  }

  signIn = (username, password) => {
      firebase.auth().signInWithEmailAndPassword(username, password).catch((error) => {
        let code = error.code;

        this.setState({authenticating: false});

        if(code == this.errorCodes[3]) {
            this.usernameField.shake();
            this.passwordField.shake();
        }
        else if(code == this.errorCodes[0]) {
            alert("Username is incorrect");
        }
        else if(code == this.errorCodes[1]) {
            alert("You have been disabled. Please try again later");
        }
        else if(code == this.errorCodes[2]) {
            alert("No user found with this email");
        }
        else {
            alert(code);
        }
      });
  }

  register = () => {
    //alert("Sorry but you don't have enough privilege to register an account");
    this.props.navigation.navigate("Register", {errorCodes: this.errorCodes});
  }

  passwordRecovery = () => {
    alert("Password Recovery is coming soon");
  }

  aboutPage = () => {
    alert("Our about page is coming soon");
  }

  render() {
    if(!this.state.authenticating) {
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
            <TouchableOpacity onPress={this.aboutPage} style={{marginTop: 5, marginBottom: 15, width: 300}}>
              <Text style={[styles.hyperlink]}>About ></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }
    else {
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
            <Loader style={{width: 300, height: 100, justifyContent: "center"}} />
          </View>
        </ScrollView>
      );
    }
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
