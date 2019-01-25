import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TextInput, Image, Button} from 'react-native';
import { config } from "../assets/config/config";

const logo = require("../assets/images/logo.png");
const title = "R.O.S.E";

export default class VideoScreen extends Component {
  static navigationOptions = ({navigation}) => {
    return {
        title: navigation.getParam("headerTitle", "No Robot Selected")
    }
  };

  constructor(props) {
    super(props);
    this.state = { username: null, password: null, test: this.props.screenProps.test};
    this.authenticate = this.authenticate.bind(this);
    this.register = this.register.bind(this);
    this.props.navigation.setParams({headerTitle: config.headerTitle});
  }

  authenticate() {
    
  }

  register() {
   
  }

  render() {
    return(
      <View style={styles.container}>
        <Text style={[]}>{this.state.test}</Text>
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
