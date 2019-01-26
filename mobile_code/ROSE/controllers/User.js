export default class User {
    constructor(user) {
        if(user.username && user.robots && user.behaviors) {
            this._username = user.username;
            this._robots = user.robots;
            this._behaviors = user.behaviors;
            this._numofrobots = user.robots.length;
            this._numofbehaviors = user.behaviors.length;
            this._userObj = user;
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

    addRobot = (robot) => {
        this._robots.push(robot);
        this._userObj.robots = this._robots;
        this._numofrobots += 1;
    }

    addBenavior = (behavior) => {
        this._behaviors.push(behavior);
        this._userObj.behaviors = this._behaviors;
        this._numofbehaviors += 1;
    }

    removeRobot = (robot) => {
        let index = 0;


        for (index = 0; index < this._numofrobots; index++) {
            if (this._robots[index] === robot) {
                //delete 
            }
        }
    }

    removeBehavior = (index) => {        
        this._behaviors.splice(index, 1);
        this._numofbehaviors -= 1;
    }

    getBehaviorList = () => {
        return this._behaviors;
    }
}