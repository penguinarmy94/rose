import json, functools
from threading import Thread
from sys import path

config_file = open('config.json')
config = json.load(config_file)
config_file.close()
path.insert(0, config["home_path"])

from build import brain, motor, robot, database, queues, logger


def init():
    rob = robot.Robot()
    rob.id = config["robotid"]

    #br = brain.Brain(queues.brain_motor_queue, queues.brain_microphone_queue, queues.brain_database_queue, queues.brain_camera_queue, "")
    #mtr = motor.Motor(queues.brain_motor_queue)
    db = database.Database(config) 
    initialized = db.initialize(rob)

    if initialized == 1:  
        db.create_subscriber_model()

        print("Waiting for robot initialization")
        counter = 0
        while rob.isInitialized() is False:
            if counter%4 == 0 and counter == 0:
                print("Waiting for robot initialization\r")
            elif counter%4 == 1:
                print("Waiting for robot initialization.\r")
            elif counter%4 == 2:
                print("Waiting for robot initialization..\r")
            elif counter %4 == 3:
                print("Waiting for robot initialization...\r")
                counter = -1
            else:
                counter = -1

            counter += 1

        br = brain.Brain(db, rob, config)
        mtr = motor.Motor(queues.brain_motor_queue)
        brain_thread = Thread(target=functools.partial(br.begin))
        motor_thread = Thread(target=functools.partial(mtr.run))
        logger_thread = Thread(target=functools.partial(logger.runLogger))
        brain_thread.start()
        motor_thread.start()
        logger_thread.start()
    else:
        return

    #motor_thread = Thread(target=functools.partial(mtr.run))
    #motor_thread.start()
    #brain_thread = Thread(target=functools.partial(br.begin))
    #brain_thread.start()


if __name__ == "__main__":
    init()



