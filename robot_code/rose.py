
import json, functools, time, sys, argparse
from threading import Thread
from sys import path
from multiprocessing import Process

# Fetches and loads config file
config_file = open('config.json')
config = json.load(config_file)
config_file.close()
path.insert(0, config["home_path"])

from build import database, queues, robot

def runSpeakerThread():
    from build import speaker
    speaker_object = speaker.Speaker(queues.brain_speaker_queue)
    speaker_thread = Thread(target=functools.partial(speaker_object.run))
    speaker_thread.start()
    return speaker_thread

def runLightThread(pin = 16):
    from build import light
    light_object = light.Light(queues.brain_sensor_queue, pin)
    light_thread = Thread(target=functools.partial(light_object.run))
    light_thread.start()
    return light_thread

def runCameraThread(pin = 12, pos = 7, capture_path = config["capture_path"]):
    from build import camera
    camera_object = camera.Camera(queues.brain_camera_queue, pin, pos, capture_path)
    camera_thread = Thread(target=functools.partial(camera_object.run))
    camera_thread.start()
    return camera_thread

def runMotorThread():
    from build import motor
    motor_object = motor.Motor(queues.brain_motor_queue)
    motor_thread = Thread(target=functools.partial(motor_object.run))
    motor_thread.start()
    return motor_thread

def runMicrophoneThread(config):
    from build import microphone
    microphone_object = microphone.Microphone(queues.brain_microphone_queue, config)
    microphone_thread = Thread(target=functools.partial(microphone_object.run))
    microphone_thread.start()
    return microphone_thread

def runBrainThread(db, rob, config):
    from build import brain
    brain_object = brain.Brain(db, rob, config)
    brain_thread = Thread(target=functools.partial(brain_object.begin))
    brain_thread.start()
    return brain_thread

def runLoggerThread():
    from build import logger
    logger_thread = Thread(target=functools.partial(logger.runLogger))
    logger_thread.start()
    return logger_thread

def runNotificationManager(rob, config, initialized = False):
    from build import notification_manager
    notifier_object = notification_manager.NotificationManager(queues.brain_notifier_queue, config, initialized, rob)
    notifier_thread = Thread(target=functools.partial(notifier_object.run))
    notifier_thread.start()
    return notifier_thread

def runUploader(config, rob):
    from build import uploader
    uploader_object = uploader.Uploader(queues.brain_uploader_queue, config, rob)
    uploader_thread = Thread(target=functools.partial(uploader_object.run))
    uploader_thread.start()
    return uploader_thread

def allThreads(db, rob, config):
    try:
        brain_thread = runBrainThread(db=db,rob=rob,config=config)
        motor_thread = runMotorThread()
        microphone_thread = runMicrophoneThread(config)
        notification_manager_thread = runNotificationManager(rob=rob,config=config,initialized=True)
        speaker_thread = runSpeakerThread()
        camera_thread = runCameraThread(pin=12, pos = 7, capture_path = config["capture_path"])
        light_thread = runLightThread(pin=11)
        uploader_thread = runUploader(config=config, rob=rob)

        return (brain_thread, motor_thread, microphone_thread, notification_thread, speaker_thread, camera_thread, light_thread, uploader_thread)
    except Exception as e:
        print(str(e))
        sys.exit()

def setCMD():
    parser = argparse.ArgumentParser(description="ROSE Command Line tool to test modules")
    parser.add_argument("-mo", "--motor", help="Set the motor module", action="store_true")
    parser.add_argument("-mi", "--microphone", help="Set the microphone module", action="store_true")
    parser.add_argument("-c","--camera", help="Set the camera module", action="store_true")
    parser.add_argument("-n","--notifier", help="Set the notifier module", action="store_true")
    parser.add_argument("-u","--uploader", help="Set the uploader module", action="store_true")
    parser.add_argument("-s","--speaker", help="Set the speaker module", action="store_true")
    parser.add_argument("-l","--light", help="Set the light module", action="store_true")
    parser.add_argument("-a","--all", help="Set all of the modules", action="store_true")
    parser.add_argument("-q","--no_log", help="Remove all file logging", action="store_true")

    args = parser.parse_args()
    
    return args

def parseArgs(args, db, rob, config):
    counter = 1

    while counter > 0:
        while not rob.power:
            print("Sleeping...")
            time.sleep(1)

        print("Turn On!")
        if args.all or len(sys.argv) <= 1:
            threads = allThreads(db=db, rob=rob, config=config)
            if not args.no_log:
                runLoggerThread()
        else:   
            threads = []
            threads.append(runBrainThread(db=db, rob=rob, config=config))

            if args.motor:
                threads.append(runMotorThread())
            if args.microphone:
                threads.append(runMicrophoneThread(config=config))
            if args.notifier:
                threads.append(runNotificationManager(rob=rob, config=config, initialized=True))
            if args.speaker:
                threads.append(runSpeakerThread())
            if args.camera:
                threads.append(runCameraThread(pin=12, pos=7, capture_path = config["capture_path"]))
            if args.light:
                threads.append(runLightThread(pin=11))
            if args.uploader:
                threads.append(runUploader(config=config, rob=rob))
            if not args.no_log:
                runLoggerThread()
            
        for thread in threads:
            thread.join()

        if not args.no_log:
            logger.write("off")
        
        if not args.mobile:
            counter -= 1

        print("Turn Off")
    
def init(parser = None):
    rob = robot.Robot()
    rob.id = config["robotid"]
    off = True
    db = database.Database(config) 
    initialized = db.initialize(rob)

    if initialized == 1:  
        db.create_subscriber_model()

        while rob.isInitialized() is False:
            print("Initializing...")
        
        parseArgs(parser, db, rob, config)

if __name__ == "__main__":
    parser = setCMD()
    init(parser)



