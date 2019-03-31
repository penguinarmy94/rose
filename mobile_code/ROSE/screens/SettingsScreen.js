import React, {Component} from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, Dimensions, Picker } from 'react-native';
import { Slider } from 'react-native-elements';
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
            display: "none",
            color: config.robotObject.power ? "#64a2b7" : "#ffffff",
            minValue: 0,
            maxValue: 6,
            step: 0.5
        };
        this.props.navigation.setParams({headerTitle: config.headerTitle});

        this.robotSnapshot = config.session.currentRobot().onSnapshot((robot) => {
            if(robot.exists) {
                this.setState({
                    "power": robot.data().power, 
                    "light": robot.data().light,
                    "picture": robot.data().manual_picture,
                    "cameraAngle": robot.data().camera_angle
                });

                if(!this.state.picture && this.state.power) {
                    this.setState({color: "#64a2b7"});
                }
                else {
                    this.setState({color: "#Ffffff"});
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
            state.color = "#64a2b7";
        }
        else {
            current.manual_picture = true;
            state.color = "#ffffff";
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
            <View style={styles.container}>
                <View style={[{flexDirection: "row"}]}>
                    <Text style={styles.text}>Power:</Text>
                    <Switch
                        style={{flex: 1, justifyContent: 'flex-end', marginRight: 30}}
                        onValueChange={this.changePower} 
                        value={this.state.power}
                        activeText="ON"
                        inActiveText="OFF" 
                    />
                </View>
                <View style={[{flexDirection: "row"}]}>
                    <Text style={styles.text}>Light:</Text>
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
                    <Text style={styles.text}>Take Picture:</Text>
                    <TouchableOpacity 
                        onPress={() => this.changeManualPictureStatus(true)} 
                        style={{backgroundColor: this.state.color, marginRight: 30}}
                        disabled={this.state.power ? (this.state.picture? true: false) : true}>
                        <Text style={{color: "", fontSize: 18, width: 100, height: 30, textAlign: "center"}}>Click</Text>
                    </TouchableOpacity>
                </View>
                <View style={[{flexDirection: "row", justifyContent: 'space-between'}]}>
                    <Text style={styles.text}>Camera Position:</Text>
                    <Picker 
                        selectedValue={this.state.cameraAngle}
                        onValueChange={(value) => this.changeCameraPosition(value)}
                        enabled={this.state.power? true: false}
                        mode="dropdown"
                        style={{height: 50, width: 150, marginRight: 15}}>
                            <Picker.Item label={this.upView} value={1}/>
                            <Picker.Item label={this.middleView} value={2}/>
                            <Picker.Item label={this.downView} value={3}/>
                    </Picker>
                </View>
                <Text style={{display: this.state.display, color: "red"}}>Waiting to be applied</Text>
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
        );
    }
}

const styles = StyleSheet.create({
    text: {
        fontSize: 18,
        fontWeight: "bold",
        margin: 20,
        marginRight: 30
    },
    container: {
      marginTop: 20
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