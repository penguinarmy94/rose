import React, { Component } from 'react';
import { View, Text, Picker, StyleSheet, ScrollView, Alert, Button, TouchableOpacity } from 'react-native';
import { Icon, FormLabel, FormInput } from 'react-native-elements';
import { config } from '../assets/config/config';
import uuid from 'react-native-uuid';
import { NavigationActions, StackActions } from 'react-navigation';
import Collapsible from 'react-native-collapsible';

export default class BehaviorAddScreen extends Component {
    static navigationOptions = {
        title: "Add Behavior"
    };

    constructor(props) {
        super(props);

        this.values = [];
        this.behaviorNameRef = "";
        this.types = config.types;

        this.state = {
            values: [],
            behaviorNameRef: "",
            behaviorObjects: this.props.navigation.getParam("behaviorObjects", null),
            actions: [],
            actionBlocks: [],
            actionSelection: {},
            behavior: {name: "", description: "", actions: []},
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

        state.actionSelection[key] = {
            action: this.state.actions[0].data.name,
            desc: this.state.actions[0].data.description,
            type: this.types[this.state.actions[0].data.type], 
            value: "",
            collapsed: true
        };

        this.values.push("");

        state.actionBlocks.push({
            key: key,
            changeFunction: (value) => {
                let actionList = this.state.actionSelection;
                let actions = this.state.actions

                if(actionList[key].action != value) {
                    actionList[key].action = value;
                    for(let index = 0; index < actions.length; index ++) {
                        if(actions[index].data.name == value) {
                            actionList[key].desc = actions[index].data.description;
                            actionList[key].type = this.types[actions[index].data.type];
                        }
                    }
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
                    <TouchableOpacity onPress={() => {
                            actions = this.state.actionSelection; 
                            actions[key].collapsed = actions[key].collapsed? false: true;
                            this.setState({actionSelection: actions});
                            }} >
                        <FormLabel>Action: </FormLabel>
                    </TouchableOpacity>
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
                <Collapsible collapsedHeight={0} collapsed={this.state.actionSelection[key].collapsed}>
                <View style={styles.valueParam}>
                    <FormLabel style={{}}>Value: </FormLabel>
                    <FormInput placeholder="0"
                        ref={input => this.values[key] = input}
                        editable={this.state.actionSelection[key].type == "--"? false:true}
                        onChangeText={(text) => {
                                try {
                                    if(this.state.actionSelection[key].type == "mood") {
                                        if(/^[0-3]?$/.test(text) === false) {
                                            throw new TypeError("Value is not one of the options " + text);
                                        }
                                    }
                                    else if (this.state.actionSelection[key].type == "--") {
                                        if(/^[0-1]?$/.test(text) === false) {
                                            throw new TypeError("Value is not one of the options " + text);
                                        }
                                    }
                                    else if (/^[0-9]{0,3}$/.test(text) === false) {
                                        throw new TypeError("Value is not a number " + text);
                                    }
                                    let state = this.state;
                                    state.actionSelection[key].value = text;
                                    this.setState(state);
                                }
                                catch(e) {
                                    this.values[key].clearText();
                                }
                        }
                        }
                        keyboardType={this.state.actionSelection[key].type == "text"? "text": "numeric"}
                        value={this.state.actionSelection[key].type == "--"? "1": this.state.actionSelection[key].value}
                        inputStyle={{
                            width: this.state.actionSelection[key].type == "text"? 200 : 40, 
                            textAlign: 'center', 
                            borderBottomColor: 'black', 
                            borderBottomWidth: 1
                        }} 
                    />
                    <FormLabel style={{}}>{this.state.actionSelection[key].type}</FormLabel>
                </View>
                <View style={styles.dropdown}>
                    <Text style={styles.spacing}>Description:  {this.state.actionSelection[key].desc}</Text>
                </View>
                </Collapsible>
                <View style={[styles.spacing]}>
                    <Icon 
                        type="material-community" 
                        name="minus-circle" 
                        color="pink"
                        containerStyle={{justifyContent: "flex-end", alignItems: "flex-end"}} 
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

        if(behaviors && behaviorToBeCreated.name != "" && behaviorToBeCreated.description != "") {

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
            alert("Behavior name cannot be blank");
        }
        else if(behaviorToBeCreated.description == "") {
            alert("Behavior description cannot be blank");
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
            <View style={[styles.container, styles.rose_background]} keyboardShouldPersistTaps={'handled'}>
                <View style={[styles.name_block, styles.spacing]}>
                    <View style={[styles.dropdown, styles.padding]}>
                        <FormLabel>Name: </FormLabel>
                        <FormInput placeholder=""
                            ref={input => this.behaviorNameRef = input}
                            onChangeText={(text) => {
                                    let state = this.state;
                                    if (text.length <= 25) {
                                        state.behavior.name = text;
                                        this.setState(state);
                                    }
                            }
                            }
                            value={this.state.behavior.name}
                            inputStyle={styles.formInput} 
                        />
                    </View>
                    <View style={[styles.dropdown, styles.padding]}>
                        <FormLabel>Description: </FormLabel>
                        <FormInput placeholder=""
                            ref={input => this.behaviorNameRef = input}
                            onChangeText={(text) => {
                                    let state = this.state;
                                    state.behavior.description = text;
                                    this.setState(state);
                            }
                            }
                            value={this.state.behavior.description}
                            inputStyle={styles.formInput} 
                        />
                    </View>
                </View>
                <View style={{height: 350, marginLeft: 15, marginRight: 15, paddingTop: 10, backgroundColor: "white"}}>
                    <ScrollView ref={(scroll) => this.scrollBar = scroll}>
                        {this.state.actionBlocks.map((value, index) => {
                            return (this.renderBlock(value.key, index, value.changeFunction));
                        })}
                    </ScrollView>
                    <View style={styles.spacing}>
                        <Icon
                            size={30}
                            type="material-community" 
                            name="plus-circle" 
                            color="#64a2b7" 
                            onPress={() => {
                                this.addBlock();
                                this.scrollBar.scrollToEnd();
                            }}
                        />
                    </View>
                </View>
                <TouchableOpacity style={styles.submit_button} onPress={this.createBehavior}>
                    <Text style={styles.button_text}>Create</Text>
                </TouchableOpacity>
            </View>
        );
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    rose_background: {
        backgroundColor: "black"
    },
    spacing: {
        margin: 15
    },
    row: {
        flexDirection: 'row'
    },
    delete: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center",
        marginTop: 15,
        marginBottom: 15
    },
    valueParam: {
        flexDirection: "row",
        justifyContent: "flex-start"
    },
    name_block: {
        borderWidth: 1,
        backgroundColor: "white",
        borderRadius: 10
    },
    block: {
        borderWidth: 1,
        backgroundColor: "white",
        borderRadius: 10,
        marginLeft: 15,
        marginRight: 15,
        marginTop: 5
    },
    endButtons: {
        justifyContent: "center",
        flexDirection: "row",
        margin: 15
    },
    formInput: {
        width: 200, 
        justifyContent: 'space-between',
        borderBottomColor: 'black', 
        borderBottomWidth: 1
    },
    button_text: {
        color: "white", 
        margin: 10, 
        fontWeight: "bold"
    },
    submit_button: {
        marginLeft: 15,
        marginRight: 15,
        marginTop: 10,
        backgroundColor: "#64a2b7",
        justifyContent: "center",
        alignItems: "center"
    }
});