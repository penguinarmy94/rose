#from . import logger
import json, datetime, pyttsx3

class Speaker():
    __spQueue = None
    __player = None

    def __init__(self, queue):
        self.__spQueue = queue
        self.__player = pyttsx3.init()

        voices = self.__player.getProperty('voices')
        voices.append(pyttsx3.voice.Voice(age=30, gender="female", id="voice1", name="Lila"))
        self.__player.setProperty('voices', voices)
        self.__player.setProperty('voice', "voice1")

    def run(self):
        while True:
            print("read")
            print("write")
    
    def read_queue(self):
        message_packet = json.loads(self.__spQueue.peek())

        if message_packet["type"] == "speaker":
            message_packet = json.loads(self.__spQueue.get())
            #logger.write(str(datetime.datetime.now()) + " - Brain to Speaker: Speaker Message Received -- " + message_packet["message"])
            self.say(message_packet["message"])
            return 1
        else:
            return -1

    def say(self, message):
        self.__player.say(message)
        self.__player.runAndWait()
        print("Message finished")
        #logger.write(str(datetime.datetime.now()) + " - Speaker: " + message)
    
   
speaker = Speaker("")
speaker.say("This is me and my robotic voice")
