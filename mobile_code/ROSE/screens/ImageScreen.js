import React, {Component} from 'react';
import {Platform, StyleSheet, Text, TouchableOpacity, ScrollView, View, Modal} from 'react-native';
import { Icon } from 'react-native-elements';
import { config } from "../assets/config/config";
import firebase from 'react-native-firebase';
import Loader from "../helpers/Loader";
import Image from 'react-native-transformable-image-next';
import TransformableImage from '../helpers/TransformableImage';

export default class ImageScreen extends Component {
  
  static navigationOptions = ({navigation}) => {
    return({
      title: navigation.getParam("headerTitle", "No Robot Selected")
    });
  }

  constructor(props) {
    super(props);
    this.storage = firebase.storage();
    this.path = "Images/" + config.session.currentRobot().id + "/";

    this.props.navigation.setParams({headerTitle: config.headerTitle});

    this.state = {
      images: [],
      imageVisibility: {},
      body: <Loader text="Loading all Images" />,
      viewing: false,
      headerTitle: config.headerTitle,
      session: config.session
    };

    this.robotSnapshot = config.session.currentRobot().onSnapshot((robot) => {
      if(robot.exists) {
        let images = this.state.images;

        if(images.length > 0 && images.length != robot.data().videos.length && robot.data().videos.length > 0) {
          this.setState({images: [], body: <Loader text="Loading new Images" />});
          this._loadImages(0, robot.data().videos.length, robot.data().videos);
        }
        else if(images.length == 0 && robot.data().videos.length > 0) {
          this._loadImages(0, robot.data().videos.length, robot.data().videos);
        }
        else if(robot.data().videos.length == 0) {
          this.setState({
            body: <View style={{flex:1, alignItems: "center", justifyContent: "center"}}>
                    <Text>No Images</Text>
                  </View>
          });
        }
        else {
          //nothing
        }
      }
    });

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

  componentWillUnmount() {
    this.robotSnapshot();
  }

  _loadImages = (start, end, video_array) => {
    let images = this.state.images;

    for(i = start; i < end; i++) {
      let imageText = video_array[i];

      this.storage.ref(this.path + video_array[i]).getDownloadURL().then((url) => {
        images.push(
          <TouchableOpacity key={url} style={styles.imageContainer} onPress={() => this._openImage(url)}>
            <View style={{flex:1}}>
              <TransformableImage source={{uri: url}} style={{width: 120, height: 80, margin: 15}} />
            </View>
            <Text style={{flex:1, flexWrap: "wrap", marginRight: 15, fontWeight: "bold"}}>{imageText.split(".")[0]}</Text>
          </TouchableOpacity>
        );
        this.setState({ 
          body: <ScrollView style={[{backgroundColor: "#64a2b7"}]}>
                  {this.state.images}
                </ScrollView>, 
          images: images
        });
      }).catch((error) => {
        alert(this.path);
      });
    }
  }

  _openImage = (url) => {
    let body = "";
    let viewing = false;

    if(this.state.viewing == false) {
      /*
        <Modal
          animationType="slide"
          transparent={false}
          visible={true}
          onRequestClose={() => {
              this._openImage(url);
          }}>
          <View style={{flexDirection: "row", margin: 15, alignItems: "flex-end", justifyContent: "flex-end"}}>
            <Icon size={30} type="material-community" name="close-circle-outline" onPress={() => this._openImage(url)}/>
          </View>
          <View style={[styles.container]}>
            <PinchZoomView>
                <Image 
                  source={{uri: url}} 
                  resizeMode="stretch"
                style={{width: 260, height: 180}}/>
            </PinchZoomView>
          </View>
        </Modal>
        */
    
      body = (
        <Modal
        animationType="slide"
        transparent={false}
        visible={true}
        onRequestClose={() => {
            this._openImage(url);
        }}>
          <View style={{flexDirection: "row", margin: 15, alignItems: "flex-end", justifyContent: "flex-end"}}>
            <Icon size={30} type="material-community" name="close-circle-outline" onPress={() => this._openImage(url)}/>
          </View>
          <View style={[styles.container]}>
                <Image 
                  source={{uri: url}} 
                  resizeMode="stretch"
                style={{width: 260, height: 180}}/>
          </View>
      </Modal>
      );
      viewing = true;
    }
    else {
      body = <ScrollView style={[{backgroundColor: "#64a2b7"}]}>{this.state.images}</ScrollView>;
      viewing = false;
    }

    this.setState({body: body, viewing: viewing});
  }

  register() {
   
  }

  render() {
    return(
      this.state.body
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white'
    },
    welcome: {
      fontSize: 20,
      textAlign: 'center',
      margin: 10,
    },
    instructions: {
      textAlign: 'center',
      color: '#333333',
      marginBottom: 5,
    },
    imageContainer: {
      flex: 1,
      flexDirection: "row", 
      borderColor: "black",
      alignItems: "center",
      borderWidth: 2,
      borderRadius: 20,
      backgroundColor: "white"
    }
  });
