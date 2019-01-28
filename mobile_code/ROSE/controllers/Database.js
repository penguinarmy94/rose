import firebase from 'react-native-firebase';

export default class Database {
    constructor() {
        this._userRef = firebase.firestore().collection('Users');
        this._actionRef = firebase.firestore().collection('Action');
        this._defaultBehavior = firebase.firestore().collection('Behaviors').doc('default');
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

    getBehavior = (id) => {

    }

    getRobot = (id) => {

    }

    getActions = () => {
        return this._actionRef;
    }

    updateUser = (user, id = 0, newRobot = null, type) => {
        if (type == "add") {
            let user = {
                username: user,
                behaviors: [this._defaultBehavior],
                robots: [newRobot]
            };
            this._userRef.doc(id).set(user);
        }
        else if (type == "update") {
            this._userRef.doc(id).set(user);
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