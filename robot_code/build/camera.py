from . import logger
from threading import Thread
import json, datetime, time, pyttsx3, functools, RPi.GPIO as gpio

class Camera():
    __isOn = False
    __queue = None
    __servo = None

    def __init__(self, queue = None, pin = None):
        if queue and pin:
            logger.write(str(datetime.datetime.now()) + " - Camera initialized")
            self.__pin = pin
            self.__queue = queue
            
        else:
            raise TypeError("Camera: Queue or pin number are not initialized")

    def run(self):
        gpio.setwarnings(False)
        gpio.setmode(gpio.BOARD)
        gpio.setup(pin, gpio.OUT)
        self.__servo = gpio.PWM(__pin, 100)
        self.__servo.start(7)

        while True:
            if not self.__queue.empty():
                result = self.read_queue()
                if result == 2:
                    print("something_camera")
                    break
                else:
                    print("good_camera")
                    continue
            else:
                self.__servo.stop()
                continue
        
        logger.write(str(datetime.datetime.now()) + " - Camera: Powered off")
    
    def read_queue(self):
        message_packet = json.loads(self.__queue.get())

        if message_packet["type"] == "position":
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Camera: Camera Message Received -- " + message_packet["message"])
            #self.__servo.start(float(message_packet["message"]))
            self.__servo.ChangeDutyCycle(float(message_packet["message"]))
            return 1
        elif message_packet["type"] == "off":
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Camera: Off Message Received -- " + message_packet["message"])
            return 2
        else:
            return -1

    def say(self, message=""):
        #self.__player.say(message)
        #self.__player.runAndWait()

        logger.write(str(datetime.datetime.now()) + " - Camera: " + message)
