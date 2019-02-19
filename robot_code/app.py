import json, functools, time, sys
from threading import Thread
from sys import path
from multiprocessing import Process

config_file = open('config.json')
config = json.load(config_file)
config_file.close()
path.insert(0, config["home_path"])

from build import brain, motor, robot, database, queues, logger, speaker


def init():
    rob = robot.Robot()
    rob.id = config["robotid"]

    #br = brain.Brain(queues.brain_motor_queue, queues.brain_microphone_queue, queues.brain_database_queue, queues.brain_camera_queue, "")
    #mtr = motor.Motor(queues.brain_motor_queue)
    db = database.Database(config) 
    initialized = db.initialize(rob)

    if initialized == 1:  
        db.create_subscriber_model()

        counter = 0
        while rob.isInitialized() is False:
            if counter%4 == 0 and counter == 0:
                print("Waiting for robot initialization", end="\r")
            elif counter%4 == 1:
                print("Waiting for robot initialization.", end="\r")
            elif counter%4 == 2:
                print("Waiting for robot initialization..", end="\r")
            elif counter %4 == 3:
                print("Waiting for robot initialization...", end="\r")
                counter = -1
            else:
                counter = -1

            counter += 1
            time.sleep(0.2)

        if rob.power is False:
            queues.logger_queue.put("turn off")
            return

        br = brain.Brain(db, rob, config)
        mtr = motor.Motor(queues.brain_motor_queue)
        #spkr = speaker.Speaker(queues.brain_speaker_queue)
        brain_thread = Thread(target=functools.partial(br.begin))
        motor_thread = Thread(target=functools.partial(mtr.run))
        #speaker_thread = Thread(target=functools.partial(spkr.run))
        logger_thread = Thread(target=functools.partial(logger.runLogger))
        brain_thread.start()
        motor_thread.start()
        logger_thread.start()
        #speaker_thread.start()
    else:
        return


if __name__ == "__main__":
    init()



