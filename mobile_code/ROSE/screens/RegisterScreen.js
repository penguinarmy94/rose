import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TextInput, Image, Button} from 'react-native';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import firebase from 'react-native-firebase';

const title = "R.O.S.E";

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.users = firebase.firestore().collection('Users');
    this.state = { username: null, password: null };
    this.register = this.register.bind(this);
    this.cancel = this.cancel.bind(this);
    this.update = this.update.bind(this);
    this.navigate = this.props.navigation.navigate;
  }

  register() {

  }

  cancel() {
    this.navigate("Login");
  }

  update() {

  }

  render() {
    return(
      <View style={styles.container}>
        <Text>{title}</Text>
        <TextInput placeholder="username"/>
        <TextInput placeholder="password" secureTextEntry={true} />
        <TextInput placeholder="security code" secureTextEntry={true} />
        <Button title="Register" onPress={this.register} />
        <Button title="Cancel" onPress={this.cancel} />
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
