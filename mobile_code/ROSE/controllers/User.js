export default class User {
    constructor(user) {
        if(user.data().username && user.data().robots && user.data().behaviors) {
            this._username = user.data().username;
            this._robots = user.data().robots;
            this._behaviors = user.data().behaviors;
            this._numofrobots = user.data().robots.length;
            this._numofbehaviors = user.data().behaviors.length;
            this._userObj = user.data();
            this._userRef = user.ref;
            this._id = user.id;
        }
        else {
            this._username = "none";
            this._robots = [];
            this._behaviors = [];
            this._numofrobots = 0;
            this._numofbehaviors = 0;
            this._userObj = "none";
        }
    }

    getUserObject = () => {
        return this._userObj;
    }

    getUserRef = () => {
        return this._userRef;
    }

    getUserId = () => {
        return this._id;
    }

    addRobot = (robot) => {
        this._robots.push(robot);
        this._userObj.robots = this._robots;
        this._numofrobots += 1;
    }

    addBehavior = (behavior) => {
        this._behaviors.push(behavior);
        this._userObj.behaviors = this._behaviors;
        this._numofbehaviors += 1;
    }

    removeRobot = (robot) => {
        try {
            for (index = 0; index < this._numofrobots; index++) {
                if (this._robots[index].path === robot.ref.path) {
                    this._robots.splice(index, 1);
                    this._userObj.robots = this._robots;
                    this._numofrobots -= 1;
                    return true;
                }
            }
        }
        catch(error) {
            return false;
        }
    }

    removeBehavior = (behavior) => {
        try {       
            for (index = 0; index < this._behaviors.length; index++) {
                if(this._behaviors[index].path === behavior.ref.path) {
                    this._behaviors.splice(index, 1);
                    this._userObj.behaviors = this._behaviors;
                    this._numofbehaviors -= 1;
                    return true;
                }
            }
        }
        catch(error) {
            return false;
        }
    }

    getBehaviorList = () => {
        return this._behaviors;
    }

    getRobotList = () => {
        return this._robots;
    }
}