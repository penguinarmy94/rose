import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Button} from 'react-native';
import { FormInput } from 'react-native-elements';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import firebase from 'react-native-firebase';
import Loader from '../helpers/Loader';

const title = "Register for an Account";

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.users = firebase.firestore().collection('Users');
    this.robotTags = firebase.firestore().collection('RobotTags');
    this.robots = firebase.firestore().collection('Robots');
    this.defaultBehavior = firebase.firestore().collection('Behaviors').doc('default');
    this.state = { 
      username: null, 
      password: null,
      code: null,
      behaviors: [],
      robots: [],
      robot_name: null,
      robot_id: null,
      registering: false
    };

    this._setUsername = (value) => { this.setState({username: value})};
    this._setPassword = (value) => { this.setState({password: value})};
    this._setCode = (value) => { this.setState({code: value})};
    this._setRobotName = (value) => { this.setState({robot_name: value})};
    this._setRobotId = (value) => { this.setState({robot_id: value})};
  }


  register = () => {

    if(this.state.username && this.state.password && this.state.robot_name && this.state.robot_id) {
      this.setState({"registering": true});
    }
    else {
      Alert.alert("User Creation Error", "One of the fields is missing. Make sure all fields are filled out", [{
        text: "OK", onPress: () => {}
      }]);
      return;
    }

    let success = true;
    firebase.auth().createUserWithEmailAndPassword(this.state.username, this.state.password).catch((error) => {
      alert(error.message);
      success = false;
      this.setState({"registering": false});
    });

    if(success) {

        this.robotTags.doc(this.state.robot_id).get().then((document) => {

          if(document.exists) {
              if(document.data().activated) {
                  firebase.auth().currentUser.delete().then(() => {
                    Alert.alert("Robot Creation Error", "Robot with this ID has already been created", [{
                      text: "OK", onPress: () => {}
                    }]);
                  }).catch((error) => {
                    alert("User Deletion Error - " + error);
                    this.setState({"registering": false});
                  });
              }
              else {

                  this.robotTags.doc(this.state.robot_id).update({activated: true}).then(() => {
                      var robot = {
                        name: this.state.robot_name,
                        id: this.state.robot_id,
                        detect_behavior: this.defaultBehavior,
                        idle_behavior: this.defaultBehavior,
                        battery: 100,
                        charging: false,
                        connection: 0,
                        num_of_videos: 0,
                        power: false,
                        light: false,
                        camera_angle: 1,
                        manual_picture: false,
                        userid: this.state.username,
                        videos: []
                      };
  
                      this.robots.doc(this.state.robot_id).set(robot).then(() => {
                          var userObj = {
                            username: this.state.username, 
                            security_code: "1234", 
                            behaviors: [this.defaultBehavior], 
                            robots: [this.robots.doc(this.state.robot_id)]
                          };

                          this.users.doc(this.state.username).set(userObj).then(() => {
                            this.setState({registering: false});
                            Alert.alert("User Creation Complete", "Your account was created successfully!", [{
                                text: "OK", onPress: () => {
                                    this.props.navigation.navigate("Login");
                                }
                            }]);
                          }).catch((error) => {
                              alert(error);
                              firebase.auth().currentUser.delete().then(() => {
                                this.robots.doc(this.state.robot_id).delete().then(() => {
                                  this.robotTags.doc(this.state.robot_id).update({activated: true}).catch((error) => {
                                    this.setState({"registering": false});
                                      Alert.alert("User Creation Error", error, [{
                                        text: "OK", onPress: () => {}
                                      }]);
                                  });
                                }).catch((error) => {
                                  alert("Robot Deletion Error - " + error);
                                  this.setState({"registering": false});
                                })
                              }).catch((error) => {
                                alert("User Deletion Error - " + error);
                                this.setState({"registering": false});
                              });
                          });
                        
                    }).catch((error) => {
                        alert(error);
                        firebase.auth().currentUser.delete().then(() => {
                          this.robotTags.doc(this.state.robot_id).update({activated: true}).catch((error) => {
                            this.setState({"registering": false});
                            Alert.alert("Robot Creation Error", error, [{
                              title: "OK", onPress: () => {}
                            }]);
                          });
                        }).catch((error) => {
                          alert("User Deletion Error - " + error);
                          this.setState({"registering": false});
                        });
                    });
                }).catch((error) => {
                    alert("RobotTags Update: " + error);
                    this.setState({"registering": false});
                });

              }
              
          }
          else {
            this.setState({"registering": false});
            firebase.auth().currentUser.delete().then(() => {
              Alert.alert("Robot Creation Error", "No robot with that ID was found", [{
                text: "OK", onPress: () => {}
              }]);
            }).catch((error) => {
              alert("User Deletion Error - " + error);
              this.setState({"registering": false});
            });
          }
      }).catch((error) => {
          alert("TagRef get: " + error);
          this.setState({"registering": false});
          firebase.auth().currentUser.delete().then(() => {}).catch((error) => {
            alert("User Deletion Error - " + error);
            this.setState({"registering": false});
          });
      });
    }
  
  }

  cancel = () => {
    this.props.navigation.navigate("Login");
  }

  render() {
    if(!this.state.registering) {
        return(
          <ScrollView contentContainerStyle={[styles.container, styles.rose_background]}>
            <View style={styles.login_container}>
              <Text style={styles.title}>{title}</Text>
              <FormInput placeholder="Email" 
                  ref={input => this.usernameField = input}
                  onChangeText={this._setUsername} 
                  value={this.state.username} 
                  containerStyle={styles.text_input}/>
              <FormInput placeholder="Password"
                  ref={input => this.passwordField = input} 
                  secureTextEntry={true} 
                  onChangeText={this._setPassword} 
                  value={this.state.password} 
                  containerStyle={styles.text_input}/>
              <FormInput placeholder="Robot Name"
                  ref={input => this.robot_name = input} 

                  onChangeText={this._setRobotName} 
                  value={this.state.robot_name} 
                  containerStyle={styles.text_input}/>
              <FormInput placeholder="Robot ID"
                  ref={input => this.robot_id = input} 
                  onChangeText={this._setRobotId} 
                  value={this.state.robot_id} 
                  containerStyle={styles.text_input}/>
              <TouchableOpacity onPress={this.register} style={styles.login_button}>
                <Text style={[styles.login_text]}>Register</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.cancel} style={styles.cancel_button}>
                <Text style={[styles.login_text]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
      }
      else {
        return(
          <ScrollView contentContainerStyle={[styles.loadingcontainer, styles.rose_background]}>
            <View style={styles.loading_container}>
              <Text style={styles.title}>{title}</Text>
              <Loader text="Creating New Account..." />
            </View>
          </ScrollView>
        );
      }
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loading_container: {
      width: 200,
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: "white",
      borderWidth: 1,
      borderRadius: 50,
      paddingLeft: 10,
      paddingRight: 10
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
      marginTop: 100
    },
    cancel_button: {
      width: 300, 
      backgroundColor: "black", 
      alignItems: "center", 
      marginTop: 15,
      marginBottom: 25
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
      marginLeft: 10,
      marginRight: 10,
      marginTop: 25,
      marginBottom: 25,
      borderBottomWidth: 1
    },
    instructions: {
      textAlign: 'center',
      color: '#333333',
      marginBottom: 5,
    },
  });
