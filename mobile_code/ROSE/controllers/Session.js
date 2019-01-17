import Database from './Database';
import User from './User';

class Session {

    constructor(username) {
        this._db = new Database();
        
        let robots = this._db.getRobots(username);
        let behaviors = this._db.getBehaviors(username);

        this._user = new User(username, robots, behaviors);
    }
    
    print = () => {
        alert(this._name);
    }

    updateName = (name) => {
        this._name = name;
    }
}

export default Session;