from . import logger
from threading import Thread
import json, datetime, time, pyttsx3, functools

class Camera():
    __caQueue = None
    __player = None

    def __init__(self, queue):
        self.__caQueue = queue
        self.__player = pyttsx3.init()
        #self.__player.setProperty("rate", 120)

    def run(self):
        while True:
            if not self.__caQueue.empty():
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
        message_packet = json.loads(self.__caQueue.get())

        if message_packet["type"] == "camera":
            message_packet = json.loads(self.__caQueue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Camera: Camer Message Received -- " + message_packet["message"])
            self.say(message_packet["message"])
            return 1
        elif message_packet["type"] == "off":
            message_packet = json.loads(self.__caQueue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Camera: Off Message Received -- " + message_packet["message"])
            return 2
        else:
            return -1

    def say(self, message=""):
        self.__player.say(message)
        self.__player.runAndWait()

        logger.write(str(datetime.datetime.now()) + " - Camera: " + message)
