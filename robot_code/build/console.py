from . import logger
from threading import Thread, Timer
import json, datetime, time, pyttsx3, functools, subprocess, random, signal

class Console():
    __coQueue = None

    def __init__(self, queue = None, config = None):
        self.__coQueue = queue
        self.__config = config

    def run(self):
        while True:
            if not self.__coQueue.empty():
                result = self.read_queue()
                if result == 2:
                    print("something console")
                    break
                else:
                    print("good console")
                    continue
            else:
                print("continue")
                continue

        logger.write(str(datetime.datetime.now()) + " - Console: Powered off")
        print("powered off")
    
    def read_queue(self):
        message_packet = json.loads(self.__coQueue.peek())

        if message_packet["type"] == "speaker":
            message_packet = json.loads(self.__coQueue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Console: Console Message Received -- " + message_packet["message"])
            self.say(message_packet["message"])
            return 1
        elif message_packet["type"] == "automatic":
            message_packet = json.loads(self.__coQueue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Console: Console Message Received -- " + message_packet["message"])
            self.__mood = message_packet["message"]

        elif message_packet["type"] == "off":
            message_packet = json.loads(self.__coQueue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Console: Off Message Received -- " + message_packet["message"])
            return 2
        else:
            return -1


