import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FormInput } from 'react-native-elements';
import { config } from '../assets/config/config';

export default class AddRobotScreen extends Component {
    static navigationOptions = {
        title: "Add Robot"
    };

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
                light: false,
                camera_angle: 1,
                manual_picture: false,
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
                if(document.data().activated) {
                    Alert.alert("Robot Creation Error", "Robot with this ID has already been created", [{
                        text: "OK", onPress: () => {}
                    }]);
                }
                else {

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
        this.props.screenProps.parentNav.navigate("SettingsHome");
    }

    render() {
        return(
            <View style={[styles.container, styles.rose_background]}>
                <View style={[styles.formBlock]}>
                    <FormInput 
                        placeholder="Robot Name"
                        ref={input => this.state.input.nameRef = input}
                        onChangeText={(text) => {
                            let robot = this.state.robot;

                            robot.name = text;
                            this.setState({robot: robot});
                        }}
                        value={this.state.robot.name}
                        style={styles.form}
                    />
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
                    <TouchableOpacity title="Submit" onPress={this.createRobot}>
                        <Text style={styles.submit_button}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity title="Cancel" onPress={this.cancel}>
                        <Text style={styles.cancel_button}>Cancel</Text>
                    </TouchableOpacity>
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
    },
    formBlock: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "white",
        borderWidth: 1,
        borderRadius: 50,
        paddingLeft: 10,
        paddingRight: 10
    },
    submit_button: {
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
    label: {
        fontSize: 16,
        margin: 10,
    },
    buttonBlock: {
        flexDirection: "row",
        justifyContent: "center"
    },
    button: {
        marginLeft: 10,
        marginRight: 10,
    }
});