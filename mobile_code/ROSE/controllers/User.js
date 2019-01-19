export default class User {
    constructor(user) {
        if(user.username && user.robots && user.behaviors) {
            this._username = user.username;
            this._robots = [];
            this._behaviors = [];
            this._numofrobots = 0;
            this._numofbehaviors = 0;

            user.robots.forEach((value, index) => {               
                value.get().then((doc) => {
                    if(doc.exists) {
                        this._robots.push(doc.data());
                        this._numofrobots += 1;
                    }
                }).catch((error) => {
                    alert(error);
                });
            });
            user.behaviors.forEach((value, index) => {
                value.get().then((doc) => {
                    if(doc.exists) {
                        this._behaviors.push(doc.data());
                        this._numofbehaviors += 1;
                    }
                }).catch((error) => {
                    alert(error);
                });
            });
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

    removeBehavior = (behavior) => {
        let index = 0;


        for (index = 0; index < this._numofbehaviors; index++) {
            if (this._behaviors[index] === behavior) {
                //delete 
            }
        }

    }
}