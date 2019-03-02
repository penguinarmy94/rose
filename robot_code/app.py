import json, functools, time, sys
from threading import Thread
from sys import path
from multiprocessing import Process

config_file = open('config.json')
config = json.load(config_file)
config_file.close()
path.insert(0, config["home_path"])
#path.insert(0, config["windows_home_path"])

from build import brain, motor, robot, database, queues, logger, speaker

def runSpeakerThread():
    spkr = speaker.Speaker(queues.brain_speaker_queue)
    speaker_thread = Thread(target=functools.partial(spkr.run))
    speaker_thread.start()
    return speaker_thread

def runMotorThread():
    mtr = motor.Motor(queues.brain_motor_queue)
    motor_thread = Thread(target=functools.partial(mtr.run))
    motor_thread.start()
    return motor_thread

def runBrainThread(db, rob, config):
    br = brain.Brain(db, rob, config)
    brain_thread = Thread(target=functools.partial(br.begin))
    brain_thread.start()
    return brain_thread

def runLoggerThread():
    logger_thread = Thread(target=functools.partial(logger.runLogger))
    logger_thread.start()
    return logger_thread

def init():
    rob = robot.Robot()
    rob.id = config["robotid"]

    db = database.Database(config) 
    initialized = db.initialize(rob)

    if initialized == 1:  
        db.create_subscriber_model()

        while rob.isInitialized() is False:
            print("Waiting for robot initialization", end="\r")
            time.sleep(0.2)
            print("Waiting for robot initialization.", end="\r")
            time.sleep(0.2)
            print("Waiting for robot initialization..", end="\r")
            time.sleep(0.2)
            print("Waiting for robot initialization...", end="\r")
            time.sleep(0.2)

        if rob.battery == 0:
            rob.power = False
            db.update_robot()
            return
            
        if rob.power is False:
            rob.power = True
            db.update_robot()

        try:
            br_thread = runBrainThread(db,rob,config)
            mtr_thread = runMotorThread()
            #spk_thread = runSpeakerThread()
            log_thread = runLoggerThread()

            br_thread.join()
            mtr_thread.join()
            #spk_thread.join()
            logger.write("turn off")
        except Exception as e:
            print(str(e))
    else:
        return


if __name__ == "__main__":
    init()



