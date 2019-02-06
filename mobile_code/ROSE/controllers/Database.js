import firebase from 'react-native-firebase';

export default class Database {
    constructor() {
        this._userRef = firebase.firestore().collection('Users');
        this._actionRef = firebase.firestore().collection('Action');
        this._defaultBehavior = firebase.firestore().collection('Behaviors').doc('default');
        this._behaviorRef = firebase.firestore().collection('Behaviors');
        this._robotRef = firebase.firestore().collection('Robots');
        this._robotTagRef = firebase.firestore().collection('RobotTags');
    }

    getUser = (id) => {
        let result = this._userRef.doc(id);

        if(result) {
            return result;
        }
        else {
            return "no user";
        }
    }

    getBehaviorCollection = () => {
        return this._behaviorRef;
    }

    getRobotCollection = () => {
        return this._robotRef;
    }

    getActionCollection = () => {
        return this._actionRef;
    }

    getRobotTagCollection = () => {
        return this._robotTagRef;
    }

    updateUser = (ref, obj) => {
        if(ref instanceof firebase.firestore.DocumentReference) {
            return ref.update(obj);
        }
        else {
            alert("Update Error: Cannot update user because reference is not of type firebase.firestore.DocumentReference");
        }
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