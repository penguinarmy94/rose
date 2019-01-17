export default class User {
    constructor(u_name = "No Name", robots = [], behaviors = []) {
        this._username = u_name;
        this._robots = robots;
        this._behaviors = behaviors;
        this._numofrobots = robots.length;
        this._numofbehaviors = behaviors.length;
    }

    addRobot = (robot) => {
        this._robots.push(robot);
        this._numofrobots += 1;
    }

    addBenavior = (behavior) => {
        this._behaviors.push(behavior);
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