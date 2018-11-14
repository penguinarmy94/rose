import json
import serial
import sys
from . import queues

class Motor():
    __direction = ""
    __port = None
    __bqueue = None

    def __init__(self, motorQueue):
        self.__direction = ""
        self.__bqueue = motorQueue
        self.__port = serial.Serial("/dev/ttyACM0", 9600)
    
    def run(self):
        while True:
            if not self.__bqueue.empty():
                message_packet = json.loads(self.__bqueue.peek())

                if message_packet["type"] == "motor":
                    message_packet = json.loads(self.__bqueue.get())
                    log = self.move(message_packet["message"])
                    queues.log.put(log)
                elif message_packet["type"] == "off":
                    message_packet = json.loads(self.__bqueue.get())
                    queues.log.put("Motor Off")
                    break
                else:
                    queues.log.put("Motor: No message from Brain")

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
