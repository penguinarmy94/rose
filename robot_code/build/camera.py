from . import logger
from threading import Thread
import json, datetime, time, pyttsx3, functools

class Camera():
    __pin = None
    __isOn = False
    __queue = None
    __player = None

    def __init__(self, queue = None, pin = None):
        if queue and pin:
            logger.write(str(datetime.datetime.now()) + " - Camera initialized")
            self.__pin = pin
            self.__queue = queue
            #self.__player = pyttsx3.init()
            #self.__player.setProperty("rate", 120)
        else:
            raise TypeError("Camera: Queue or pin number are not initialized")

    def run(self):
        gpio.setmode(gpio.BOARD)
        gpio.setup(self.__pin, gpio.OUT)

        while True:
            if not self.__queue.empty():
                result = self.read_queue()
                logger.write(str(datetime.datetime.now()) + " - Camera message: " + result )
                if result == 2:
                    print("something_camera")
                    break
                else:
                    print("good_camera")
                    continue
            else:
                continue
        
        logger.write(str(datetime.datetime.now()) + " - Camera: Powered off")
    
    def read_queue(self):
        message_packet = json.loads(self.__queue.get())

        if message_packet["type"] == "position":
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Camera: Camera Message Received -- " + message_packet["message"])
            self.say(message_packet["message"])
            return 1
        elif message_packet["type"] == "off":
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Camera: Off Message Received -- " + message_packet["message"])
            return 2
        else:
            return -1

    def say(self, message=""):
        self.__player.say(message)
        self.__player.runAndWait()

        logger.write(str(datetime.datetime.now()) + " - Camera: " + message)
