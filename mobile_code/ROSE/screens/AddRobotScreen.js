import React, { Component } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { FormInput } from 'react-native-elements';
import { config } from '../assets/config/config';

export default class AddRobotScreen extends Component {
    constructor(props) {
        super(props);

        let user = config.session.getUser();
        let robots = config.session.getRobots(true);
    
        this.state = {
            user: user,
            userRef: user.getUserRef(),
            robotCollection: robots,
            input: {
                nameRef: null,
                idRef: null
            },
            robot: {
                name: "",
                id: "",
                detect_behavior: "",
                idle_behavior: "",
                battery: 0,
                charging: false,
                connection: 0,
                num_of_videos: 0,
                power: true,
                userid: user.getUserId(),
                videos: []
            }
        };
            
    }

    createRobot = () => {
        let userRef = this.state.userRef;
        let user = this.state.user;
        let robotRef = this.state.robotCollection;
        let robot = this.state.robot;
        let defaultRef = config.session.getBehaviors(true).doc("default");
        let tagRef = config.session.getRobotTags();

        robot.idle_behavior = defaultRef;
        robot.detect_behavior = defaultRef;

        tagRef.doc(robot.id).get().then((document) => {

            if(document.exists) {
                tagRef.doc(robot.id).update({activated: true}).catch((error) => {
                    alert("TagRef Update: " + error);
                });

                robotRef.doc(robot.id).set(robot).then(() => {
                    user.addRobot(robotRef.doc(robot.id));
      
                    userRef.update({robots: user.getRobotList()}).then(() => {
                        Alert.alert("Robot Creation Complete", "The robot was created successfully!", [{
                            text: "OK", onPress: () => {this.props.navigation.navigate("SettingsHome");}
                        }]);
                    }).catch((error) => {
                        Alert.alert("Robot Creation Error", error, [{
                            text: "OK", onPress: () => {}
                        }]);
                    });
                    
                }).catch((error) => {
                    Alert.alert("Robot Creation Error", error, [{
                        title: "OK", onPress: () => {}
                    }]);
                });
                
            }
            else {
                Alert.alert("Robot Creation Error", "No robot with that ID was found", [{
                    text: "OK", onPress: () => {}
                }]);
            }
        }).catch((error) => {
            alert("TagRef get: " + error);
        });
    }

    cancel = () => {
        this.props.navigation.navigate("SettingsHome");
    }

    render() {
        return(
            <View>
                <View>
                    <Text>Name: </Text>
                    <FormInput 
                        placeholder="Enter the name of the robot"
                        ref={input => this.state.input.nameRef = input}
                        onChangeText={(text) => {
                            let robot = this.state.robot;

                            robot.name = text;
                            this.setState({robot: robot});
                        }}
                        value={this.state.robot.name}
                        style={styles.form}
                    />
                </View>
                <View>
                    <Text>ID: </Text>
                    <FormInput 
                        placeholder="Enter the robot's ID"
                        ref={input => this.state.input.idRef = input}
                        onChangeText={(text) => {
                            let robot = this.state.robot;

                            robot.id = text;
                            this.setState({robot: robot});
                        }}
                        value={this.state.robot.id}
                        style={styles.form}
                    />
                </View>

                <Button title="Submit" onPress={this.createRobot} />
                <Button title="Cancel" onPress={this.cancel} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    form: {
        width: 200,
        height: 50,
        justifyContent: 'flex-end'
    }
});