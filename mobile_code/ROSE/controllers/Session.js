import Database from './Database';
import User from './User';

class Session {

    constructor(user_id) {
        this._db = new Database();
        this._signedIn = false;
        this._user = "no user assigned yet";
        this._actions = [];
        this._currentRobot = "none";
        
        let db_user = this._db.getUser(user_id);

        if(db_user) {
            this._user = "abc";           
            db_user.get().then((doc) => {
                if(doc.exists) {
                    this._user = new User(doc.data());
                }
                else {
                    alert("no data found");
                }

            }).catch((error) => {
                alert(error);
            })
            
            this._signedIn = true;
            this._actions = this._db.getActions();
        }
        else {
            this._signedIn = false;
        }
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
}

export default Session;