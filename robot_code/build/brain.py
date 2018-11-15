import json
from . import queues

class Brain():
    __mQueue = None
    __miQueue = None
    __dbQueue = None
    __camQueue = None
    __behavior = None
    __idle = False

    def __init__(self, mQueue, miQueue, dbQueue, camQueue, behavior):
        self.__mQueue = mQueue
        self.__miQueue = miQueue
        self.__dbQueue = dbQueue
        self.__camQueue = camQueue
        self.__behavior = behavior
    
    def begin(self):
        #Run for as long as queues are active
        while queues.on == True:
            #Read Motor queue for new updates
            self.readMotor()
            #Read Microphone queue for new updates
            self.readMicrophone()
            #Read Database queue for new updates
            self.readDatabase()
            #read Camera queue for new updates
            self.readCamera()

    
    def readMotor(self):
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
                if not self.__idle:
                    self.handleBehavior("idle")

    
    def readMicrophone(self):
        #Check that queue is not empty
        if not self.__miQueue.empty():
            #read first item in the queue
            message_packet = json.loads(self.__miQueue.peek())

            #Message incoming from microphone
            if message_packet["type"] == "brain":
                message_packet = json.loads(self.__miQueue.get())
                #check Behavior
                #parse Behavior items
                #send to different areas
                self.handleBehavior(message_packet["message"])

    def readDatabase(self):
        #Check that queue is not empty
        if not self.__dbQueue.empty():
            #read first item in the queue
            message_packet = json.loads(self.__dbQueue.peek())

            #Message incoming from database
            if message_packet["type"] == "power":
                message_packet = json.loads(self.__dbQueue.get())
                #change power setting
            elif message_packet["type"] == "idle_behavior":
                message_packet = json.loads(self.__dbQueue.get())
                #change idle behavior setting
            elif message_packet["type"] == "detect_behavior":
                message_packet = json.loads(self.__dbQueue.get())
                #change detect behavior setting
    
    def readCamera(self):
        #Check that queue is not empty
        if not self.__camQueue.empty():
            #read first item in the queue
            message_packet = json.loads(self.__camQueue.peek())

            #Message incoming from camera

    
    def writeMotor(self, message):  
        self.__mQueue.put(json.dumps({"type": "move", "message": message}))
    
    def handleBehavior(self, handle):

        if handle == "idle":
            #parse
        elif handle == "detect":
            #parse
        else:
            self.writeMotor(handle)
    
