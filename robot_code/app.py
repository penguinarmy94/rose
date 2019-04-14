#!/usr/bin/python3
import argparse
import os
import json, functools, sys
from time import sleep
from threading import Thread
from sys import path
from multiprocessing import Process

appName = "ROSE Controller"
appVersion = "1.0"
logLevels = ["none", "info", "debug"]
devices = ["mic", "camera", "speaker", "led", "uploader", "notifier", "motor"]
configFile = "/home/pi/Desktop/Projects/rose/robot_code/config.json"
relay_pins = {"flasher":11, "light":15}

parser = argparse.ArgumentParser("app.py")
parser.add_argument("-v", "--verbose", help = "Print debug info to console", action = "store_true", default = False)
parser.add_argument("-l", "--loglevel", help = "Log level={none|info|debug}. Default: none", default = "none")
parser.add_argument("-d", "--logdays", help = "Days to keep logs", action = "store", type=int, default = 1)
parser.add_argument("-p", "--purge", help = "Remove all logs and captures", action = "store_true", default = False) 
parser.add_argument("-c", "--console", help = "Show interactive console", action = "store_true", default = False)
parser.add_argument("-i", "--id", help = "set robot id. If arg ends in .id, will read from file.", action = "store")
parser.add_argument("-s", "--skip", help = "Skip enabling devices: mic, camera, speaker (separate devices with space)", nargs = "+")
args = parser.parse_args()

# Checking log level from command line arg
if not args.loglevel in logLevels:
	if args.verbose:
		print("Invalid log level '{}'. Assuming 'none'...".format(args.loglevel))
	args.loglevel = "none"

# Removing deveices from devices list that should be skipped
if (args.skip):
	for skip in args.skip:
		if skip in devices:
			if args.verbose:
				print("Skipping {}.".format(skip))
			devices.remove(skip)

# Upddate robot id in config.json. If file.id is given, the value from the file
# is read and used as id
with open(configFile, 'r') as jsonFile:
    config = json.load(jsonFile)
if args.id:
    if args.id[-3:] == '.id':
        with open(args.id, 'r') as idFile:
            args.id = idFile.read().splitlines()[0]

    if args.verbose:
        print("Changing robot id to '{}'...".format(args.id))
    config["robotid"] = args.id
    with open(configFile, 'w') as jsonFile:
        json.dump(config, jsonFile)

path.insert(0, config["home_path"])

# If --purge is set, delete all logs and capture data
if args.purge:
    for aPath in [config['log_path'], config['capture_path']]:
        try:
            for aFile in os.listdir(aPath):
                aFilePath = os.path.join(aPath, aFile)
                
                if os.path.isfile(aFilePath):
                    if args.verbose:
                        print("Deleting {}...".format(aFilePath))
                        os.unlink(aFilePath)
                        
        except Exception as e:
            if args.verbose:
                print(e)

from build import brain, motor, robot, database
from build import queues, logger, speaker, notification_manager
from build import relay, camera, uploader

if 'mic' in devices:
    from build import microphone

def runSpeakerThread(config):
    speaker_object = speaker.Speaker(queues.brain_speaker_queue)
    speaker_thread = Thread(target=functools.partial(speaker_object.run))
    speaker_thread.start()
    return speaker_thread

def runRelayThread(pins):
    relay_object = relay.Relay(queues.brain_sensor_queue, pins)
    relay_thread = Thread(target=functools.partial(relay_object.run))
    relay_thread.start()
    return relay_thread

def runCameraThread(pin = 13, pos = 7, capture_path = config["capture_path"]):
    camera_object = camera.Camera(queues.brain_camera_queue, pin, pos, capture_path)
    camera_thread = Thread(target=functools.partial(camera_object.run))
    camera_thread.start()
    return camera_thread

def runMotorThread():
    motor_object = motor.Motor(queues.brain_motor_queue)
    motor_thread = Thread(target=functools.partial(motor_object.run))
    motor_thread.start()
    return motor_thread

def runMicrophoneThread(config):
    microphone_object = microphone.Microphone(queues.brain_microphone_queue, config)
    microphone_thread = Thread(target=functools.partial(microphone_object.run))
    microphone_thread.start()
    return microphone_thread

def runBrainThread(db, rob, config, args):
    brain_object = brain.Brain(db, rob, config, args)
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
    if args.verbose:
        print("Entering app.initialize_threads()")

    iCounter = 0
    iMaxCounter = 4
    while not rob.power and not args.console:
	        print("Waiting for robot to turn on" + "." * (iCounter % iMaxCounter) + " " * iMaxCounter, end='\r', flush = True)
	        iCounter += 1
	        sleep(.2)

    if rob.power is True and off == True:
        off = False
        print("Robot has been turned on.")
        try:
            brain_thread = runBrainThread(db=db,rob=rob,config=config,args=args)
            #motor_thread = runMotorThread()

            if 'mic' in devices:
                microphone_thread = runMicrophoneThread(config)
            if 'motor' in devices:
                motor_thread = runMotorThread()
            if 'notifier' in devices:
                notification_manager_thread = runNotificationManager(rob=rob,config=config,initialized=True)
            if 'speaker' in devices:
                speaker_thread = runSpeakerThread(config = config)
            if 'camera' in devices:
                camera_thread = runCameraThread(pin=13, pos = 7, capture_path = config["capture_path"])
            if 'led' in devices:
                relay_thread = runRelayThread(pins = relay_pins)
            if 'uploader' in devices:
                uploader_thread = runUploader(config=config, rob=rob)
            
            log_thread = runLoggerThread()

            if (args.console):
                print("\n{} Interactive Shell v{}\n".format(appName, appVersion))
                    
                while not off:
                    prompt = config["prompt"]
                    command = input(prompt)

                    if (command == "help"):
                        print("Available commands:")
                        print("help:    This help screen")
                        print("stop:    Turn off the ROSEbot")
                        print("start:   Turn on the ROSEbot")
                        print("status:  Display ROSEbot status")
                        print("exit:    Stop ROSE controller")
                    
                    if (command == "stop"):
                        rob.power = False
                        db.update_robot()

                    if (command == "start"):
                        rob.power = True
                        db.update_robot()

                    if (command == "status"):
                        print("Power:   {}".format(rob.power))

                    if (command == "stop"):
                        rob.power = False
                        db.update_robot()

                    if (command == "stop"):
                        rob.power = False
                        db.update_robot()
                        sys.exit()
                    

            brain_thread.join()

            if 'mic' in devices:
                microphone_thread.join()
                print("Microphone")
            if 'motor' in devices:
                motor_thread.join()
            if 'notifier' in devices:
                notification_manager_thread.join()
            if 'speaker' in devices:
                speaker_thread.join()
            if 'camera' in devices:
                camera_thread.join()
            if 'led' in devices:
                relay_thread.join()
            if 'uploader' in devices:
                uploader_thread.join()


            # Only runs when all trhreads exited?
            if args.verbose:
                print("goimg to turning off...")
            
            logger.write("turn off")
            off = True
            print("Turned off!")

            if args.verbose:
                print("Exiting app.initialize_threads() from IF clause")

            return off
        except Exception as e:
            print(str(e))
    else:
        if args.verbose:
            print("Exiting app.initialize_threads() from ELSE clause")

        return off


def initialize_threads2(db, rob, off = True):

    if args.verbose:
        print("Entering app.initialize_threads2()")

    if (args.console):
        print("\n{} Interactive Shell v{}\n".format(appName, appVersion))
            
    while True:

        iCounter = 0
        iMaxCounter = 4
        while not rob.power and not args.console:
	        print("Waiting for robot to turn on" + "." * (iCounter % iMaxCounter) + " " * iMaxCounter, end='\r', flush = True)
	        iCounter += 1
	        sleep(.2)

        if rob.power is True and off == True:
            off = False
            print("Robot has been turned on.")
            try:
                brain_thread = runBrainThread(db=db,rob=rob,config=config,args=args)
                #motor_thread = runMotorThread()

                if 'mic' in devices:
                    microphone_thread = runMicrophoneThread(config)
                if 'motor' in devices:
                    motor_thread = runMotorThread()
                if 'notifier' in devices:
                    notification_manager_thread = runNotificationManager(rob=rob,config=config,initialized=True)
                if 'speaker' in devices:
                    speaker_thread = runSpeakerThread(config = config)
                if 'camera' in devices:
                    camera_thread = runCameraThread(pin=13, pos = 7, capture_path = config["capture_path"])
                if 'led' in devices:
                    relay_thread = runRelayThread(pins = relay_pins)
                if 'uploader' in devices:
                    uploader_thread = runUploader(config=config, rob=rob)
            
                log_thread = runLoggerThread()
            
            except Exception as e:
                print(str(e))


            if rob.power is False and off == False:
                brain_thread.join()

                if 'mic' in devices:
                    microphone_thread.join()
                if 'motor' in devices:
                    motor_thread.join()
                if 'notifier' in devices:
                    notification_manager_thread.join()
                if 'speaker' in devices:
                    speaker_thread.join()
                if 'camera' in devices:
                    camera_thread.join()
                if 'led' in devices:
                    relay_thread.join()
                if 'uploader' in devices:
                    uploader_thread.join()

                # Only runs when all trhreads exited?
                if args.verbose:
                    print("goimg to turning off...")
            
                logger.write("turn off")
                off = True
                print("Turned off!")

                if args.verbose:
                    print("Exiting app.initialize_threads() from IF clause")

            
            if args.console:
                prompt = config["prompt"]
                command = input(prompt)

                if (command == "help"):
                    print("Available commands:")
                    print("help:    This help screen")
                    print("stop:    Turn off the ROSEbot")
                    print("start:   Turn on the ROSEbot")
                    print("status:  Display ROSEbot status")
                    print("exit:    Stop ROSE controller")
                    
                if (command == "stop"):
                    rob.power = False
                    db.update_robot()

                if (command == "start"):
                    rob.power = True
                    db.update_robot()

                if (command == "status"):
                    print("Power:   {}".format(rob.power))

                if (command == "stop"):
                    rob.power = False
                    db.update_robot()

                if (command == "stop"):
                    rob.power = False
                    db.update_robot()
                    sys.exit()
    

def init():
    if args.verbose:
        print("Entering app.init()")

    rob = robot.Robot()
    rob.id = config["robotid"]
    off = True
    db = database.Database(config) 
    initialized = db.initialize(rob)

    if initialized == 1:  
        db.create_subscriber_model()

        iCounter = 0
        iMaxCounter = 4
        iTimeoutCounter = 100
        while not rob.isInitialized() and iCounter < iTimeoutCounter:
	        print("Robot initializing" + "." * (iCounter % iMaxCounter) + " " * iMaxCounter, end='\r', flush = True)
	        iCounter += 1
	        sleep(.2)

        if iCounter < iTimeoutCounter:
            print("Robot initializing completed.")
        else:
            print("Robot initializing failed with timeout [Possible connection problem].")

        while True:
            if rob.battery <= 0:
                rob.power = False
                db.update_robot()
                off = True
                
            off = initialize_threads2(db,rob,off)

        
if __name__ == "__main__":
    init()



