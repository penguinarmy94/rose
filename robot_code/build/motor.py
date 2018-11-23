import json
#import serial
import sys
from . import queues

class Motor():
    __direction = ""
    __port = None
    __bqueue = None

    def __init__(self, motorQueue):
        self.__direction = ""
        self.__bqueue = motorQueue
        #self.__port = serial.Serial("/dev/ttyACM0", 9600)
    
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

        try:        
            if direction[0] == "F":
                #success = self.__port.write(direction.encode())
                #print(success)
                return direction.encode()
            elif direction[0] == "B":
                #success = self.__port.write(direction.encode())
                #print(success)
                return direction.encode()
            elif direction[0] == "L":
                #success = self.__port.write(direction.encode())
                #print(success)
                return direction.encode()
            elif direction[0] == "R":
                #success = self.__port.write(direction.encode())
                #print(success)
                return direction.encode()
            else:
                #print("Command does not exist")
                return "Command Not Found"
        except Exception as e:
            print(str(e))
            return "Error"


