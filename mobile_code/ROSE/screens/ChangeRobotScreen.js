import React, { Component } from 'react';
import { View, ScrollView, Text, StyleSheet, Alert, Button, TouchableOpacity} from 'react-native';
import { Icon } from 'react-native-elements';
import { config } from "../assets/config/config";
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';

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

    renderBlock = (key, robots, selected, changeFunction) => {
        if(this.state.index > -1) {
            return(
                <View key={key} style={styles.robot}>
                    <RadioForm
                        formHorizontal={false}
                        animation={true}
                        onPress={changeFunction}
                        initial={this.state.index}
                        radio_props={robots}
                        buttonColor={"#64a2b7"}
                        labelColor={"#000"}
                        selectedButtonColor={"#64a2b7"}
                        selectedLabelColor={"#000"}
                        buttonSize={15}
                    />
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
                    <Text style={[{fontSize: 25, fontWeight: "bold", borderBottomWidth: 1, magin: 20}]}>Robots</Text>
                    <ScrollView contentContainerStyle={styles.scroll_view}>
                        {
                            this.renderBlock(0, this.state.robots, this.state.selected, (value, index) => {
                                this.setState({selected: value});
                            })
                        }
                    </ScrollView>
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
        justifyContent: "center", 
        alignItems: "center", 
        marginTop: 30, 
        marginLeft: 15, 
        borderWidth: 1
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
    robot: {
        width: 300
    },
    rose_background: {
        backgroundColor: "#000000"
    },
    text_input: {
        width: 300, 
        borderBottomWidth: 1
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