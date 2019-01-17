import firebase from 'react-native-firebase';

export default class Database {
    constructor() {
        this._userRef = firebase.firestore().collection('Users');
        this._behaviorRef = firebase.firestore().collection('Behaviors');
        this._robotRef = firebase.firestore().collection('Robots');
        this._actionRef = firebase.firestore().collection('Action');
    }

    getBehaviors = (username) => {

    }

    getRobots = (username) => {

    }

    getActions = () => {

    }

    updateBehavior = (behavior, type) => {
        if (type == "add") {

        }
        else if (type == "update") {

        }
        else {

        }
    }

    updateRobot = (robot, type) => {
        if (type == "add") {
            
        }
        else if (type == "update") {

        }
        else {
            
        }
    }
}