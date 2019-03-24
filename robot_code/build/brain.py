import json, datetime, time
from . import queues, logger, status_manager as sm


class Brain():
    __mQueue = None
    __nmQueue = None
    __miQueue = None
    __spkQueue = None
    __robot = None
    __db = None
    __camQueue = None
    __idle_behavior = None
    __detect_behavior = None
    __idle = False
    __config = {}
    __motorBusy = False
    __lightOn = False
    __camPosition = 7
    __numofsensors = 1
    __updated = False

    def __init__(self, database, robot, config):
        self.__mQueue = queues.brain_motor_queue
        self.__nmQueue = queues.brain_notifier_queue
        self.__miQueue = queues.brain_microphone_queue
        self.__spkQueue = queues.brain_speaker_queue
        self.__camQueue = queues.brain_camera_queue
        self.__sensorQueue = queues.brain_sensor_queue
        self.__behaviorRef = {"idle": "", "detect": ""}
        self.__idle_behavior = []
        self.__detect_behavior = []
        self.__db = database
        self.__robot = robot
        self.__state = "idle"
        self.__config = config

        self.__update_behaviors()

        self.__behaviorRef["idle"] = robot.idle_behavior
        self.__behaviorRef["detect"] = robot.detect_behavior

        sm.battery_level = self.__robot.battery
    
    def begin(self):
        #Run for as long as queues are active
        self.__write_motor(message_type="calibrate", message="C5-")
        self.__write_speaker(message_type="speaker", message="Powered on! I am ready to serve you master.")
        while self.__robot.power is True:
            try:
                #Read Motor queue for new updates
                self.report_status()
                self.read_motor()
                self.read_sensors()
                #Read Microphone queue for new updates
                #self.read_microphone()
                #read Camera queue for new updates
                self.read_camera()
                #handle Behavior
                self.__update_behaviors()
                self.handle_behavior()
            except Exception as e:
                logger.write(str(datetime.datetime.now()) + " - Brain Error: " + str(e))
                break
        
        self.__write_sensor(message_type="off", message="Powered Off")
        self.__write_motor(message_type="off", message="turn off")
        self.__write_microphone(message_type="off", message="turn off")
        self.__write_camera(message_type="off", message="turn off")
        self.__write_speaker(message_type="speaker", message="Damn. You. Humans.")
        self.__write_speaker(message_type="off", message="Powered Off")
        self.__write_notifier(message_type="off", message="Powered Off")
        logger.write(str(datetime.datetime.now()) + " - Brain: Powered Off")

    def report_status(self):
        try:
            success, wifi = sm.get_wifi_signal_strength()
            battery = sm.get_battery_level()

            if battery == 0:
                self.__robot.power = False
                self.__robot.battery = battery
                self.__db.update_robot()
                return

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
            error_message = "Brain.report_status() Error: " + str(e)
            print(error_message)
            logger.write(error_message)


        

    def __update_behaviors(self):
        try:
            current_time = str(datetime.datetime.now())

            if not self.__behaviorRef["idle"] == self.__robot.idle_behavior:
                self.__behaviorRef["idle"] = self.__robot.idle_behavior
                idle = self.__robot.idle_behavior.get().to_dict()
                self.__idle_behavior = []

                for action in idle["actions"]:
                    actionDict = action["action"].get().to_dict()
                    val = action["value"]
                    self.__idle_behavior.append(actionDict["prefix"] + str(val))

                logger.write(current_time + " - Brain: Idle Behavior Updated")
                self.__updated = False
            
            if not self.__behaviorRef["detect"] == self.__robot.detect_behavior:
                self.__behaviorRef["detect"] = self.__robot.detect_behavior
                detect = self.__robot.detect_behavior.get().to_dict()
                self.__detect_behavior = []
            
                for action in detect["actions"]:
                    actionDict = action["action"].get().to_dict()
                    val = action["value"]
                    self.__detect_behavior.append(actionDict["prefix"] + str(val))
                
                logger.write(current_time + " - Brain: Detect Behavior Update")
                self.__updated = False
        except Exception as e:
            error_message = "Brain.__update_behaviors() Error: " + str(e)
            print(error_message)
            logger.write(error_message)


    def read_motor(self):
        try:
            #Check that queue is not empty
            if not self.__mQueue.empty():
                #read first item in the queue
                message_packet = self.__mQueue.peek()
                message_packet = json.loads(message_packet)

                #Message incoming from motor
                if message_packet["type"] == "brain":
                    message_packet = json.loads(self.__mQueue.get())
                    logger.write(str(datetime.datetime.now()) + " - Motor to Brain: Brain Message Received -- " + message_packet["message"])
                    self.__motorBusy = False
                else:
                    return
            else:
                return
        except Exception as e:
            error_message = "Brain.read_motor() Error: " + str(e)
            print(error_message)
            logger.write(error_message)

    
    def read_microphone(self):
        try:
            #Check that queue is not empty
            if not self.__miQueue.empty():
                #read first item in the queue
                message_packet = json.loads(self.__miQueue.peek())

                #Message incoming from microphone
                if message_packet["type"] == "brain":
                    message_packet = json.loads(self.__miQueue.get())
                    logger.write(str(datetime.datetime.now()) + " - Microphone to Brain: Brain Message Received -- " + message_packet["message"])
                else:
                    return
            else:
                return
        except Exception as e:
            error_message = "Brain.read_microphone() Error: " + str(e)
            print(error_message)
            logger.write(error_message)

    def read_camera(self):
        try:
            #Check that queue is not empty
            if not self.__camQueue.empty():
                #read first item in the queue
                message_packet = json.loads(self.__camQueue.peek())

                #Message incoming from camera
                if message_packet["type"] == "brain":
                    message_packet = json.loads(self.__camQueue.get())
                    logger.write(str(datetime.datetime.now()) + " - Camera to Brain: Brain Message Received -- " + message_packet["message"])
                else:
                    return
            if self.__robot.manualPicture is True:
                self.__write_camera(message_type="manual", message="Take Picture Now")
                self.__db.update_picture_sensor_status()
            if not self.__camPosition == self.__robot.camera_angle:
                self.__camPosition = self.__robot.camera_angle
                self.__write_camera(message_type="position", message=str(self.__camPosition))
            else:
                return
        except Exception as e:
            error_message = "Brain.read_camera() Error: " + str(e)
            print(error_message)
            logger.write(error_message)
    
    def read_sensors(self):
        try:
            #Check that queue is not empty
            if not self.__sensorQueue.empty():
                #read first item in the queue
                message_packet = json.loads(self.__sensorQueue.peek())

                #Message incoming from camera
                if message_packet["type"] == "brain":
                    message_packet = json.loads(self.__sensorQueue.get())
                    logger.write(str(datetime.datetime.now()) + " - Camera to Brain: Brain Message Received -- " + message_packet["message"])
                else:
                    return
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
            error_message = "Brain.read_sensors() Error: " + str(e)
            print(error_message)
            logger.write(error_message)

    def __action_map(self, action):
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
            print(error_message)
            logger.write(error_message)
    
    def __send_message(self, action_name, value):
        try:
            mapper = self.__config["functions"]

            if action_name in mapper["motor"]:

                if action_name == "Move Towards Sound":
                    self.__write_motor(message_type="motor", message="L" + value + "-")
                else:
                    self.__write_motor(message_type="motor", message="F" + value + "-")
            elif action_name in mapper["camera"]:
                if action_name == "Record" and not self.__updated:
                    self.__write_motor(message_type="automatic", message=str(value))
            else:
                return
        except Exception as e:
            error_message = "Brain.__send_message() Error: " + str(e)
            print(error_message)
            logger.write(error_message)
        
    def __write_motor(self, message_type="motor", message="no message"):
        try:
            if message_type == "off" or message_type == "microphone" or self.__motorBusy is False:  
                self.__mQueue.put(json.dumps({"type": message_type, "message": message}))
                logger.write(str(datetime.datetime.now()) + " - Brain to Motor: " + message)
                self.__motorBusy = True
            else:
                return
        except Exception as e:
            error_message = "Brain.__write_motor() Error: " + str(e)
            print(error_message)
            logger.write(error_message)

    
    def __write_microphone(self, message_type="microphone", message="no message"):
        try:
            self.__miQueue.put(json.dumps({"type": message_type, "message": message}))
        except Exception as e:
            error_message = "Brain.__write_microphone() Error: " + str(e)
            print(error_message)
            logger.write(error_message)
    
    def __write_camera(self, message_type="camera", message="no message"):
        try:
            self.__camQueue.put(json.dumps({"type": message_type, "message": message}))
            logger.write(str(datetime.datetime.now()) + " - Brain to Camera: " + message)
        except Exception as e:
            error_message = "Brain.__write_camera() Error: " + str(e)
            print(error_message)
            logger.write(error_message)
    
    def __write_speaker(self, message_type="speaker", message="no message"):
        try:
            self.__spkQueue.put(json.dumps({"type": message_type, "message": message}))
            logger.write(str(datetime.datetime.now()) + " - Brain to Speaker: " + message)
        except Exception as e:
            error_message = "Brain.__write_speaker() Error: " + str(e)
            print(error_message)
            logger.write(error_message)
    
    def __write_notifier(self, message_type="notification", message="no message"):
        try:
            self.__nmQueue.put(json.dumps({"type": message_type, "message": message}))
        except Exception as e:
            error_message = "Brain.__write_notifier() Error: " + str(e)
            print(error_message)
            logger.write(error_message)
    
    def __write_sensor(self, message_type="light", message="no message"):
        try:
            if message_type == "off":
                for sensor in range(self.__numofsensors):
                    self.__sensorQueue.put(json.dumps({"type": message_type, "message": message}))
            else:
                self.__sensorQueue.put(json.dumps({"type": message_type, "message": message}))
        except Exception as e:
            error_message = "Brain.__write_sensor() Error: " + str(e)
            print(error_message)
            logger.write(error_message)
    
    def handle_behavior(self):
        try:
            if self.__state == "idle":
                for action in self.__idle_behavior:
                    self.__action_map(action)
            elif self.__state == "detect":
                for action in self.__detect_behavior:
                    self.__action_map(action)
        except Exception as e:
            error_message = "Brain.handle_behaviors() Error: " + str(e)
            print(error_message)
            logger.write(error_message)
            
    
