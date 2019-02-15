import json
from . import queues


class Brain():
    __mQueue = None
    __miQueue = None
    __db = None
    __camQueue = None
    __idle_behavior = None
    __detect_behavior = None
    __idle = False
    __config = {}

    def __init__(self, database, robot, config):
        self.__mQueue = queues.brain_motor_queue
        self.__miQueue = queues.brain_microphone_queue
        self.__camQueue = queues.brain_camera_queue
        self.__idle_behavior = []
        self.__detect_behavior = []
        self.__db = database
        self.__robot = robot
        self.__state = "idle"
        self.__config = config
        
        idle = robot.idle_behavior.get().to_dict()
        detect = robot.detect_behavior.get().to_dict()

        for action in idle["actions"]:
            actionDict = action["action"].get().to_dict()
            val = action["value"]
            self.__idle_behavior.append(actionDict["prefix"] + str(val))
        
        for action in detect["actions"]:
            actionDict = action["action"].get().to_dict()
            val = action["value"]
            self.__detect_behavior.append(actionDict["prefix"] + str(val))
    
    def begin(self):
        #Run for as long as queues are active
        while self.__robot.power is True:
            #Read Motor queue for new updates
            self.read_motor()
            #Read Microphone queue for new updates
            self.read_microphone()
            #read Camera queue for new updates
            self.read_camera()
            #handle Behavior
            self.handle_behavior()
        
        self.__turn_off()
        self.__db.close()
        print("Powered Off")

    
    def read_motor(self):
        #Check that queue is not empty
        if not self.__mQueue.empty():
            #read first item in the queue
            message_packet = self.__mQueue.peek()
            message_packet = json.loads(message_packet)

            #Message incoming from motor
            if message_packet["type"] == "brain":
                message_packet = json.loads(self.__mQueue.get())
                print(message_packet["message"])
            else:
                print("Message not intended for Brain")
        else:
            print("No message from motor")

    
    def read_microphone(self):
        #Check that queue is not empty
        if not self.__miQueue.empty():
            #read first item in the queue
            message_packet = json.loads(self.__miQueue.peek())

            #Message incoming from microphone
            if message_packet["type"] == "brain":
                message_packet = json.loads(self.__miQueue.get())
                print(message_packet["message"])
            else:
                print("Message not intended for Brain")
        else:
            print("No message from microphone")

    def read_camera(self):
        #Check that queue is not empty
        if not self.__miQueue.empty():
            #read first item in the queue
            message_packet = json.loads(self.__camQueue.peek())

            #Message incoming from camera
            if message_packet["type"] == "brain":
                message_packet = json.loads(self.__camQueue.get())
                print(message_packet["message"])
            else:
                print("No message from camera")

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
                self.__write_motor("Y" + value + "-")
            else:
                self.__write_motor("F" + value + "-")
        else:
            print("Write to logs")
    
    def __turn_off(self):
        self.__mQueue.put(json.dumps({"type": "off", "message": "power off"}))
        self.__miQueue.put(json.dumps({"type": "off", "message": "power off"}))
        self.__camQueue.put(json.dumps({"type": "off", "message": "power off"}))
        
    def __write_motor(self, message):  
        self.__mQueue.put(json.dumps({"type": "motor", "message": message}))
    
    def __write_microphone(self, message):
        self.__miQueue.put(json.dumps({"type": "microphone", "message": message}))
    
    def handle_behavior(self):
        if self.__state == "idle":
            for action in self.__idle_behavior:
                self.__action_map(action)
        elif self.__state == "detect":
            for action in self.__detect_behavior:
                self.__action_map(action)
        
    
