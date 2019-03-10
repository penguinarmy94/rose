import json, sys, datetime
import serial
from . import queues
#from . import serial
from . import logger

class Motor():
    __direction = ""
    __port = None
    __bqueue = None
    __timer = None
    __isWaiting = False

    def __init__(self, motorQueue):
        self.__direction = ""
        self.__bqueue = motorQueue
        self.__port = serial.Serial("/dev/serial1", 9600, timeout=1)
       # self.__receive_port = serial.Serial("/dev/serial1", 9600)
    
    def run(self):
        while True:
            if self.__isWaiting is True:
                responseReceived = self.__get_motor_response()

                if not responseReceived is None:
                    self.__isWaiting = False
                    self.write_brain(responseReceived)
                elif not self.__bqueue.empty():
                    if self.__check_queue() == 2:
                        break
                    else:
                        continue
                else:
                    continue

            else:
                if not self.__bqueue.empty():
                    if self.__check_queue() == 2:
                        break
                    else:
                        continue
                else:
                    continue
        
        logger.write(str(datetime.datetime.now()) + " - Motor: Powered Off")
                

    def move(self, direction):
        directions = ["F", "B", "L", "R", "Y", "C"]

        try:
            if direction[0] in directions:
                success = self.__port.write(direction.encode())
                self.__isWaiting = True
                return direction.encode()        
            else:
                return "Command Not Found"
        except Exception as e:
            logger.write(str(datetime.datetime.now()) + " - Motor Error: " + str(e))
            return "Error"
    
    def __check_queue(self):
        message_packet = json.loads(self.__bqueue.peek())

        if self.__isWaiting is False:
            if message_packet["type"] == "motor":
                logger.write(str(datetime.datetime.now()) + " - Brain to Motor: Motor Message Received -- " + message_packet["message"])
                self.__port.writePython("F12;B45;F35".encode())
                message_packet = json.loads(self.__bqueue.get())
                self.move(message_packet["message"])
                return 1
        
        if message_packet["type"] == "microphone":
            message_packet = json.loads(self.__bqueue.get())
            self.move(message_packet["message"])
            logger.write(str(datetime.datetime.now()) + " - Brain to Motor: Microphone Message Received -- " + message_packet["message"])
            return 1
        if message_packet["type"] == "calibrate":
            message_packet = json.loads(self.__bqueue.get())
            self.move(message_packet["message"])
            logger.write(str(datetime.datetime.now()) + " - Brain to Motor: Calibration Message Received -- " + message_packet["message"])
            return 1
        elif message_packet["type"] == "off":
            message_packet = json.loads(self.__bqueue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Motor: Off Message Received -- " + message_packet["message"])
            return 2
        else:
            return -1
    
    def __get_motor_response(self):
        #if self.__port.in_waiting > 0:
        #    message = ""

        #    while self.__port.in_waiting > 0:
        #        message += self.__port.read(1).decode()
            
        #    return message
        #else:
        #    return None
        message = None

        message = self.__port.read(10).decode()

        return message

    def write_brain(self, message):
        logger.write(str(datetime.datetime.now()) + " - Motor to Brain: " + message)
        self.__bqueue.put(json.dumps({"type": "brain", "message": message}))


