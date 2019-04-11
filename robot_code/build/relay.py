import json, datetime, RPi.GPIO as gpio
from . import logger

class Relay():
    __pins = {}
    __isOn = False
    __queue = None

    def __init__(self, queue = None, pins = None):
        if queue and pins:
            self.__pins = pins
            self.__queue = queue
        else:
            raise TypeError("Queue or pin number are not initialized")

    def run(self):
        gpio.setmode(gpio.BOARD)
        for devices,pin in self.__pins:
            gpio.setup(pin, gpio.OUT)
        #gpio.setup(self.__pin, gpio.OUT)
        self.turnOff()

        while True:
            if not self.__queue.empty():
                if self.__read_queue() == 2:
                    break
                else:
                    continue
            else:
                continue
        
        gpio.cleanup()
        logger.write(str(datetime.datetime.now()) + " - Light: Powered Off")
    
    def __read_queue(self):
        message_packet = json.loads(self.__queue.peek())

        if message_packet["type"] == "light":
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Light: Message Received -- " + message_packet["message"])

            if message_packet["message"] == "turn on":
                self.turnOn()
            elif message_packet["message"] == "turn off":
                self.turnOff()
            else:
                return
        elif message_packet["type"] == "off":
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Light: Off Message Received -- " + message_packet["message"])
            return 2
    
    def isOn(self):
        return self.__isOn
    
    def turnOn(self):
        self.__isOn = True
        gpio.output(self.__pin, gpio.LOW)
        logger.write(str(datetime.datetime.now()) + " - Light: Turned On")
    
    def turnOff(self):
        self.__isOn = False
        gpio.output(self.__pin, gpio.HIGH)
        logger.write(str(datetime.datetime.now()) + " - Light: Turned Off")
