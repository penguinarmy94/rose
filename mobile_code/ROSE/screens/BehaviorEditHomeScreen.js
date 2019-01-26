import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
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
        let behaviors = user.getBehaviorList();
        let behaviorList = [];
        let behaviorComponents = [];
        
        this.state = {
            behaviorComponents: [],
            behaviorList: []
        };

        behaviors.forEach((value, index) => {
            value.get().then((behavior) => {
                if(behavior.exists) {
                    behaviorList.push(behavior.data());
                    behaviorComponents.push(
                        <View key={index} style={{flexDirection: 'row'}}>
                            <Text>{behavior.data().name}</Text>
                            <Icon type="material-community" name="minus-circle" color="red" onPress={() => this.deleteBehavior(behavior.data())} />
                        </View>
                    );
                    this.setState({behaviorList: behaviorList, behaviorComponents: behaviorComponents});
                }
            }).catch((error) => {
                alert(error);
            });
        });

    }

    deleteBehavior = (key) => {
        let behaviors = this.state.behaviorList;
        let components = this.state.behaviorComponents;

        Alert.alert(
            'Delete Behavior',
            'Are you sure you want to delete this behavior?' ,
            [
              {text: 'OK', onPress: () => {
                for(index = 0; index < behaviors.length; index++) {
                    if(behaviors[index] == key) {
                        behaviors.splice(index, 1);
                        components.splice(index, 1);
                        this.setState({behaviorList: behaviors, behaviorComponents: components});
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

    render() {
        return(
            <View style={styles.container}>
                <Text>You are now in the BehaviorEditHome Screen</Text>
                <View>{this.state.behaviorComponents}</View>
                <View><Icon type="material-community" name="plus-circle" color="green" onPress={this.addBehavior}/></View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});