import json
import serial
import sys
from . import queues

class Motor():
    __direction = ""
    __port = None
    __bqueue = None
    __aqueue = None

    def __init__(self, brainQueue, arduinoQueue):
        self.__direction = ""
        self.__bqueue = brainQueue
        self.__aqueue = arduinoQueue
        self.__port = serial.Serial("/dev/ttyACM0", 9600)
    
    def run(self):
        while True:
            if not self.__bqueue.empty():
                message_packet = self.__bqueue.get()
                message_packet = json.loads(message_packet)

                if message_packet["type"] == "move":
                    log = self.move(message_packet["message"])
                    queues.log.put(log)
                elif message_packet["type"] == "off":
                    print("motor exit")
                    break
                else:
                    self.__bqueue.put(json.dumps(message_packet))
                __direction = message_packet["message"]
            if not self.__aqueue.empty():
                message = self.__aqueue.get()
                self.__bqueue.put(json.dumps({ "type": "motor", "message": message}))

    def move(self, direction):
        if direction == "N":
            success = self.__port.write(b"f")
            print("forward")
            return "Moved Forward"
        elif direction == "S":
            success = self.__port.write(b"b")
            print("backward")
            return "Moved Backward"
        elif direction == "E":
            success = self.__port.write(b"l")
            print("left")
            return "Moved Left"
        elif direction == "W":
            success = self.__port.write(b"r")
            print("right")
            return "Moved Right"
        else:
            print("Command does not exist")
            return "Command Not Found"
