import json, functools, time, sys
from threading import Thread
from sys import path
from multiprocessing import Process

config_file = open('config.json')
config = json.load(config_file)
config_file.close()
path.insert(0, config["home_path"])
#path.insert(0, config["windows_home_path"])

from build import brain, motor, robot, database, queues, logger, speaker, notification_manager, light, camera

def runSpeakerThread():
    spkr = speaker.Speaker(queues.brain_speaker_queue)
    speaker_thread = Thread(target=functools.partial(spkr.run))
    speaker_thread.start()
    return speaker_thread

def runLightThread(pin=16):
    li = light.Light(queues.brain_sensor_queue, pin)
    light_thread = Thread(target=functools.partial(li.run))
    light_thread.start()
    return light_thread

def runCameraThread():
    ca = camera.Camera(queues.brain_camera_queue, pin)
    cam_thread = Thread(target=functools.partial(ca.run))
    cam_thread.start()
    return ca_thread

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

def runNotificationManager(rob, config, initialized = False):
    nm = notification_manager.NotificationManager(queues.brain_notifier_queue, config, initialized, rob)
    nm_thread = Thread(target=functools.partial(nm.run))
    nm_thread.start()
    return nm_thread

def initialize_threads(db, rob, off = True):
    if rob.power is True and off == True:
        off = False
        print("Turned on!")
        try:
            br_thread = runBrainThread(db=db,rob=rob,config=config)
            #mtr_thread = runMotorThread()
            nm_thread = runNotificationManager(rob=rob,config=config,initialized=True)
            spk_thread = runSpeakerThread()
            ca_thread = runCameraThread(pin=12)
            light_thread = runLightThread(pin=11)
            log_thread = runLoggerThread()

            br_thread.join()
            #mtr_thread.join()
            nm_thread.join()
            spk_thread.join()
            ca_thread.join()
            light_thread.join()
            logger.write("turn off")
            off = True
            print("Turned off!")
            return off
        except Exception as e:
            print(str(e))
    else:
        return off

def init():
    rob = robot.Robot()
    rob.id = config["robotid"]
    off = True
    db = database.Database(config) 
    initialized = db.initialize(rob)

    if initialized == 1:  
        db.create_subscriber_model()

        while rob.isInitialized() is False:
            print("Waiting for robot initialization")
            time.sleep(0.2)
            print("Waiting for robot initialization.")
            time.sleep(0.2)
            print("Waiting for robot initialization..")
            time.sleep(0.2)
            print("Waiting for robot initialization...")
            time.sleep(0.2)

        option = input('0 - Start in Mobile Mode\n1 - Start in Single Use Mode\n2 - Start in Command Line Mode\n\nChoice: ')
        
        if option == "0":
            while True:
                if rob.battery == 0:
                    rob.power = False
                    db.update_robot()
                    off = True
                
                off = initialize_threads(db,rob,off)
        elif option == "1":
            initialize_threads(db,rob)
        elif option == "2":
            option = 0
            while option != "2": 
                option = input('0 - Send message to camera\n1 - Send message to speaker\n2 - exit\n\nChoice: ')

                if option == "0":
                    cam_thread = runCameraThread()
                    logger = runLoggerThread()
                    message = input('\nWhat message would you like to send? ')
                    queues.brain_camera_queue.put(json.dumps({"type" : "camera", "message" : int(message)}))
                    queues.brain_camera_queue.put(json.dumps({"type": "off", "message" : "turn off"}))
                    cam_thread.join()
                    queues.logger_queue.put("turn off")
                    logger.join()
                elif option == "1":
                    spk_thread = runSpeakerThread()
                    logger = runLoggerThread()
                    message = input('\nWhat message would you like to send? ')
                    queues.brain_speaker_queue.put(json.dumps({"type" : "speaker", "message" : message}))
                    queues.brain_speaker_queue.put(json.dumps({"type": "off", "message" : "turn off"}))
                    spk_thread.join()
                    queues.logger_queue.put("turn off")
                    logger.join()
                elif option == "2":
                    break
                else:
                    print("Not a valid option")
                    continue
        else:
            print("%s Not a valid option!"%option)

if __name__ == "__main__":
    init()



