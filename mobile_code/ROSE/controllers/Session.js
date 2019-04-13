import Database from './Database';
import User from './User';

export default class Session {

    constructor(user_id) {
        this._db = new Database();
        this._signedIn = false;
        this._user = "no user assigned yet";
        this._currentRobot = "none";
        this._idleBehavior = "none";
        this._detectBehavior = "none";
        this._actions = this._db.getActionCollection();
        
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

    getBehaviors = (reference = false) => {
        if(reference) {
            return this._db.getBehaviorCollection();
        }
        else {
            return {idle: this._idleBehavior, detect: this._detectBehavior};
        }
    }

    getRobots = (reference = false)  => {
        if(reference) {
            return this._db.getRobotCollection();
        }
        else {
            return this._user.getRobotList();
        }
    }

    getRobotTags = () => {
        return this._db.getRobotTagCollection();
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

    updateUser = (ref, obj) => {
        return this._db.updateUser(ref, obj);
    }
}