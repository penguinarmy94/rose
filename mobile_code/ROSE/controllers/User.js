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
        let index = 0;


        for (index = 0; index < this._numofrobots; index++) {
            if (this._robots[index] === robot) {
                //delete 
            }
        }
    }

    removeBehavior = (behavior) => { 
        alert(behavior.path);       
        for (index = 0; index < this._behaviors.length; index++) {
            if(this._behaviors[index].path === behavior.path) {
                this._behaviors.splice(index, 1);
                this._userObj.behaviors = this._behaviors;
                this._numofbehaviors -= 1;
                return;
            }
        }
    }

    getBehaviorList = () => {
        return this._behaviors;
    }
}