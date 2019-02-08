import React, {Component} from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, Dimensions } from 'react-native';
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
            display: "none"
        };
        this.props.navigation.setParams({headerTitle: config.headerTitle});
    }

    componentDidUpdate() {
        if(this.state.headerTitle != config.headerTitle) {
            this.state.headerTitle = config.headerTitle;
            this.props.navigation.setParams({headerTitle: config.headerTitle});
        }
        if(this.state.session != config.session) {
            this.state.session = config.session;
        }
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

    createNewRobot = () => {
        this.props.screenProps.rootNav.navigate("AddRobot");
    }

    changeRobot = () => {
        alert("want to change robot");
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
                <Text style={{display: this.state.display, color: "red"}}>Waiting to be applied</Text>
                <TouchableOpacity style={styles.bar} onPress={this.createNewRobot}>
                    <Text style={styles.text}>Add Robot</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bar} onPress={this.changeRobot}>
                    <Text style={styles.text}>Change Robot</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bar} onPress={this.editBehaviors}>
                    <Text style={styles.text}>Behaviors</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    text: {
        fontSize: 18,
        fontWeight: "bold",
        margin: 20
    },
    container: {
      flex: 0,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20
    },
    bar: {
      textAlign: 'center',
      width: Dimensions.get('window').width,
      backgroundColor: "#FFFFFF"
    },
    instructions: {
      textAlign: 'center',
      color: '#333333',
      marginBottom: 5,
    },
  });