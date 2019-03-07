import RPi.GPIO as gpio

class Sensor():
    __isOn = False
    __pin = None

    def __init__(self, dataPin = None):
        if queue and dataPin:
            self.__queue = queue
            self.__pin = dataPin
            gpio.setmode(gpio.BCM)
            gpio.setup(self.__pin, gpio.HIGH)
    
    def turnOn(self):
        self.__isOn = True
        gpio.output(self.__pin, gpio.LOW)
    
    def turnOff(self):
        self.__isOff = False
        gpio.output(self.__pin, gpio.)

    def readData(self):
        pass
