import json, sys, datetime
from serial import Serial
from . import queues
from . import logger

class Motor():
    __direction = ""
    __port = None
    __bqueue = None
    __timer = None
    __isWaiting = False
    __rate = None
    __timeout = None
    __bytesToRead = None
    __code = "-"

    def __init__(self, motorQueue):
        self.__direction = ""
        self.__bqueue = motorQueue
        self.__port = "/dev/ttyACM0"
        self.__rate = 9600
        self.__timeout = 5
        self.__bytesToRead = 10
       # self.__receive_port = serial.Serial("/dev/serial1", 9600)
    
    def run(self):
        self.__receive_port = Serial(self.__port, self.__rate, timeout=self.__timeout)
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
                    self.move(self.__code)
        
        logger.write(str(datetime.datetime.now()) + " - Motor: Powered Off")
                
    def move(self, direction):
        directions = ["F", "B", "L", "R", "Y", "C"]

        try:
            if direction[0] in directions:
                success = self.__write_serial(direction)
                self.__isWaiting = True
                return success
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
                message_packet = json.loads(self.__bqueue.get())
                self.__code = message_packet["message"]
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
        return self.__read_serial()

    def __write_serial(self, message):
        try:
            output = self.__receive_port.write(message.encode())
            return output
        except Exception as e:
            print(str(e))
    
    def __read_serial(self):
        try:
            start = datetime.datetime.now()
            end = start
            message = ""
            
            """
            while end.second < start.second + self.__timeout:
                message += self.__receive_port.read().decode()
                print(message)
                end = datetime.datetime.now()
            """

            message = self.__receive_port.readline().decode()
            print(message)
                
            if message == "":
                message = None
                 
            return message
        except Exception as e:
            print(str(e))
            return None

    def write_brain(self, message):
        logger.write(str(datetime.datetime.now()) + " - Motor to Brain: " + message)
        self.__bqueue.put(json.dumps({"type": "brain", "message": message}))


