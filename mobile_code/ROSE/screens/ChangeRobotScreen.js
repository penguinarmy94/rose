import React, { Component } from 'react';
import { View, Text, StyleSheet, Alert, Button} from 'react-native';
import { Icon } from 'react-native-elements';
import { config } from "../assets/config/config";
import { StackActions, NavigationActions } from 'react-navigation';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

export default class ChangeRobotScreen extends Component {
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
                <View key={key} style={styles.dropdown}>
                    <RadioForm
                        formHorizontal={false}
                        animation={true}
                        onPress={changeFunction}
                        initial={this.state.index}
                        radio_props={robots}
                    >
                    {robots.map((robot, index) => {
                        <RadioButton labelHorizontal={true} key={index} >
                            <RadioButtonLabel
                                obj={robot}
                                index={index}
                                labelHorizontal={false}
                                onPress={changeFunction}
                                labelStyle={{fontSize: 20, color: 'black'}}
                                labelWrapStyle={{}}
                            />
                            <RadioButtonInput
                                obj={robot}
                                index={index}
                                isSelected={selected === robot.value}
                                onPress={changeFunction}
                                borderWidth={1}
                                buttonInnerColor={'#e74c3c'}
                                buttonOuterColor={selected === robot.value ? '#2196f3' : '#000'}
                                buttonSize={40}
                                buttonOuterSize={80}
                                buttonStyle={{}}
                            />
                            </RadioButton>
                        })} 
                    </RadioForm>
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
        this.props.navigation.navigate("SettingsHome");
    }

    render() {
        return(
            <View style={styles.container}>
                <View>
                    {
                        this.renderBlock(0, this.state.robots, this.state.selected, (value, index) => {
                            this.setState({selected: value});
                        })
                    }
                </View>
                <View>
                    <Button title="Confim" onPress={this.confirm} />
                    <Button title="Cancel" onPress={this.cancel} />
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