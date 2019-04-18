import React, { Component } from 'react';
import { View, ScrollView, Text, StyleSheet, Alert, Button, TouchableOpacity} from 'react-native';
import { Icon } from 'react-native-elements';
import { config } from "../assets/config/config";
import {RadioButton} from 'react-native-paper';
import RadioForm, { RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';

export default class ChangeRobotScreen extends Component {
    static navigationOptions = {
        title: "Change Current Robot"
    };

    constructor(props) {
        super(props);

        let user = config.session.getUser();
        let robotList = user.getRobotList();
        let robots = [];
        let selected = config.session.currentRobot();

        this.state = {
            user: user,
            robots: [],
            selected: config.session.currentRobot().id,
            index: -1
        };

        robotList.forEach((robot, index) => {
            robot.get().then((doc) => {
                if(doc.exists) {
                    robots.push({value: doc.id, label: doc.data().name});

                    if(selected.path === doc.ref.path) {
                        this.setState({selected: doc.id, index: robots.length-1});
                    }

                    if(robots.length == robotList.length) {
                        this.setState({robots: robots});
                    }
                }
            }).catch((error) => {
                alert(error);
            });
        });
    }

    renderBlock = (key, robot, changeFunction) => {
        if(this.state.index > -1) {
            return(
                <View key={key} style={styles.robot}>
                    <RadioButton
                        value={robot.label}
                        color="black"
                        status={this.state.selected === robot.value ? "checked" : "unchecked"}
                        onPress={() => changeFunction(robot.value)}
                    />
                    <Text style={styles.text_input}>{robot.label}</Text>
                </View>
            );
        }
        else {
            return(
                <View></View>
            );
        }

    }

    confirm = () => {
        config.session.setCurrentRobot(this.state.selected);
        this.props.screenProps.rootNav.navigate("Loading");
    }

    cancel = () => {
        this.props.screenProps.parentNav.navigate("SettingsHome");
    }

    render() {
        return(
            <View style={[styles.container, styles.rose_background]}>
                <View style={styles.robot_container}>
                    <Text style={[{fontSize: 25, fontWeight: "bold", borderBottomWidth: 1, margin: 20}]}>Robots</Text>
                    <View style={styles.scroll_view}>
                        <ScrollView>
                            {
                                this.state.robots.map((robot, index) => {
                                    return(this.renderBlock(index, robot, (value) => {
                                        this.setState({selected: value});
                                    }));
                                })
                            }
                        </ScrollView>
                    </View>
                    <TouchableOpacity style={styles.submit_button} onPress={this.confirm}>
                        <Text style={styles.button_text}>Confirm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancel_button} onPress={this.cancel}>
                        <Text style={styles.button_text}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    scroll_view: { 
        maxHeight: 200,
        marginTop: 30, 
        marginLeft: 15
    },
    robot_container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "white",
        borderWidth: 1,
        borderRadius: 50,
        paddingLeft: 10,
        paddingRight: 10
    },
    text_input: {
        fontWeight: "bold",
        borderBottomWidth: 1
    },  
    robot: {
        flexDirection: "row",
        alignItems: "center",
        width: 300
    },
    rose_background: {
        backgroundColor: "#000000"
    },
    button_text: {
        color: "white", 
        margin: 10, 
        fontWeight: "bold"
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
    }
});