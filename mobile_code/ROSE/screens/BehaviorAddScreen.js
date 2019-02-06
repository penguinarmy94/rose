import React, { Component } from 'react';
import { View, Text, Picker, StyleSheet, ScrollView, Alert, Button } from 'react-native';
import { Icon, FormInput } from 'react-native-elements';
import { config } from '../assets/config/config';
import uuid from 'react-native-uuid';
import { NavigationActions, StackActions } from 'react-navigation';

export default class BehaviorAddScreen extends Component {
    static navigationOptions = {
        title: "Add Behavior"
    };

    constructor(props) {
        super(props);

        this.values = [];
        this.behaviorNameRef = "";

        this.state = {
            values: [],
            behaviorNameRef: "",
            behaviorObjects: this.props.navigation.getParam("behaviorObjects", null),
            actions: [],
            actionBlocks: [],
            actionSelection: {},
            behavior: {name: "", actions: []}
        };

        config.session.getActionList().get().then((selection) => {
            let state = this.state;
            selection.forEach((action) => {
                state.actions.push({ 
                    data: action.data(), 
                    ref: action.ref
                });
            });

            this.setState(state);

            this.addBlock();

        }).catch((error) => {
            alert(error);
        })
    }

    addBlock = () => {
        let state = this.state;
        let size = state.actionBlocks.length;
        let key = uuid.v1();

        state.actionSelection[key] = {action: this.state.actions[0].data.name, value: ""};

        this.values.push("");

        state.actionBlocks.push({
            key: key,
            changeFunction: (value) => {
                let actionList = this.state.actionSelection;

                if(actionList[key].action != value) {
                    actionList[key].action = value;
                    this.setState({actionSelection: actionList});
                }
            }
        });

        this.setState(state);
    }

    renderBlock = (key, index, changeFunction) => {
        return(
            <View key={key} style={styles.block}>
                <View key={key} style={[styles.dropdown, {borderBottomWidth: 0.5, borderColor: "black"}]}>
                    <Text style={styles.spacing}>Action: </Text>
                    <Picker
                        selectedValue={this.state.actionSelection[key].action}
                        mode="dropdown"
                        enabled
                        style={{width: 200, height: 50}}
                        onValueChange= {changeFunction}>
                        {
                            this.state.actions.map((action, index) => {
                                return (<Picker.Item label={action.data.name} value={action.data.name} key={index} />);
                            })
                        }
                    </Picker>
                </View>
                <View style={styles.dropdown}>
                    <Text style={styles.spacing}>Value: </Text>
                    <FormInput placeholder="0"
                        ref={input => this.values[index] = input}
                        onChangeText={(text) => {
                                let state = this.state;
                                state.actionSelection[key].value = text;
                                this.setState(state);
                        }
                        }
                        value={this.state.actionSelection[key].value}
                        style={{width: 200, height: 50, justifyContent: "flex-end"}} 
                    />
                </View>
                <View style={styles.spacing}>
                    <Icon 
                        type="material-community" 
                        name="minus-circle" 
                        color="red" 
                        onPress={() => this.deleteBlock(index, key)}
                    />
                </View>
            </View>
        );
    }

    deleteBlock = (index,key) => {
        let actionBlocks = this.state.actionBlocks;
        let actionSelection = this.state.actionSelection;

        if(actionBlocks.length == 1) {
            Alert.alert(
                'Delete Block',
                "Cannot delete blocks when there is only one left",
                [
                    {text: 'OK', onPress: () => {}}
                ]
            );
            return;
        }

        Alert.alert(
            'Delete Block',
            'Are you sure you want to delete this block?' ,
            [
              {text: 'OK', onPress: () => {

                    actionBlocks.splice(index, 1);
                    delete actionSelection[key]

                    this.setState({
                        actionBlocks: actionBlocks, 
                        actionSelection: actionSelection,
                    });

              }},
              {text: 'Cancel', onPress: () => {}, style: 'cancel'},
            ],
            { cancelable: false }
          )
        
    }

    createBehavior = () => {
        let behaviors = this.state.behaviorObjects;
        let behaviorToBeCreated = this.state.behavior;

        if(behaviors && behaviorToBeCreated.name != "") {

            for (i = 0; i < behaviors.length; i++) {
                if (behaviorToBeCreated.name === behaviors[i].name) {
                    alert("There is already a behavior with this name");
                    return;
                }
            }

            let chain = this.state.actionBlocks;
            let selections = this.state.actionSelection;

            chain.forEach((block, index) => {
                if(selections[block.key]) {
                    for (i = 0; i < this.state.actions.length; i++) {
                        if(this.state.actions[i].data.name === selections[block.key].action) {
                            selections[block.key].action = this.state.actions[i].ref;
                            behaviorToBeCreated.actions.push(selections[block.key]);
                            break;
                        }
                    }
                }
            });

            behaviorToBeCreated.used = 0;

            let behaviorRef = config.session.getBehaviors(true);

            behaviorRef.add(behaviorToBeCreated).then( (createdBehavior) => {
                config.session.getUser().addBehavior(createdBehavior);

                let user = config.session.getUser().getUserObject();
                let ref = config.session.getUser().getUserRef();

                ref.set(user).then(() => {
                    Alert.alert("Behavior Created", "Behavior Created!", [{
                        text: "OK", onPress: () => {
                            this.props.navigation.dispatch(StackActions.reset({
                                index: 0,
                                actions: [NavigationActions.navigate({routeName: 'BehaviorHome'})]
                            }));
                        }
                    }]);

                }).catch((error) => {
                    alert(error);
                });

            }).catch((error) => {
                alert(error);
                behaviorToBeCreated.actions = [];
            })
        }
        else if(behaviorToBeCreated.name == "") {
            alert("behavlor name cannot be blank");
        }
        else {
            return;
        }
    }

    cancelCreation = () => {
        this.props.navigation.goBack();
    }

    render() {
        return(
            <ScrollView style={styles.container}>
                <View style={[styles.dropdown, styles.block, styles.spacing, styles.padding]}>
                    <Text>Name: </Text>
                    <FormInput placeholder=""
                        ref={input => this.behaviorNameRef = input}
                        onChangeText={(text) => {
                                let state = this.state;
                                state.behavior.name = text;
                                this.setState(state);
                        }
                        }
                        value={this.state.behavior.name}
                        style={{width: 200, height: 50, justifyContent: "flex-end"}} 
                    />
                </View>
                <View>
                    {this.state.actionBlocks.map((value, index) => {
                        return (this.renderBlock(value.key, index, value.changeFunction));
                    })}
                </View>
                <View style={styles.endButtons}>
                    <Button title="Create" onPress={this.createBehavior} />
                    <View style={styles.spacing}>
                        <Icon 
                            type="material-community" 
                            name="plus-circle" 
                            color="green" 
                            onPress={this.addBlock}
                        />
                    </View>
                    <Button title="Cancel" onPress={this.cancelCreation} />
                </View>
            </ScrollView>
        );
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    spacing: {
        margin: 15
    },
    padding: {
        padding: 15
    },  
    delete: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    valueParam: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    block: {
        borderWidth: 1,
        borderColor: 'black'
    },
    endButtons: {
        justifyContent: "center",
        flexDirection: "row",
        margin: 15
    }
});