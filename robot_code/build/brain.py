import json, datetime, time, functools
from . import queues, logger, status_manager
from threading import Thread
import RPi.GPIO as GPIO

class Brain():
    __motorQueue = None
    __notifierQueue = None
    __microphoneQueue = None
    __speakerQueue = None
    __uploaderQueue = None
    __cameraQueue = None
    __robot = None
    __db = None
    __idle_behavior = None
    __detect_behavior = None
    __state = None
    __config = {}
    __args = {}
    __lastMessage = ""
    __lightOn = False
    __cameraPosition = 7
    __numberOfSensors = 1
    __updated = False
    __behaviorSet = False
    __buttonPin = None
    __buttonWaitTime = 3
    __buttonDebounceTime = 0.1
    __buttonSeen = None
    __buttonUp = True
    __buttonCounter = 0

    """
        Description: Constructor for Brain class

        Parameters
        ----------
        database: database.Database()
                    Description:
                        A database object for keeping track of Google Firestore events.
        robot: robot.Robot()
                    Description:
                        A robot object which keeps track of the robot object from Google Firestore
                        and its changes in both the database environment and the local environment
        config: Dictionary
                    Description:
                        A dictionary that has all of the constants for the application, such as
                        path to image directory, path to app.py directory, etc.
    """
    def __init__(self, database = None, robot = None, config = None, args = None, pin = 7):
        try:
            self.__motorQueue = queues.brain_motor_queue
            self.__notifierQueue = queues.brain_notifier_queue
            self.__microphoneQueue = queues.brain_microphone_queue
            self.__speakerQueue = queues.brain_speaker_queue
            self.__cameraQueue = queues.brain_camera_queue
            self.__sensorQueue = queues.brain_sensor_queue
            self.__uploaderQueue = queues.brain_uploader_queue
            self.__behaviorRef = {"idle": "", "detect": ""}
            self.__idle_behavior = []
            self.__detect_behavior = []
            self.__db = database
            self.__robot = robot
            self.__state = "idle"
            self.__config = config
            self.__args = args
            self.__buttonPin = 7

            self.__update_behaviors()

            status_manager.battery_level = self.__robot.battery
        except Exception as e:
            print(str(e))

    
    """
        Description: Function used for threading.Thread() class to run the brain functionality
        separate from the main thread of execution.

        The brain runs in a loop trying to manage all of the functions for the physical robot.
        It first reads from all of the main functions such as the battery, the motors, microphone,
        camera, lights, etc. Once it has checked all of those functions, the brain tries to check
        for changes in the robot behaviors and update them locally.

        If the robot is turned off externally or the battery is drained to 0%, the brain exits
        the loop and turns off all of the functions via an "off" command.

        Parameters:
        -----------
        None
    """
    def begin(self):
        GPIO.setwarnings(False)
        GPIO.setmode(GPIO.BOARD)
        GPIO.setup(self.__buttonPin, GPIO.IN, pull_up_down = GPIO.PUD_DOWN)

        if self.__args.verbose:
            print("Running brain.begin() while TRUE loop")

        self.__write_speaker(message_type="speaker", message=self.__robot.name + " is ready to party")

        if self.__args.verbose:
            print("Brain.Begin: Entering WHILE [Power On]")

        while self.__robot.power:            
            try:
                self.__report_status()
                self.__read_motor()
                self.__read_speaker()
                self.__read_sensors()
                self.__read_microphone()
                self.__read_camera()
                self.__read_uploader()
                self.__update_behaviors()
                self.__handle_behavior()
            except Exception as e:
                print(e)
                logger.write(str(datetime.datetime.now()) + " - Brain Error: " + str(e))
                break

            try:
                # Listen to interrupt from button
                buttonPressed = GPIO.input(self.__buttonPin)
                if buttonPressed:
                    if self.__buttonUp:
                        print("Went into button up")
                        self.__buttonUp = False
                        if self.__buttonSeen:
                            print("Went into first button seen")
                            #if self.__buttonCounter == 0:
                                #print("Went into button counter == 0")
                                #self.__write_motor(message_type="motor", message="F0-")
                            self.__buttonCounter += 1
                            print(self.__buttonCounter)
                        self.__buttonSeen = datetime.datetime.now() # Indent to NOT resets start time to delay timeout on buttonPress
                else:
                    print("Went into else")
                    self.__buttonUp = True

                time.sleep(self.__buttonDebounceTime)

                if  self.__buttonSeen:
                    print("Went into second button seen")
                    timeout = (abs(datetime.datetime.now() - self.__buttonSeen).seconds) >= self.__buttonWaitTime
                    if timeout:
                        print("Went into timeout")
                        #self.__button_handler(buttonCounter)
                        print("You pushed my buttons {} times.".format(self.__buttonCounter))
                        self.__buttonCounter = 0
                        self.__buttonSeen = None
            except Exception as e:
                print("Button Handler Error: " + str(e))


        if self.__args.verbose:
            print("Brain.Begin: Exiting WHILE [Power Off]")

        self.__write_sensor(message_type="off", message="Powered Off")
        self.__write_motor(message_type="off", message="turn off")
        self.__microphoneQueue.clear()
        self.__write_microphone(message_type="off", message="turn off")
        self.__write_camera(message_type="off", message="turn off")
        self.__write_speaker(message_type="speaker", message="Don't bother talk to me anymore. I'm not listening.")
        self.__write_speaker(message_type="off", message="Powered Off")
        self.__write_notifier(message_type="off", message="Powered Off")
        self.__write_uploader(message_type="off", message="Powered Off")
        logger.write(str(datetime.datetime.now()) + " - Brain: Powered Off")


    def __reset(self):
        self.__write_sensor(message_type="flasher", message="turn off")
        self.__write_speaker(message_type="automatic", message="neutral")
        self.__write_camera(message_type="automatic", message="0")
        self.__write_notifier(message_type="notification_off", message="Reset")

    """
        Description: This is the status manager function which checks the values for
        wireless connectivity and battery level. 

        Parameters:
        -----------
        None
    """
    def __report_status(self):
        try:
            success, wifi = status_manager.get_wifi_signal_strength()
            battery = status_manager.get_battery_level()

            if battery <= 0:
                self.__robot.power = False
                self.__robot.battery = battery
                self.__db.update_robot()
                return

            # success == 1 --> The battery and wifi values were retrieved successfully. 
            # success == 0 --> The battery and/or wifi values were not retrieved successfully.
            if success == 1:
                if not wifi == self.__robot.connection or not battery == self.__robot.battery:
                    self.__robot.connection = wifi
                    self.__robot.battery = battery
                    self.__db.update_robot()
            elif success == 0:
                if not battery == self.__robot.battery:
                    self.__robot.battery = battery
                    self.__db.update_robot()
            else:
                return
        except Exception as e:
            error_message = "Brain.__report_status() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)
        
    """
        Description: This function attempts to update the robot behaviors locally (if any
        changes have been made in the database)

        Parameters:
        -----------
        None
    """
    def __update_behaviors(self):
        try:
            time_stamp = str(datetime.datetime.now())

            # Change idle behavior if local reference is different from database reference
            if not self.__behaviorRef["idle"] == self.__robot.idle_behavior:
                self.__behaviorRef["idle"] = self.__robot.idle_behavior
                idle = self.__robot.idle_behavior.get().to_dict()
                self.__idle_behavior = []

                # Retrieve all of the action references for this behavior from the database
                for action in idle["actions"]:
                    actionDict = action["action"].get().to_dict()
                    val = action["value"]
                    self.__idle_behavior.append(actionDict["prefix"] + str(val))

                logger.write(time_stamp + " - Brain: Idle Behavior Updated")
                self.__updated = False
                self.__behaviorSet = False
            
            # Change detect behavior if local reference is different from database reference
            if not self.__behaviorRef["detect"] == self.__robot.detect_behavior:
                self.__behaviorRef["detect"] = self.__robot.detect_behavior
                detect = self.__robot.detect_behavior.get().to_dict()
                self.__detect_behavior = []
            
                # Retrieve all of the action references for this behavior from the database
                for action in detect["actions"]:
                    actionDict = action["action"].get().to_dict()
                    val = action["value"]
                    self.__detect_behavior.append(actionDict["prefix"] + str(val))
                
                logger.write(time_stamp + " - Brain: Detect Behavior Update")
                self.__updated = False
                self.__behaviorSet = False
        except Exception as e:
            error_message = "Brain.__update_behaviors() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)

    """
        Description: This is the function to check whether the user has asked for the
        speaker to say something

        The brain reads the robot phrase variable to check for any new content

        Parameters:
        -----------
        None
    """
    def __read_speaker(self):
        try:
            time_stamp = str(datetime.datetime.now())
            
            if not self.__robot.phrase is "" and not self.__lastMessage is self.__robot.phrase:
                self.__write_speaker(message_type="speaker", message=self.__robot.phrase)
                self.__lastMessage = self.__robot.phrase
                self.__robot.phrase = ""
                self.__db.update_robot_phrase()
        except Exception as e:
            error_message = "Brain.__read_speaker() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)

    """
        Description: This is the function to check whether the motors have finished their
        previous task and have sent a response back. 

        The brain reads the queue that is the data structure serving as the middle man
        between the motor and brain functionalities. It then unpacks the message and
        logs the result for further use.

        Parameters:
        -----------
        None
    """
    def __read_motor(self):
        try:
            time_stamp = str(datetime.datetime.now())

            # Check that queue is not empty
            if not self.__motorQueue.empty():
                # Read first item in the queue
                message_packet = json.loads(self.__motorQueue.peek())

                # Message incoming from motor
                if message_packet["type"] == "brain":
                    message_packet = json.loads(self.__motorQueue.get())
                    logger.write(time_stamp + " - Motor to Brain: Brain Message Received -- " + message_packet["message"])
                    self.__write_notifier(message_type="notification", message="Moved")
                else:
                    return
            else:
                return
        except Exception as e:
            error_message = "Brain.__read_motor() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)

    """
        Description: This is the function to check whether the microphone has sent
        a message to the brain regarding a threatening sound.

        The brain reads the queue that is the data structure serving as the middle man
        between the microphone and brain functionalities. It then unpacks the message and
        changes the behavior from idle state to detect state.

        Parameters:
        -----------
        None
    """
    def __read_microphone(self):
        try:
            time_stamp = str(datetime.datetime.now())

            # Check that queue is not empty
            if not self.__microphoneQueue.empty():
                # Read first item in the queue
                message_packet = json.loads(self.__microphoneQueue.peek())

                # Message incoming from microphone
                if message_packet["type"] == "brain":
                    message_packet = json.loads(self.__microphoneQueue.get())
                    logger.write(time_stamp + " - Microphone to Brain: Brain Message Received -- " + message_packet["message"])
                    self.__write_notifier(message_type="threat_detected", message="Threat Detected")
                    self.__write_speaker(message_type="speaker", message="Alert! Alert! Alert!")
                    self.__state = "detect"
                    self.__behaviorSet = False
                else:
                    return
            else:
                return
        except Exception as e:
            error_message = "Brain.__read_microphone() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)
    

    """
        Description: This is the function to check whether the uploader has uploaded
        new images to the cloud storage system.

        The brain reads the queue that is the data structure serving as the middle man
        between the uploader and brain functionalities. It then unpacks the message and
        updates the robot with the new images uploaded

        Parameters:
        -----------
        None
    """
    def __read_uploader(self):
        try:
            time_stamp = str(datetime.datetime.now())

            # Check that queue is not empty
            if not self.__uploaderQueue.empty():
                # Read first item in the queue
                message_packet = json.loads(self.__uploaderQueue.peek())

                # Message incoming from uploader
                if message_packet["type"] == "brain":
                    message_packet = json.loads(self.__uploaderQueue.get())
                    self.__db.update_videos()
                    self.__write_notifier(message_type="notification", message="Image Uploaded")
                    logger.write(time_stamp + " - Uploader to Brain: Brain Message Received -- " + message_packet["message"])
                else:
                    return
            else:
                return
        except Exception as e:
            error_message = "Brain.__read_uploader() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)


    """
        Description: This is the function to check whether the camera has sent
        a message to the brain regarding a capture event.

        The brain reads the queue that is the data structure serving as the middle man
        between the camera and brain functionalities. It then unpacks the message and
        logs the results for further use.

        Parameters:
        -----------
        None
    """
    def __read_camera(self):
        try:
            time_stamp = str(datetime.datetime.now())

            # Check that queue is not empty
            if not self.__cameraQueue.empty():
                # Read first item in the queue
                message_packet = json.loads(self.__cameraQueue.peek())

                # Message incoming from camera
                if message_packet["type"] == "brain":
                    message_packet = json.loads(self.__cameraQueue.get())
                    logger.write(time_stamp + " - Camera to Brain: Brain Message Received -- " + message_packet["message"])
                else:
                    return

            # Checks if externally the user wants to take a picture manually
            if self.__robot.manualPicture is True:
                self.__write_camera(message_type="manual", message="Take Picture Now")
                self.__robot.manualPicture = False
                self.__db.update_picture_sensor_status()
            
            # Check if there is a change to the camera position
            if not self.__cameraPosition == self.__robot.camera_angle:
                self.__cameraPosition = self.__robot.camera_angle
                self.__write_camera(message_type="position", message=str(self.__cameraPosition))
            else:
                return
        except Exception as e:
            error_message = "Brain.__read_camera() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)
    
    
    """
        Description: This is the function to check whether the array of sensors
        (smoke, humidity, temperature, lights, etc)

        The brain reads the queue that is the data structure serving as the middle man
        between the sensors and brain functionalities. It then unpacks the message and
        logs the results for further use.

        Parameters:
        -----------
        None
    """
    def __read_sensors(self):
        try:
            # Check that queue is not empty
            if not self.__sensorQueue.empty():
                # Read first item in the queue
                message_packet = json.loads(self.__sensorQueue.peek())

                # Message incoming from one of the sensors
                if message_packet["type"] == "brain":
                    message_packet = json.loads(self.__sensorQueue.get())
                    logger.write(str(datetime.datetime.now()) + " - Sensor to Brain: Brain Message Received -- " + message_packet["message"])
                else:
                    return

            # Checks the status of the robot lights and changes whether they should be ON or OFF
            if not self.__lightOn == self.__robot.light:
                self.__lightOn = self.__robot.light
                if self.__lightOn is True:
                    message = "turn on"
                    self.__write_speaker(message_type="speaker", message="I can finally see")
                elif self.__lightOn is False:
                    message = "turn off"
                    self.__write_speaker(message_type="speaker", message="Oh no I can't see anymore")
                else:
                    return
                    
                self.__write_sensor(message_type="light", message=message)
            else:
                return
        except Exception as e:
            error_message = "Brain.__read_sensors() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)


    """
        Description: This function maps a specific action of the current behavior 
        defined for the robot to a physical action.

        For example, if the action is to move the robot forward, the physical action
        is to tell the motor functionality to move forward.

        Parameters:
        -----------
        action: String
                    Description:
                        The action from the behavior defined for the robot which 
                        needs to be mapped into a physical action

    """
    def __action_map(self, action = None):
        try:
            mapper = self.__db.get_actions()

            for mapped_action in mapper:
                if action[0] == mapped_action["prefix"]:
                    self.__send_message(mapped_action["name"], action[1:])
                    break
            
            if not self.__updated:
                self.__updated = True
        except Exception as e:
            error_message = "Brain.__action_map() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)
    
    
    """
        Description: This function distributes the actions coming from action_map to
        the respective physical modules such as Motor, Microphone, Camera, etc.

        Each action is compared to an array of actions that correspond to a specific 
        module. From there, the value of that action is passed on to that specific
        module and everything else that happens thereafter is not the brain's 
        responsibility.

        Parameters:
        -----------
        action_name: String
                    Description:
                        The action which needs to be mapped to a physical module
        value: String
                    Description:
                        The value that is going to be passed on to the physical
                        module.

    """
    def __send_message(self, action_name = None, value = None):
        try:
            mapper = self.__config["functions"]

            if action_name in mapper["motor"]:
                if action_name == "Move Towards Sound":
                    self.__write_motor(message_type="motor", message="Y" + value + "-")
                elif action_name == "Move Left":
                    self.__write_motor(message_type="motor", message="L" + value + "-")
                elif action_name == "Move Right":
                    self.__write_motor(message_type="motor", message="R" + value + "-")
                else:
                    self.__write_motor(message_type="motor", message="F" + value + "-")
            elif action_name in mapper["camera"]:
                if action_name == "Take Picture" and not self.__updated:
                    self.__write_motor(message_type="automatic", message=str(value))
            elif action_name in mapper["speaker"]:
                if action_name == "Emotion":
                    emotion = self.__config["emotions"][int(value)]
                    self.__write_speaker(message_type="automatic", message=emotion)
            elif action_name in mapper["relay"]:
                if action_name == "Emergency Light":
                    self.__write_sensor(message_type="flasher", message="turn on")
                elif action_name == "Light":
                    self.__write_sensor(message_type="light", message="turn on")
            elif action_name in mapper["notification"]:
                self.__write_notifier(message_type="notification_on", message=value)
            else:
                pass
        except Exception as e:
            error_message = "Brain.__send_message() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)


    """
        Description: This function writes new instructions to the motor module.
        These can be:

        Off --> Tells the motor to turn off
        Microphone --> Tells the motor to perform a new action based on microphone input
        Motor --> Tells the motor to move in a specific direction

        Parameters:
        -----------
        message_type: String
                    Description:
                        The type of instruction that is going to be sent to the motor module
        message: String
                    Description:
                        The message that should be sent to the module which gives the motor
                        more steps as to how to execute its instruction

    """
    def __write_motor(self, message_type="motor", message="no message"):
        try:
            time_stamp = str(datetime.datetime.now())

            # Only writes to the motor if the message is an Off message, Microphone message, or if
            # the motor is waiting for its next instruction
            #if message_type == "off" or message_type == "microphone" or message == "S5-" or self.motorIsBusy:  
            self.__motorQueue.put(json.dumps({"type": message_type, "message": message}))
            logger.write(time_stamp + " - Brain to Motor: " + message)
        except Exception as e:
            error_message = "Brain.__write_motor() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)

    
    """
        Description: This function writes new instructions to the microphone module.
        These can be:

        Off --> Tells the microphone to turn off
        Microphone --> Tells the microphone to listen to voice commands

        Parameters:
        -----------
        message_type: String
                    Description:
                        The type of instruction that is going to be sent to the microphone module
        message: String
                    Description:
                        The message that should be sent to the module which gives the microphone
                        more steps as to how to execute its instruction

    """
    def __write_microphone(self, message_type="microphone", message="no message"):
        try:
            time_stamp = str(datetime.datetime.now())
            self.__microphoneQueue.put(json.dumps({"type": message_type, "message": message}))
            logger.write(time_stamp + " - Brain to Microphone: " + message)
        except Exception as e:
            error_message = "Brain.__write_microphone() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)
    
    """
        Description: This function writes new instructions to the camera module.
        These can be:

        Off --> Tells the camera to turn off
        Microphone --> Tells the microphone to listen to voice commands

        Parameters:
        -----------
        message_type: String
                    Description:
                        The type of instruction that is going to be sent to the microphone module
        message: String
                    Description:
                        The message that should be sent to the module which gives the microphone
                        more steps as to how to execute its instruction

    """
    def __write_camera(self, message_type="camera", message="no message"):
        try:
            time_stamp = str(datetime.datetime.now())

            self.__cameraQueue.put(json.dumps({"type": message_type, "message": message}))
            logger.write(time_stamp + " - Brain to Camera: " + message)
        except Exception as e:
            error_message = "Brain.__write_camera() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)


    """
        Description: This function writes new instructions to the speaker module.
        These can be:

        Off --> Tells the camera to turn off
        Speaker --> Tells the speaker module to say something via the speaker hardware

        Parameters:
        -----------
        message_type: String
                    Description:
                        The type of instruction that is going to be sent to the speaker module
        message: String
                    Description:
                        The message that should be sent to the module which gives the speaker
                        more steps as to how to execute its instruction

    """
    def __write_speaker(self, message_type="speaker", message="no message"):
        try:
            time_stamp = str(datetime.datetime.now())

            self.__speakerQueue.put(json.dumps({"type": message_type, "message": message}))
            logger.write(time_stamp + " - Brain to Speaker: " + message)
        except Exception as e:
            error_message = "Brain.__write_speaker() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)


    """
        Description: This function writes new instructions to the notification manager module.
        These can be:

        Off --> Tells the notification manager to turn off
        Notification --> Tells the notification manager module what message to send to the user
        Notification ON --> Tells the notification manager module to allow all alerts
        Notification OFF --> Tells the notification manager module to disallow alerts that are not
                             off messages

        Parameters:
        -----------
        message_type: String
                    Description:
                        The type of instruction that is going to be sent to the notification manager module
        message: String
                    Description:
                        The message that should be sent to the module which gives the notification manager
                        more steps as to how to execute its instruction

    """
    def __write_notifier(self, message_type="notification", message="no message"):
        try:
            time_stamp = str(datetime.datetime.now())

            self.__notifierQueue.put(json.dumps({"type": message_type, "message": message}))
            logger.write(time_stamp + " - Brain to Notification Manager: " + message)
        except Exception as e:
            error_message = "Brain.__write_notifier() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)
    
    """
        Description: This function writes new instructions to the uploader module.
        These can be:

        Off --> Tells the uploader to turn off

        Parameters:
        -----------
        message_type: String
                    Description:
                        The type of instruction that is going to be sent to the uploader module
        message: String
                    Description:
                        The message that should be sent to the module which gives the uploader
                        more steps as to how to execute its instruction

    """
    def __write_uploader(self, message_type="upload", message="no message"):
        try:
            time_stamp = str(datetime.datetime.now())

            self.__uploaderQueue.put(json.dumps({"type": message_type, "message": message}))
            logger.write(time_stamp + " - Brain to Uploader: " + message)
        except Exception as e:
            error_message = "Brain.__write_uploader() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)
    
    """
        Description: This function writes new instructions to the sensors. The modules can be
        the light module or any other sensor. These can be:

        Off --> Tells the sensor to turn off
        Light --> Tells the light module to change its status (ON or OFF)

        Parameters:
        -----------
        message_type: String
                    Description:
                        The type of instruction that is going to be sent to the light/sensor module
        message: String
                    Description:
                        The message that should be sent to the module which gives the light/sensors
                        more steps as to how to execute its instruction

    """
    def __write_sensor(self, message_type="light", message="no message"):
        try:
            time_stamp = str(datetime.datetime.now())

            if message_type == "off":
                for sensor in range(self.__numberOfSensors):
                    self.__sensorQueue.put(json.dumps({"type": message_type, "message": message}))
            else:
                self.__sensorQueue.put(json.dumps({"type": message_type, "message": message}))
            
            logger.write(time_stamp + " - Brain to Sensor: " + message)
            
        except Exception as e:
            error_message = "Brain.__write_sensor() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)
    
    """
        Description: This function takes the robot's current behavior and splits it into
        its individual actions which are then mapped into physical actions and passed
        on to the modules which those actions correspond to.

        Parameters:
        -----------
        None

    """
    def __handle_behavior(self):
        try:
            if self.__state == "idle" and not self.__behaviorSet:
                self.__reset()
                for action in self.__idle_behavior:
                    self.__action_map(action)
                self.__behaviorSet = True
            elif self.__state == "detect" and not self.__behaviorSet:
                self.__reset()
                for action in self.__detect_behavior:
                    self.__action_map(action)
                
                self.__behaviorSet = True
                detect = Thread(target=functools.partial(self.__detect_thread))
                detect.start()

        except Exception as e:
            error_message = "Brain.__handle_behavior() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())

            print(time_stamp + ": " + error_message)
            logger.write(time_stamp + ": " + error_message)
    

    """
        Description: This function is only used for limiting the time that the
        robot should stay in the 'detect' state. It'll stay in this state
        for a specific amount of time and the power is on.

        Parameters:
        -----------
        None

    """
    def __detect_thread(self):
        try:
            start = datetime.datetime.now()
            end = datetime.datetime.now()
            change = datetime.timedelta(minutes=self.__config["detect_interval"])

            while start + change > end and self.__robot.power is True:
                end = datetime.datetime.now()

            print("Behavior back to idle")
            self.__state = "idle"
            self.__behaviorSet = False
        except Exception as e:
            print("Brain.__detect_thread() Error : " + str(e))

    def __button_handler(self, num_of_presses=0):
        try:
            count = num_of_presses

            if count == 1:
                self.__write_speaker(message_type="speaker", message="Hey! Why are you hitting my head?")
            elif count == 2:
                self.__write_speaker(message_type="speaker", message="Fine! Fine! I will wake up now")
                self.__robot.light = True
                self.__lightOn = True
                self.__db.update_light()
                self.__write_sensor(message_type="light", message="turn on")
            elif count == 3:
                self.__write_speaker(message_type="speaker", message="Ow! My head hurts now.")
            else:
                return
        except Exception as e:
            print(str(e))
