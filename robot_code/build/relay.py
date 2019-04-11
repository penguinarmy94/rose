import json, datetime, RPi.GPIO as gpio
from . import logger

class Relay():
    __pins = {}
    __isOn = {}}
    __queue = None

    def __init__(self, queue = None, pins = None):
        if queue and pins:
            self.__pins = pins
            self.__queue = queue
        else:
            raise TypeError("Queue or pins are not initialized")

    def run(self):
        gpio.setmode(gpio.BOARD)
        for device, pin in self.__pins.items():
            gpio.setup(pin, gpio.OUT)
            self.turnOff(device)

        while True:
            if not self.__queue.empty():
                if self.__read_queue() == 2:
                    break
                else:
                    continue
            else:
                continue
        
        gpio.cleanup()
        logger.write(str(datetime.datetime.now()) + " - Relay: Powered Off")
    
    def __read_queue(self):
        message_packet = json.loads(self.__queue.peek())

        if message_packet["type"] == "off":
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Relay: Off Message Received -- " + message_packet["message"])
            return 2
        elif message_packet["type"] in self.__pins:
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Relay: " + message_packet["type"] + " Message Received -- " + message_packet["message"])

            if message_packet["message"] == "turn on":
                self.turnOn(device = message_packet["type"])
            elif message_packet["message"] == "turn off":
                self.turnOff(device = message_packet["type"])
            else:
                return
        
    # Fix to keep state by device. See where else this is used        
    def isOn(self, device):
        return self.__isOn[device]
    
    def turnOn(self, device):
        self.__isOn[device] = True
        print(self.__pins[device])
        gpio.output(self.__pins[device], gpio.LOW)
        logger.write(str(datetime.datetime.now()) + " - " + device + ": Turned On")
    
    def turnOff(self, device):
        self.__isOn[device] = False
        gpio.output(self.__pins[device], gpio.HIGH)
        logger.write(str(datetime.datetime.now()) + " - " + device + ": Turned Off")
