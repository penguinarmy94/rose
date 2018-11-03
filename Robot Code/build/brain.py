import json
from . import queues

class Brain():
    __mQueue = None
    __behavior = None

    def __init__(self, mQueue, behavior):
        self.__mQueue = mQueue
        self.__behavior = behavior
    
    def begin(self):
        while queues.on == True:
            self.read()
    
    def read(self):
        if not self.__mQueue.empty():
            message_packet = self.__mQueue.get()
            message_packet = json.loads(message_packet)
            if message_packet["type"] == "motor":
                print(message_packet["message"])
            elif message_packet["type"] == "microphone":
                self.writeMotor(message_packet["message"])
            elif message_packet["type"] == "destruct":
                self.__mQueue.put(json.dumps({"type": "off", "message": message_packet["message"]}))
                queues.on = False
                print("brain exit")
            else:
                self.__mQueue.put(json.dumps(message_packet))
    
    def writeMotor(self, message):  
        self.__mQueue.put(json.dumps({"type": "move", "message": message}))
