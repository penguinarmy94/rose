#!/usr/bin/python3
import argparse
import os
import json, functools, sys
from time import sleep
from threading import Thread
from sys import path
from multiprocessing import Process
import datetime

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

help =""
try:
    with open(config["help_file"], 'r') as jsonFile:
        help = json.load(jsonFile)
except:
    pass

if 'mic' in devices:
    from build import microphone

def runSpeakerThread(config):
    speaker_object = speaker.Speaker(queues.brain_speaker_queue, config)
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

def runUploader(rob, config):
    print("Entering runUploader.")
    uploader_object = uploader.Uploader(queues.brain_uploader_queue, rob, config)
    uploader_thread = Thread(target=functools.partial(uploader_object.run))
    uploader_thread.start()
    return uploader_thread

def initialize_threads(db, rob, off = True):
    if args.verbose:
        print("Entering app.initialize_threads2()")

    if (args.console):
        print("\n{} Interactive Shell v{}\n".format(appName, appVersion))
        prompt = config["prompt"]
        prompt = prompt.replace('[ID]', config['robotid'])

    while True:

        iCounter = 0
        iMaxCounter = 4
        while not rob.power and not args.console:
	        print("Waiting for robot to turn on" + "." * (iCounter % iMaxCounter) + " " * iMaxCounter, end='\r', flush = True)
	        iCounter += 1
	        sleep(.2)
        
        print("Robot has been turned on.   " + " " * iMaxCounter)
        try:
            brain_thread = runBrainThread(db=db,rob=rob,config=config,args=args)

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
                print("Run uploader thread")
                uploader_thread = runUploader(config=config, rob=rob)
        
            log_thread = runLoggerThread()
        
        except Exception as e:
            print(str(e))


        if args.verbose:
            print("Stopping brain thread...")
        
        brain_thread.join()

        if 'mic' in devices:
            if args.verbose:
                print("Stopping mic thread...")
            microphone_thread.join()
                
        if 'motor' in devices:
            if args.verbose:
                print("Stopping motor thread...")
            motor_thread.join()
  
        if 'notifier' in devices:
            if args.verbose:
                print("Stopping notifier thread...")              
            notification_manager_thread.join()

        if 'speaker' in devices:
            if args.verbose:
                print("Stopping speaker thread...")
            speaker_thread.join()

        if 'camera' in devices:
            if args.verbose:
                print("Stopping camera thread...")              
            camera_thread.join()

        # change to relay
        #if 'led' in devices:
        #    if args.verbose:
        #        print("Stopping relay thread...")              
        #    relay_thread.join()

        #if 'uploader' in devices:
        #    if args.verbose:
        #        print("Stopping uploader thread...")              
        #    uploader_thread.join()
                
        logger.write("turn off")
        print("Robot has been turned off.")


def initialize_threads2(db, rob, off = True):

    if args.verbose:
        print("Entering app.initialize_threads2()")

    if (args.console):
        print("\n{} Interactive Shell v{}\n".format(appName, appVersion))
        prompt = config["prompt"]
        prompt = prompt.replace('[ID]', config['robotid'])

    while True:

        iCounter = 0
        iMaxCounter = 4
        while not rob.power and not args.console:
	        print("Waiting for robot to turn on" + "." * (iCounter % iMaxCounter) + " " * iMaxCounter, end='\r', flush = True)
	        iCounter += 1
	        sleep(.2)

        if rob.power is True and off == True:
            off = False
            print("Robot has been turned on.   " + " " * iMaxCounter)
            try:
                brain_thread = runBrainThread(db=db,rob=rob,config=config,args=args)

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
                    print("Run uploader thread")
                    uploader_thread = runUploader(config=config, rob=rob)
            
                log_thread = runLoggerThread()
            
            except Exception as e:
                print(str(e))


        if not (rob.power or off):
                 
            if args.verbose:
                print("Stopping brain thread...")
            brain_thread.join()

            if 'mic' in devices:
                if args.verbose:
                    print("Stopping mic thread...")
                microphone_thread.join()
                
            if 'motor' in devices:
                if args.verbose:
                    print("Stopping motor thread...")
                motor_thread.join()
  
            if 'notifier' in devices:
                if args.verbose:
                    print("Stopping notifier thread...")              
                notification_manager_thread.join()

            if 'speaker' in devices:
                if args.verbose:
                    print("Stopping speaker thread...")
                speaker_thread.join()

            if 'camera' in devices:
                if args.verbose:
                    print("Stopping camera thread...")              
                camera_thread.join()

            # change to relay
            if 'led' in devices:
                if args.verbose:
                    print("Stopping relay thread...")              
                relay_thread.join()

            if 'uploader' in devices:
                if args.verbose:
                    print("Stopping uploader thread...")              
                uploader_thread.join()
                
            logger.write("turn off")
            off = True
            print("Robot has been turned off.")
              
        if args.console:
            # Put help in def and return on/off value
            curr_prompt = prompt.replace('[STATUS]', 'ON' if rob.power else 'OFF')
            curr_prompt = curr_prompt.replace('[YEAR]', '{0:%Y}'.format(datetime.datetime.now()))
            curr_prompt = curr_prompt.replace('[MONTH]', '{0:%m}'.format(datetime.datetime.now()))
            curr_prompt = curr_prompt.replace('[DAY]', '{0:%d}'.format(datetime.datetime.now()))
            curr_prompt = curr_prompt.replace('[HOUR]', '{0:%H}'.format(datetime.datetime.now()))
            curr_prompt = curr_prompt.replace('[MINUTE]', '{0:%M}'.format(datetime.datetime.now()))

            command = input(curr_prompt).strip()
            error = "Invalid command. Type 'help' for a list of valid commands."

            # Process single-word commands first
            if not command:
                error = ''

            elif command == "start":
                error = ''
                if rob.power:
                    print("Robot already on")
                else:
                    rob.power = True
                    off = True
                    db.update_power()

            elif command == "stop":
                error = ''
                if not rob.power:
                    print("Robot already off")
                else:
                    rob.power = False
                    off = False
                    db.update_power()

            elif command == "status":
                error = ''
                print("Power:   {}".format(rob.power))

            elif command == "exit":
                error = ''
                if rob.power:
                    print("Please stop robot before exiting.")
                else: 
                    sys.exit()
                    
            else:
                # Now parse input for complex commands          
                value = arglist = ''

                try:
                    command, value = command.split("=")
                except ValueError:
                    pass

                if command == 'prompt' and value:
                    command = 'config prompt'
                    prompt = prompt.replace('[ID]', config['robotid'])
            
                try:
                    command, arglist = command.split(None, 1)
                    arglist = arglist.split()
                except ValueError:
                    pass

                if command == 'config':
                    if value == "":
                        if arglist[0]:
                            try:
                                print("{} : {}".format(config[arglist[0]]))
                                isError = ''
                            except:
                                error = "Invalid config value. Type 'config' for a lst of all values."
                        else:
                            iCounter = 1
                            for key, value in config.items():
                                print("[{}] {} : {}".format(iCounter, key, value))
                                iCounter += 1
                            error = ''
                    else:
                        try:
                            with open(configFile, 'r') as jsonFile:
                                tmpConfig = json.load(jsonFile)
             
                            tmpConfig[arglist[0]] = value

                            with open(configFile, 'w') as jsonFile:
                                json.dump(tmpConfig, jsonFile)

                            config[arglist[0]] = value
                            if arglist[0] == 'prompt':
                                prompt = value
                                prompt = prompt.replace('[ID]', config['robotid'])    
                            
                            error = ''
                        except:
                            error = 'Error chagning config value'

                elif command == "log":
                    try:
                        iCounter = 0
                        for aFile in os.listdir(config['log_path']):
                            iCounter += 1
                            if True:    # Make LIST
                                print("[{}] {}".format(iCounter, aFile))
                                error = ''
                            else: #DELETE
                                aFilePath = os.path.join(config['log_path'], aFile)
                                error = ''
            
                                if os.path.isfile(aFilePath):
                                    try:
                                        os.unlink(aFilePath)
                                    except Exception as e:
                                        error = 'Failed to delete some files'
                
                    except Exception as e:
                        error = 'Error accessing log path'            

                elif command == 'command' and len(arglist) == 2 and value:
                    #run command
                    errpr = ''
            
                elif command == 'help' and len(arglist) < 2:
                    if (help):
                        try:
                            detail = arglist[0]	
                            if help[detail]['details']:
                                print("\nCommand:\t{} {}\nDescription:\t{}\n\nDetails:\n--------\n{}\n".format(detail, help[detail]['args'], help[detail]['default'], help[detail]['details']))
                            else:
                                print("There's nothing more to say...")
                            error = ''
                        except IndexError:
                            firstLine = True
                            for key, value in help.items():

                                if firstLine:
                                    print()
                                    firstLine = False

                                key = key + " " + value['args']
                                if len(key) < 10: 
                                    print("{}\t: {}".format(key, value['default']))
                                else:	
                                    print("{}:\n\t  {}".format(key, value['default']))
                            print()
                            error = ''
                        except KeyError:
                            # Invalid command
                            pass
                    else:
                        error = "Missing help file. No help available."       

            if error:
                print(error)     
                    

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
                
            off = initialize_threads(db,rob,off)

        
if __name__ == "__main__":
    init()



