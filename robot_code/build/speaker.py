from . import logger
from threading import Thread
import json, datetime, time, pyttsx3, functools

class Speaker():
    __spQueue = None
    __player = None

    def __init__(self, queue):
        self.__spQueue = queue
        self.__player = pyttsx3.init()
        #self.__player.setProperty("rate", 120)

    def run(self):
        while True:
            if not self.__spQueue.empty():
                result = self.read_queue()
                if result == 2:
                    print("something")
                    break
                else:
                    print("good")
                    continue
            else:
                continue
        
        logger.write(str(datetime.datetime.now()) + " - Speaker: Powered off")
    
    def read_queue(self):
        message_packet = json.loads(self.__spQueue.get())

        if message_packet["type"] == "speaker":
            message_packet = json.loads(self.__spQueue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Speaker: Speaker Message Received -- " + message_packet["message"])
            self.say(message_packet["message"])
            return 1
        elif message_packet["type"] == "off":
            message_packet = json.loads(self.__spQueue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Speaker: Off Message Received -- " + message_packet["message"])
            return 2
        else:
            return -1

    def say(self, message=""):
        self.__player.say(message)
        self.__player.runAndWait()

        logger.write(str(datetime.datetime.now()) + " - Speaker: " + message)