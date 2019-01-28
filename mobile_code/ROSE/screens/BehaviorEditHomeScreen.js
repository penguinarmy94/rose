import React, { Component } from 'react';
import { View, Text, StyleSheet, Picker, Alert } from 'react-native';
import { Icon } from 'react-native-elements';
import { config } from "../assets/config/config";

export default class BehaviorEditHomeScreen extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerLeft: <Icon type="material-community" name="arrow-left" onPress={() => {navigation.getParam("rootNav", "null").navigate("SettingsHome")} } />
        };
    };

    constructor(props) {
        super(props);

        this.props.navigation.setParams({rootNav: this.props.screenProps.parentNav});
        let user = config.session.getUser();
        let userObject = user.getUserObject();
        let behaviorList = [];
        let behaviorComponents = [];
        let behaviorPickerItems = [];
        let behaviors = user.getBehaviorList();

        this.state = {
            behaviorComponents: [],
            behaviors: behaviors,
            behaviorList: [],
            behaviorPickerItems: [],
            idle: config.session.getBehaviors().idle,
            detect: config.session.getBehaviors().detect
        };

        this.state.behaviors.forEach((elementValue, index) => {
            elementValue.get().then((behavior) => {
                if(behavior.exists) {
                    behaviorList.push(behavior.data());
                    if(behavior.data().name == "default") {
                        behaviorComponents.push(
                            <View key={index} style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text style={[{flex: 0}, styles.spacing]}>{behavior.data().name}</Text>
                            </View>
                        );
                    }
                    else {
                        behaviorComponents.push(
                            <View key={index} style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text style={[{flex: 0}, styles.spacing]}>{behavior.data().name}</Text>
                                <Icon 
                                    type="material-community" 
                                    name="minus-circle" 
                                    color="red" 
                                    onPress={() => this.deleteBehavior(behavior.data())}
                                />
                            </View>
                        );
                    }


                    behaviorPickerItems.push({name: behavior.data().name, element: index});

                    this.setState({
                        behaviorList: behaviorList, 
                        behaviorComponents: behaviorComponents, 
                        behaviorPickerItems: behaviorPickerItems,
                    });
                }
            }).catch((error) => {
                alert(error);
            });
        });

    }

    deleteBehavior = (key) => {
        let behaviors = this.state.behaviorList;
        let components = this.state.behaviorComponents;
        let pickerItems = this.state.behaviorPickerItems;

        Alert.alert(
            'Delete Behavior',
            'Are you sure you want to delete this behavior?' ,
            [
              {text: 'OK', onPress: () => {
                for(index = 0; index < behaviors.length; index++) {
                    if(behaviors[index] == key) {
                        if(this.state.idle == key.name) {
                            this.changeIdleBehavior("default", -1);
                        }

                        if(this.state.detect == key.name) {
                            this.changeDetectBehavior("default", -1);
                        }

                        behaviors.splice(index, 1);
                        components.splice(index, 1);
                        pickerItems.splice(index, 1);
                        this.setState({behaviorList: behaviors, behaviorComponents: components, behaviorPickerItems: pickerItems});
                        config.session.getUser().removeBehavior(index);
                        return;
                    }
                }
              }},
              {text: 'Cancel', onPress: () => {}, style: 'cancel'},
            ],
            { cancelable: false }
          )
        
    }

    addBehavior = () => {
        this.props.navigation.navigate("BehaviorAdd");
    }

    changeIdleBehavior = (value, ele) => {
        let behaviorObjects = this.state.behaviorPickerItems;
        let index;

        if(this.state.idle != value) {

            this.setState({idle: value});
            for(index = 0; index < behaviorObjects.length; index++) {
                if(value == behaviorObjects[index].name) {
                    let robot = config.session.currentRobot();
                    let robotObject = config.robotObject;

                    robotObject.idle_behavior = this.state.behaviors[behaviorObjects[index].element];

                    robot.set(robotObject).then(() => {
                        if(ele != -1) {
                            alert("Idle Behavior has been changed successfully!");
                        }
                    }).catch((error) => {
                        alert(error);
                    });
                    return;
                }
            }
        }
    }

    changeDetectBehavior = (value, ele) => {
        let behaviorObjects = this.state.behaviorPickerItems;
        let index;

        if(this.state.detect != value) {
            this.setState({detect: value});
            for(index = 0; index < behaviorObjects.length; index++) {
                if(value == behaviorObjects[index].name) {
                    let robot = config.session.currentRobot();
                    let robotObject = config.robotObject;

                    robotObject.detect_behavior = this.state.behaviors[behaviorObjects[index].element];

                    robot.set(robotObject).then(() => {
                        if(ele != -1) {
                            alert("Detect Behavior has been changed successfully!");
                        }
                    }).catch((error) => {
                        alert(error);
                    });
                    return;
                }
            }
        }
    }

    render() {
        return(
            <View style={styles.container}>
                <View>
                    <View style={styles.dropdown}>
                        <Text style={styles.spacing}>Idle Behavior: </Text>
                        <Picker 
                            selectedValue={this.state.idle}
                            onValueChange={this.changeIdleBehavior}
                            enabled
                            mode="dropdown"
                            style={{height: 50, width: 200}}>
                                {this.state.behaviorPickerItems.map((val, ele) => {
                                    return(<Picker.Item label={val.name} value={val.name} key={ele}/>);
                                })}
                        </Picker>
                    </View>
                    <View style={styles.dropdown}>
                        <Text style={styles.spacing}>Detect Behavior: </Text>
                        <Picker 
                            selectedValue={this.state.detect}
                            onValueChange={this.changeDetectBehavior}
                            enabled
                            mode="dropdown"
                            style={{height: 50, width: 200}}>
                                {this.state.behaviorPickerItems.map((val, ele) => {
                                    return(<Picker.Item label={val.name} value={val.name} key={ele}/>);
                                })}
                        </Picker>
                    </View>
                </View>
                <View>
                    <Text style={[styles.spacing, styles.sectionSpacing]}>All Behaviors:</Text>
                    <View style={styles.spacing}>{this.state.behaviorComponents}</View>
                    <View style={styles.spacing}><Icon type="material-community" name="plus-circle" color="green" onPress={this.addBehavior}/></View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 0,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    spacing: {
        margin: 15
    },
    delete: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});