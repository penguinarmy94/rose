from . import logger
from threading import Thread
import json, datetime, time, pyttsx3, functools

class Camera():
    __pin = None
    __isOn = False
    __caQueue = None
    __player = None

    def __init__(self, queue = None, pin = None):
        if queue and pin:
            self.__pin = pin
            self.__queue = queue
            self.__player = pyttsx3.init()
            #self.__player.setProperty("rate", 120)
        else:
            raise TypeError("Camera: Queue or pin number are not initialized")

    def run(self):
        gpio.setmode(gpio.BOARD)
        gpio.setup(self.__pin, gpio.OUT)

        while True:
            if not self.__queue.empty():
                result = self.read_queue()
                if result == 2:
                    print("something")
                    break
                else:
                    print("good")
                    continue
            else:
                continue
        
        logger.write(str(datetime.datetime.now()) + " - Camera: Powered off")
    
    def read_queue(self):
        message_packet = json.loads(self.__queue.get())

        if message_packet["type"] == "camera":
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Camera: Camer Message Received -- " + message_packet["message"])
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
