import json, functools, time, sys
from threading import Thread
from sys import path
from multiprocessing import Process

# Fetches and loads config file
config_file = open('config.json')
config = json.load(config_file)
config_file.close()
path.insert(0, config["home_path"])

from build import brain, motor, robot, database
from build import queues, logger, speaker, notification_manager
from build import light, camera, uploader

def runSpeakerThread():
    speaker_object = speaker.Speaker(queues.brain_speaker_queue)
    speaker_thread = Thread(target=functools.partial(speaker_object.run))
    speaker_thread.start()
    return speaker_thread

def runLightThread(pin = 16):
    light_object = light.Light(queues.brain_sensor_queue, pin)
    light_thread = Thread(target=functools.partial(light_object.run))
    light_thread.start()
    return light_thread

def runCameraThread(pin = 12, pos = 7, capture_path = config["capture_path"]):
    camera_object = camera.Camera(queues.brain_camera_queue, pin, pos, capture_path)
    camera_thread = Thread(target=functools.partial(camera_object.run))
    camera_thread.start()
    return camera_thread

def runMotorThread():
    motor_object = motor.Motor(queues.brain_motor_queue)
    motor_thread = Thread(target=functools.partial(motor_object.run))
    motor_thread.start()
    return motor_thread

def runBrainThread(db, rob, config):
    brain_object = brain.Brain(db, rob, config)
    brain_thread = Thread(target=functools.partial(brain_object.begin))
    brain_thread.start()
    return brain_thread

def runLoggerThread():
    logger_thread = Thread(target=functools.partial(logger.runLogger))
    logger_thread.start()
    return logger_thread

def runNotificationManager(rob, config, initialized = False):
    notifier_object = notification_manager.NotificationManager(queues.brain_notifier_queue, config, initialized, rob)
    notifier_thread = Thread(target=functools.partial(notifier_object.run))
    notifier_thread.start()
    return notifier_thread

def runUploader(config, rob):
    uploader_object = uploader.Uploader(queues.brain_uploader_queue, config, rob)
    uploader_thread = Thread(target=functools.partial(uploader_object.run))
    uploader_thread.start()
    return uploader_thread

def initialize_threads(db, rob, off = True):
    if rob.power is True and off == True:
        off = False
        print("Turned on!")
        try:
            brain_thread = runBrainThread(db=db,rob=rob,config=config)
            #motor_thread = runMotorThread()
            notification_manager_thread = runNotificationManager(rob=rob,config=config,initialized=True)

            speaker_thread = runSpeakerThread()
            camera_thread = runCameraThread(pin=12, pos = 7, capture_path = config["capture_path"])
            light_thread = runLightThread(pin=11)
            log_thread = runLoggerThread()
            uploader_thread = runUploader(config=config, rob=rob)

            brain_thread.join()
            #motor_thread.join()
            notification_manager_thread.join()
            speaker_thread.join()
            camera_thread.join()
            light_thread.join()
            uploader_thread.join()
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



