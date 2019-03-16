import React, {Component} from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, Dimensions, Slider } from 'react-native';
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
        this.state = { 
            headerTitle: config.headerTitle, 
            session: config.session,
            power: config.robotObject.power,
            light: config.robotObject.light,
            cameraAngle: config.robotObject.cameraAngle,
            display: "none"
        };
        this.props.navigation.setParams({headerTitle: config.headerTitle});

        this.robotSnapshot = config.session.currentRobot().onSnapshot((robot) => {
            if(robot.exists) {
                this.setState({
                    "power": robot.data().power, 
                    "light": robot.data().light,
                    "cameraAngle": robot.data().camera_angle
                });
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
        }
        else {
            current.power = true;
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

    changeCameraPosition = (value) => {
        let current = config.robotObject;
        let state = this.state;

        state.display = "flex";
        state.cameraAngle = value;
        current.camera_angle = value;
        this.setState(state);
        
        this.state.session.currentRobot().set(current).then(() => {
            config.robotObject = current;
            state.display = "none";
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
                        style={{flex: 1, justifyContent: 'flex-end', margin: 30}}
                        onValueChange={this.changePower} 
                        value={this.state.power}
                        activeText="ON"
                        inActiveText="OFF" 
                    />
                </View>
                <View style={[{flexDirection: "row"}]}>
                    <Text style={styles.text}>Light:</Text>
                    <Switch
                        style={{flex: 1, justifyContent: 'flex-end', margin: 30}}
                        onValueChange={this.changeLight} 
                        value={this.state.light}
                        activeText="ON"
                        inActiveText="OFF" 
                    />
                </View>
                <View style={[{flexDirection: "row"}]}>
                    <Text style={styles.text}>Camera Position:</Text>
                    <Slider
                        style={{flex: 1, justifyContent: 'flex-end', margin: 30}}
                        maximumValue={10}
                        minimumValue={5}
                        step={1}
                        onSlidingComplete={this.changeCameraPosition} 
                        value={this.state.cameraAngle}
                    />
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
  });