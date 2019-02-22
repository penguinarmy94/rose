import json, datetime, time
from . import queues, logger


class Brain():
    __mQueue = None
    __miQueue = None
    __spkQueue = None
    __db = None
    __camQueue = None
    __idle_behavior = None
    __detect_behavior = None
    __idle = False
    __config = {}
    __motorBusy = False

    def __init__(self, database, robot, config):
        self.__mQueue = queues.brain_motor_queue
        self.__miQueue = queues.brain_microphone_queue
        self.__spkQueue = queues.brain_speaker_queue
        self.__camQueue = queues.brain_camera_queue
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
    
    def begin(self):
        #Run for as long as queues are active
        while self.__robot.power is True:
            try:
                #Read Motor queue for new updates
                self.read_motor()
                #Read Microphone queue for new updates
                #self.read_microphone()
                #read Camera queue for new updates
                #self.read_camera()
                #handle Behavior
                self.__update_behaviors()
                self.handle_behavior()
            except Exception as e:
                logger.write(str(datetime.datetime.now()) + " - Brain Error: " + str(e))
                break
        
        self.__spkQueue.clear()
        #self.__clear_speaker_queue()
        self.__write_motor(message_type="off", message="turn off")
        self.__write_microphone(message_type="off", message="turn off")
        self.__write_speaker(message_type="off", message="Powered Off")
        logger.write(str(datetime.datetime.now()) + " - Brain: Powered Off")
        #time.sleep(5)
        #logger.write("turn off")

    def __clear_speaker_queue(self):
        while not self.__spkQueue.empty():
            self.__spkQueue.get()

        self.__write_speaker(message_type="off", message="Powered Off")
        

    def __update_behaviors(self):

        if not self.__behaviorRef["idle"] == self.__robot.idle_behavior:
            self.__behaviorRef["idle"] = self.__robot.idle_behavior
            idle = self.__robot.idle_behavior.get().to_dict()
            self.__idle_behavior = []

            for action in idle["actions"]:
                actionDict = action["action"].get().to_dict()
                val = action["value"]
                self.__idle_behavior.append(actionDict["prefix"] + str(val))

            logger.write(str(datetime.datetime.now()) + " - Brain: Idle Behavior Updated")
        
        if not self.__behaviorRef["detect"] == self.__robot.detect_behavior:
            self.__behaviorRef["detect"] = self.__robot.detect_behavior
            detect = self.__robot.detect_behavior.get().to_dict()
            self.__detect_behavior = []
        
            for action in detect["actions"]:
                actionDict = action["action"].get().to_dict()
                val = action["value"]
                self.__detect_behavior.append(actionDict["prefix"] + str(val))
            
            logger.write(str(datetime.datetime.now()) + " - Brain: Detect Behavior Update")

    def read_motor(self):
        #Check that queue is not empty
        if not self.__mQueue.empty():
            #read first item in the queue
            message_packet = self.__mQueue.peek()
            message_packet = json.loads(message_packet)

            #Message incoming from motor
            if message_packet["type"] == "brain":
                message_packet = json.loads(self.__mQueue.get())
                logger.write(str(datetime.datetime.now()) + " - Motor to Brain: Brain Message Received -- " + message_packet["message"])
                self.__write_speaker(message_type="speaker", message="Hi sir. Would you like a lemonade?")
                self.__motorBusy = False
            else:
                return
        else:
            return

    
    def read_microphone(self):
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

    def read_camera(self):
        #Check that queue is not empty
        if not self.__miQueue.empty():
            #read first item in the queue
            message_packet = json.loads(self.__camQueue.peek())

            #Message incoming from camera
            if message_packet["type"] == "brain":
                message_packet = json.loads(self.__camQueue.get())
                logger.write(str(datetime.datetime.now()) + " - Camera to Brain: Brain Message Received -- " + message_packet["message"])
            else:
                return
        else:
            return

    def __action_map(self, action):
        mapper = self.__db.get_actions()

        for mapped_action in mapper:
            if action[0] == mapped_action["prefix"]:
                self.__send_message(mapped_action["name"], action[1:])
                break
    
    def __send_message(self, action_name, value):
        mapper = self.__config["functions"]

        if action_name in mapper["motor"]:

            if action_name == "Move Towards Sound":
                self.__write_motor(message_type="motor", message="Y" + value + "-")
            else:
                self.__write_motor(message_type="motor", message="F" + value + "-")
        else:
            return
        
    def __write_motor(self, message_type="motor", message="no message"):
        if message_type == "off" or message_type == "microphone" or self.__motorBusy is False:  
            self.__mQueue.put(json.dumps({"type": message_type, "message": message}))
            logger.write(str(datetime.datetime.now()) + " - Brain to Motor: " + message)
            self.__motorBusy = True
        else:
            return

    
    def __write_microphone(self, message_type="microphone", message="no message"):
        self.__miQueue.put(json.dumps({"type": message_type, "message": message}))
    
    def __write_speaker(self, message_type="speaker", message="no message"):
        self.__spkQueue.put(json.dumps({"type": message_type, "message": message}))
    
    def handle_behavior(self):
        if self.__state == "idle":
            for action in self.__idle_behavior:
                self.__action_map(action)
        elif self.__state == "detect":
            for action in self.__detect_behavior:
                self.__action_map(action)
        
    
