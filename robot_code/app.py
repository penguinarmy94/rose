import json, functools
from threading import Thread
from sys import path

config_file = open('config.json')
config = json.load(config_file)
config_file.close()
path.insert(0, config["home_path"])

from build import brain, robot, database, queues


def init():
    rob = robot.Robot()
    rob.id = config["robotid"]

    #br = brain.Brain(queues.brain_motor_queue, queues.brain_microphone_queue, queues.brain_database_queue, queues.brain_camera_queue, "")
    #mtr = motor.Motor(queues.brain_motor_queue)
    db = database.Database(config) 
    initialized = db.initialize(rob)

    if initialized == 1:  
        db.create_subscriber_model()

        print("Waiting for robot initialization...")
        while rob.isInitialized() is False:
            print("...")

        br = brain.Brain(db, rob, config)
        brain_thread = Thread(target=functools.partial(br.begin))
        brain_thread.start()
    else:
        return

    #motor_thread = Thread(target=functools.partial(mtr.run))
    #motor_thread.start()
    #brain_thread = Thread(target=functools.partial(br.begin))
    #brain_thread.start()


if __name__ == "__main__":
    init()



