import serial, RPi.GPIO as gpio, json, datetime
from . import logger

class Light():
    __pin = None
    __isOn = False
    __queue = None

    def __init__(self, queue = None, pin = None):
        if queue and pin:
            self.__pin = pin
            self.__queue = queue
            gpio.setmode(gpio.BCM)
            gpio.setup(self.__pin, gpio.HIGH)
        else:
            raise TypeError("Queue or pin # are not initialized")

    def run(self):
        while True:
            if not self.__queue.empty():
                if self.__read_queue() == 2:
                    break
                else:
                    continue
            else:
                continue
        
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
            message_packet = json.loads(self.__bqueue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Light: Off Message Received -- " + message_packet["message"])
            return 2
    
    def isOn(self):
        return self.__isOn
    
    def turnOn(self):
        self.__isOn = True
        gpio.output(self.__pin, gpio.HIGH)
        logger.write(str(datetime.datetime.now()) + " - Light: Turned On")
    
    def turnOff(self):
        self.__isOn = False
        gpio.output(self.__pin, gpio.LOW)
        logger.write(str(datetime.datetime.now()) + " - Light: Turned Off")
