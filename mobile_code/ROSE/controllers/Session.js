import Database from './Database';
import User from './User';

class Session {

    constructor(user_id) {
        this._db = new Database();
        this._signedIn = false;
        this._user = "no user assigned yet";
        this._currentRobot = "none";
        this._idleBehavior = "none";
        this._detectBehavior = "none";
        this._actions = this._db.getActions();
        
        let db_user = this._db.getUser(user_id);

        if(db_user) {
            this._user = db_user;
            this._signedIn = true;
        }
        else {
            this._signedIn = false;
        }
    }

    createUser = () => {
        return this._user.get();
    }

    isSignedIn = () => {

        return this._signedIn;
    }

    getUser = () => {
        return this._user;
    }

    getActionList = () => {
        return this._actions;
    }

    currentRobot = () => {
        if (this._currentRobot == "none") {
            this._currentRobot = this._user._robots[0];
        }
        return this._currentRobot;
    }

    setCurrentRobot = (id) => {
        let robots = this._user._robots;
        let index = 0;
        
        for(index = 0; index < robots.length; index++) {
            if(robots[index].id == id) {
                this._currentRobot = robots[index];
                break;
            }
        }
    }

    setIdleBehavior = (idle) => {
        this._idleBehavior = idle;
    }

    setDetectBehavior = (detect) => {
        this._detectBehavior = detect;
    }

    getBehaviors = () => {
        return {idle: this._idleBehavior, detect: this._detectBehavior};
    }

    setUser = (userObject) => {
        if (userObject instanceof User) {
            this._user = userObject;
            return true;
        }
        else {
            return false;
        }
    }
}

export default Session;