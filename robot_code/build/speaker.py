from . import logger
from threading import Thread, Timer
import json, datetime, time, pyttsx3, functools, subprocess, signal
import os, sys

class Speaker():
    __spQueue = None
    __player = None
    __mood = "neutral"
    __config = None
    __isInMoodState = False
    __conversation_delay = 5
    __timeout = 60

    def __init__(self, queue = None, config = None):
        self.__spQueue = queue
        self.__config = config
        # Bypass annoying jack server error. Drive bug.
        stderr = sys.stderr
        sys.stderr = open(os.devnull, 'w')
        self.__player = pyttsx3.init()
        #sys.stderr = stderr
        self.__player.setProperty("rate", 100)

    def run(self):
        while True:
            if not self.__spQueue.empty():
                result = self.read_queue()
                if result == 2:
                    break
                else:
                    continue
            else:
                if not self.__isInMoodState:
                    timer = Timer(self.__timeout, self.__setMood)
                    timer.start()
                    self.__isInMoodState = True

        
        logger.write(str(datetime.datetime.now()) + " - Speaker: Powered off")
        print("powered off")
    
    def read_queue(self):
        message_packet = json.loads(self.__spQueue.peek())

        if message_packet["type"] == "speaker":
            message_packet = json.loads(self.__spQueue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Speaker: Speaker Message Received -- " + message_packet["message"])
            self.say(message_packet["message"])
            return 1
        elif message_packet["type"] == "speak-time":
            message_packet = json.loads(self.__spQueue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Speaker: Speaker Message Received -- " + message_packet["message"])
            self.__timeout = int(message_packet["message"])
            return 1
        elif message_packet["type"] == "automatic":
            message_packet = json.loads(self.__spQueue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Speaker: Speaker Message Received -- " + message_packet["message"])
            self.__mood = message_packet["message"]

        elif message_packet["type"] == "off":
            message_packet = json.loads(self.__spQueue.get())
            self.__isInMoodState = False
            logger.write(str(datetime.datetime.now()) + " - Brain to Speaker: Off Message Received -- " + message_packet["message"])
            return 2
        else:
            return -1

    def say(self, message=""):
        messages = message.split(";")
        try:
            if len(messages) > 1:
                for mesg in messages:
                    if mesg.endswith(".wav") or mesg.endswith(".mp3"):
                        output = subprocess.check_output("aplay " + self.__config["home_path"] + "/audio/" + mesg, shell=True)
                    else:
                        self.__player.say(mesg)
                        self.__player.runAndWait()
                    
                    time.sleep(self.__conversation_delay)
                    logger.write(str(datetime.datetime.now()) + " - Speaker: " + message)
            else:
                if message.endswith(".wav") or message.endswith(".mp3"):
                    output = subprocess.check_output("aplay " + self.__config["home_path"] + "/audio/" + message, shell=True)
                else:
                    self.__player.say(message)
                    self.__player.runAndWait()
            
            logger.write(str(datetime.datetime.now()) + " - Speaker: " + message)
        except Exception as e:
            print("Say message Error: " + str(e))
    
    def __setMood(self):
        print("Setting Mood")
        try:
            if self.__mood in self.__config["moods"] and self.__isInMoodState:
                date = datetime.datetime.now()
                index = (date.hour + date.minute + date.second)%len(self.__config["moods"][self.__mood])
                choice = self.__config["moods"][self.__mood][index]
                self.say(choice)
        except Exception as e:
            print(str(e))
        
        self.__isInMoodState = False
