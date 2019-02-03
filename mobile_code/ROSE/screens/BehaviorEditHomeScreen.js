import React, { Component } from 'react';
import { View, Text, StyleSheet, Picker, Alert } from 'react-native';
import { Icon } from 'react-native-elements';
import { config } from "../assets/config/config";
import { NavigationActions, StackActions } from 'react-navigation';

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
        let behaviorList = [];
        let behaviorComponents = [];
        let behaviorPickerItems = [];
        let behaviors = user.getBehaviorList();
        let idle = config.session.getBehaviors().idle;
        let detect = config.session.getBehaviors().detect;

        this.state = {
            behaviorComponents: [],
            behaviors: behaviors,
            behaviorList: [],
            behaviorPickerItems: [],
            idle: idle,
            detect: detect,
            defaultPickers: []
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
                                    onPress={() => this.deleteBehavior(behavior.data(), behavior)}
                                />
                            </View>
                        );
                    }

                    behaviorPickerItems.push({name: behavior.data().name, element: index, ref: behavior});

                    this.setState({
                        behaviorList: behaviorList, 
                        behaviorComponents: behaviorComponents, 
                        behaviorPickerItems: behaviorPickerItems,
                    });
                }

                if(this.state.behaviorList.length == this.state.behaviors.length) {
                    let pickers = this.state.defaultPickers;

                    pickers.push({
                        key: "1",
                        text: "Idle Behavior: ",
                        selected: this.state.idle,
                        changeFunction: this.changeIdleBehavior
                    });
                    pickers.push({
                        key: "2",
                        text: "Detect Behavior: ",
                        selected: this.state.detect,
                        changeFunction: this.changeDetectBehavior
                    });

                    this.setState({defaultPickers: pickers});
                }

            }).catch((error) => {
                alert(error);
            });
        });

    }

    deleteBehavior = (key, behaviorRef) => {
        let behaviors = this.state.behaviorList;
        let components = this.state.behaviorComponents;
        let pickerItems = this.state.behaviorPickerItems;

        Alert.alert(
            'Delete Behavior',
            'Are you sure you want to delete this behavior?' ,
            [
              {text: 'OK', onPress: () => {

                for(index = 0; index < behaviors.length; index++) {
                    if(behaviors[index].name === key.name) {
                        if(behaviors[index].used > 0) {
                            alert("Cannot delete behavior because it is being used");
                            return;
                        }

                        config.session.getUser().removeBehavior(behaviorRef);
                        behaviorRef.ref.delete().catch((error) => {
                            alert(error);
                        });

                        let userRef = config.session.getUser().getUserRef();

                        userRef.update({
                            behaviors: config.session.getUser().getBehaviorList()
                        }).catch((error) => {
                            alert(error);
                        });

                        this.props.navigation.dispatch(StackActions.reset({
                            index: 0,
                            actions: [NavigationActions.navigate({routeName: 'BehaviorHome'})]
                        }));
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
        this.props.navigation.navigate("BehaviorAdd", {behaviorObjects: this.state.behaviorList});
    }

    untagBehavior = (behavior, index) => {
        let list = this.state.behaviorList;
        let count = list[index].used;

        if(count <= 0) {
            list[index].used = 0;
        }
        else {
            list[index].used -= 1;
        }

        this.setState({behaviorList: list});
        
        behavior.ref.update({used: list[index].used}).catch((error) => {
            alert(error);
        });
    }

    tagBehavior = (behavior, index) => {
        let list = this.state.behaviorList;

        list[index].used += 1;

        this.setState({behaviorList: list});

        behavior.ref.update({used: list[index].used}).catch((error) => {
            alert(error);
        });
    }

    changeIdleBehavior = (value, ele) => {
        let behaviorObjects = this.state.behaviorPickerItems;
        let index;
        let previousValue = this.state.idle;

        if(this.state.idle !== value) {

            let defaultPickers = this.state.defaultPickers;
            defaultPickers[0].selected = value;

            this.setState({idle: value, defaultPickers: defaultPickers});

            for(index = 0; index < behaviorObjects.length; index++) {
                if(previousValue == behaviorObjects[index].name) {
                    this.untagBehavior(behaviorObjects[index].ref, index);
                }
                else if(value == behaviorObjects[index].name) {
                    let robot = config.session.currentRobot();
                    let robotObject = config.robotObject;

                    this.tagBehavior(behaviorObjects[index].ref, index);

                    robotObject.idle_behavior = this.state.behaviors[behaviorObjects[index].element];

                    robot.set(robotObject).then(() => {
                        if(ele != -1) {
                            alert("Idle Behavior has been changed successfully!");
                        }
                    }).catch((error) => {
                        alert(error);
                    });
                }
                else {
                    continue;
                }
            }
        }
    }

    changeDetectBehavior = (value, ele) => {
        let behaviorObjects = this.state.behaviorPickerItems;
        let index;
        let previousValue = this.state.detect;

        if(this.state.detect != value) {
            let defaultPickers = this.state.defaultPickers;
            defaultPickers[1].selected = value;

            this.setState({detect: value, defaultPickers: defaultPickers});

            for(index = 0; index < behaviorObjects.length; index++) {
                if(previousValue == behaviorObjects[index].name) {
                    this.untagBehavior(behaviorObjects[index].ref, index);
                }
                else if(value == behaviorObjects[index].name) {
                    let robot = config.session.currentRobot();
                    let robotObject = config.robotObject;

                    this.tagBehavior(behaviorObjects[index].ref, index);

                    robotObject.detect_behavior = this.state.behaviors[behaviorObjects[index].element];

                    robot.set(robotObject).then(() => {
                        if(ele != -1) {
                            alert("Detect Behavior has been changed successfully!");
                        }
                    }).catch((error) => {
                        alert(error);
                    });
                }
                else {
                    continue;
                }
            }
        }
    }

    renderBlock = (key, text, selected, changeFunction) => {
        return(
            <View key={key} style={styles.dropdown}>
                <Text style={styles.spacing}>{text} </Text>
                <Picker 
                    selectedValue={selected}
                    onValueChange={changeFunction}
                    enabled
                    mode="dropdown"
                    style={{height: 50, width: 200}}>
                        {this.state.behaviorPickerItems.map((val, ele) => {
                            return(<Picker.Item label={val.name} value={val.name} key={ele}/>);
                        })}
                </Picker>
            </View>
        );
    }

    render() {
        return(
            <View style={styles.container}>
                <View>
                    {this.state.defaultPickers.map((picker, index) => {
                        return this.renderBlock(picker.key, picker.text, picker.selected, picker.changeFunction);
                    })}
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