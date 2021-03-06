/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import { Icon } from 'react-native-elements';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import ImageScreen from '../screens/ImageScreen';
import { config } from "../assets/config/config";


const imageNav = createStackNavigator(
    {
        ImageHome: { screen: ImageScreen },
    }, 
    {
        initialRouteName: "ImageHome",
        headerMode: "screen"
    }
);

const ImageContainer =  createAppContainer(imageNav);

export default class ImageStack extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarOnPress: ({navigation, defaultHandler}) => {
            navigation.setParams({headerTitle: config.headerTitle});
            defaultHandler();
        },
        tabBarIcon: ({tintColor}) => {
            return(<Icon color={tintColor} type="material-community" name="image-filter" />);
        },
        swipeEnabled: false
    });

    render() {
        return <ImageContainer screenProps={{ parentNav: this.props.navigation, rootNav: this.props.screenProps.rootNav, data: this.props.screenProps.data}} />
    }
}
