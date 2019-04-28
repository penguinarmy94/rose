import React, {Component} from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, Dimensions, Picker, ScrollView } from 'react-native';
import { Icon, FormInput, Tooltip } from 'react-native-elements';
import { config } from '../assets/config/config';
import { NavigationEvents } from 'react-navigation';

export default class SettingsScreen extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            title: navigation.getParam("headerTitle", "No Robot Selected")
        }
    };

    constructor(props) {
        super(props);

        this.upView = "up";
        this.middleView = "center";
        this.downView = "down";

        this.state = { 
            headerTitle: config.headerTitle, 
            session: config.session,
            power: config.robotObject.power,
            light: config.robotObject.light,
            picture: config.robotObject.manual_picture,
            cameraAngle: config.robotObject.cameraAngle,
            phrase: config.robotObject.phrases[0],
            phrases: config.robotObject.phrases,
            phraseInput: null,
            newPhrase: "",
            display: "none",
            color: config.robotObject.power ? "#64a2b7" : "#ffffff",
            icon: "camera"
        };
        this.props.navigation.setParams({headerTitle: config.headerTitle});

        this.robotSnapshot = config.session.currentRobot().onSnapshot((robot) => {
            if(robot.exists) {

                this.setState({
                    "power": robot.data().power, 
                    "light": robot.data().light,
                    "picture": robot.data().manual_picture,
                    "cameraAngle": robot.data().camera_angle,
                    "phrases": robot.data().phrases
                });

                if(!robot.data().manual_picture && this.state.power) {
                    this.setState({color: "#64a2b7", icon: "camera"});
                }
                else {
                    return;
                }
            }
        });
    }

    componentDidUpdate() {
        if(this.state.headerTitle != config.headerTitle) {
            this.state.headerTitle = config.headerTitle;
            this.props.navigation.setParams({headerTitle: config.headerTitle, power: config.robotObject.power});
        }
        if(this.state.session != config.session) {
            this.state.session = config.session;
        }
    }

    componentWillUnmount() {
        this.robotSnapshot();
    }

    changePower = (value) => {
        let current = config.robotObject;
        let state = this.state;
        let prevPowerState = state.power;

        if(this.state.power == true) {
            current.power = false;
            state.color = "#ffffff";
        }
        else {
            current.power = true;
            state.color = "#64a2b7";
        }

        state.display = "flex";
        state.power = current.power;
        this.setState(state);
        
        this.state.session.currentRobot().set(current).then(() => {
            config.robotObject = current;
            state.display = "none";
            this.setState(state);
        }).catch((error) => {
            alert(error);
            state.power = prevPowerState;
        });
        
        
    }

    changeLight = (value) => {
        let current = config.robotObject;
        let state = this.state;
        let prevLightState = state.light;

        if(this.state.light == true) {
            current.light = false;
        }
        else {
            current.light = true;
        }

        state.display = "flex";
        state.light = current.light;
        this.setState(state);
        
        this.state.session.currentRobot().set(current).then(() => {
            config.robotObject = current;
            state.display = "none";
            this.setState(state);
        }).catch((error) => {
            alert(error);
            state.light = prevLightState;
        });
        
        
    }

    changeManualPictureStatus = (value) => {
        let current = config.robotObject;
        let state = this.state;
        let prevPictureState = state.picture;

        if(this.state.picture == true) {
            current.manual_picture = false;
            state.icon = "camera";
        }
        else {
            current.manual_picture = true;
            state.icon = "camera-off";
        }

        state.display = "flex";
        state.picture = current.manual_picture;
        this.setState(state);
        
        this.state.session.currentRobot().set(current).then(() => {
            config.robotObject = current;
            state.display = "none";
            this.setState(state);
        }).catch((error) => {
            alert(error);
            state.picture = prevPictureState;
        });
        
        
    }

    changeCameraPosition = (value) => {
        let current = config.robotObject;
        let state = this.state;

        state.cameraAngle = value;
        current.camera_angle = value;
        this.setState(state);
        
        this.state.session.currentRobot().set(current).then(() => {
            config.robotObject = current;
            this.setState(state);
        }).catch((error) => {
            alert(error);
        });
        
        
    }

    changePhrase = (value) => {
        let state = this.state;

        state.phrase = value;
        
        this.setState(state);
    }

    speak = () => {
        let state = this.state;
        let current = config.robotObject;
        let phrase = this.state.newPhrase;

        if(state.newPhrase === "") {
            phrase = state.phrase;
        }

        current.phrase = phrase;
        state.newPhrase = "";

        if(!state.phrases.includes(phrase)) {
            state.phrases.push(phrase);
            current.phrases = state.phrases;
        }

        this.state.session.currentRobot().set(current).then(() => {
            config.robotObject = current;
            this.setState(state);
        }).catch((error) => {
            alert(error);
        });

    }

    createNewRobot = () => {
        this.props.screenProps.rootNav.navigate("AddRobot");
    }

    changeRobot = () => {
        this.props.screenProps.rootNav.navigate("ChangeRobot");
    }

    editBehaviors = () => {
        this.props.screenProps.rootNav.navigate("Behaviors");
    }

    render() {
        return(
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps={'handled'}>
                <View style={styles.settings_container}>
                    <View style={[{flexDirection: "row"}]}>
                        <Text style={[styles.text, styles.label]}>Power:</Text>
                        <Switch
                            style={{flex: 1, justifyContent: 'flex-end', marginRight: 30}}
                            onValueChange={this.changePower} 
                            value={this.state.power}
                            activeText="ON"
                            inActiveText="OFF" 
                        />
                    </View>
                    <View style={[{flexDirection: "row"}]}>
                        <Text style={[styles.text, styles.label]}>Light:</Text>
                        <Switch
                            style={{flex: 1, justifyContent: 'flex-end', marginRight: 30}}
                            onValueChange={this.changeLight} 
                            value={this.state.light}
                            activeText="ON"
                            inActiveText="OFF"
                            disabled={this.state.power? false: true} 
                        />
                    </View>
                    <View style={[{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}]}>
                        <Text style={[styles.text, styles.label]}>Take Picture:</Text>
                        <Icon 
                            color="black"
                            iconStyle={{marginRight: 30}}
                            size={40} 
                            type="material-community" 
                            name={this.state.icon} 
                            onPress={() => {
                                if(this.state.power) {
                                    if(this.state.picture) {
                                        return;
                                    }
                                    else {
                                        this.changeManualPictureStatus(true);
                                    }
                                }
                                else {
                                    return;
                                }
                            }} />
                    </View>
                    <View style={[{flexDirection: "row", justifyContent: 'space-between'}]}>
                        <Text style={[styles.text, styles.label]}>Camera Position:</Text>
                        <Picker 
                            selectedValue={this.state.cameraAngle}
                            onValueChange={(value) => this.changeCameraPosition(value)}
                            enabled={this.state.power? true: false}
                            mode="dropdown"
                            style={{width: 150, marginRight: 15}}>
                                <Picker.Item label={this.upView} value={0.6}/>
                                <Picker.Item label={this.middleView} value={1}/>
                                <Picker.Item label={this.downView} value={2}/>
                        </Picker>
                    </View>
                    <View style={[{flexDirection: "row", justifyContent: 'space-between'}]}>
                        <Text style={[styles.text, styles.label]}>Speak:</Text>
                        <Picker 
                            selectedValue={this.state.phrase}
                            onValueChange={(value) => this.changePhrase(value)}
                            enabled={this.state.power? true: false}
                            mode="dropdown"
                            style={{width: 200, marginRight: 15}}>
                                { 
                                    this.state.phrases.map((value, index) => {
                                        return(<Picker.Item key={index} label={value} value={value} />);
                                    })         
                                }
                        </Picker>
                    </View>
                    <View style={[{flexDirection: "row", justifyContent: 'space-between'}]} keyboardShouldPersistTaps={'handled'}>
                        <FormInput 
                        placeholder="New Phrase"
                        editable={this.state.power? true: false}
                        ref={input => this.state.phraseInput = input}
                        onChangeText={(text) => {
                            this.setState({newPhrase: text});
                        }}
                        value={this.state.newPhrase}
                        inputStyle={styles.text_input}
                        />
                        <TouchableOpacity 
                            disabled={this.state.power? false : true} 
                            style={this.state.power? [styles.speak_button_enabled] : [styles.speak_button_disabled]} 
                            onPress={() => this.speak()}>
                            <Text style={{color: "white"}}>Speak</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.bar} onPress={this.createNewRobot}>
                        <Text style={styles.text}>Add Robot</Text>
                        <Text style={styles.text}>></Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bar} onPress={this.changeRobot}>
                        <Text style={styles.text}>Change Robot</Text>
                        <Text style={styles.text}>></Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bar} onPress={this.editBehaviors}>
                        <Text style={styles.text}>Behaviors</Text>
                        <Text style={styles.text}>></Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#64a2b7",
    },
    text_input: {
        width: 200,
        borderBottomWidth: 1,
        marginLeft: 10
    },
    text: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 15,
        marginBottom: 15,
        marginLeft: 30,
        marginRight: 30
    },
    speak_button_enabled: {
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: "#64a2b7", 
        height: 40, 
        width: 60, 
        marginRight: 30, 
        borderWidth: 1
    },
    speak_button_disabled: {
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: "grey", 
        height: 40, 
        width: 60, 
        marginRight: 30, 
        borderWidth: 1
    },
    label: {
        borderBottomWidth: 1
    },
    settings_container: {
        justifyContent: 'space-between',
        backgroundColor: "white",
        borderWidth: 1,
        borderRadius: 50,
        paddingBottom: 40,
        paddingTop: 20
    },
    bar: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: "#FFFFFF"
    },
    instructions: {
      textAlign: 'center',
      color: '#333333',
      marginBottom: 5,
    },
    thumb: {
        backgroundColor: "green",
    },
    track: {
        height: 5
    }
  });