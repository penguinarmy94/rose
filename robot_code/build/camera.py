from . import logger
from threading import Thread
from time import sleep
from picamera import PiCamera
import json, datetime, pyttsx3, functools, RPi.GPIO as gpio

class Camera():
    __pos = None
    __pin = None
    __queue = None
    __servo = None
    __camera = None
    __interval = None
    __last_capture = None

    def __init__(self, queue = None, pin = 12, pos = 7):
        if queue and pin:
            logger.write(str(datetime.datetime.now()) + " - Camera initialized")
            self.__pin = pin
            self.__pos = pos
            self.__queue = queue
            self.__interval = 0
            
        else:
            raise TypeError("Camera: Queue or pin number are not initialized")

    def run(self):
        gpio.setwarnings(False)
        gpio.setmode(gpio.BOARD)
        gpio.setup(self.__pin, gpio.OUT)
        self.__servo = gpio.PWM(self.__pin, 50)
        #self.__servo.start(self.__pos)
        self.__camera = PiCamera()
        self.__camera.start_preview()
        
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
                if self.__interval > 0:
                    now = datetime.datetime.now()
                    minutes_passed = (now - self.__last_capture).total_seconds()/60
                    if minutes_passed >= interval:
                        self.__last_capture = now    
                        logger.write(str(datetime.datetime.now()) + ".CameraThread.CaptureOnIntervasl.Enter")

                        #self.__camera.capture('/home/pi/picamera/image{timestamp}.jpg')
            
                        logger.write(str(datetime.datetime.now()) + ".CameraThread.CaptureOnInterval.Exit")
                        continue
        
        #self.__servo.stop()
        self.__camera.stop_preview()
        gpio.cleanup()

        logger.write(str(datetime.datetime.now()) + " - Camera: Powered off")
    
    def read_queue(self):
        message_packet = json.loads(self.__queue.get())

        if message_packet["type"] == "position":
            
            pos = self.__pos + 3 * float(message_packet["message"])
            logger.write(str(datetime.datetime.now()) + " - Brain to Camera: Camera Message Received -- " + message_packet["message"] + " -- Moving to " + str(pos))
           
            #self.__servo.ChangeDutyCycle(pos)
            self.__servo.start(pos)
            sleep(1)
            self.__servo.stop()
            return 1

        elif message_packet["type"] == "manual":
            logger.write(str(datetime.datetime.now()) + ".CameraThread.setManual.Enter")

            #self.__camera.capture('/home/pi/picamera/image{timestamp}.jpg')
            
            logger.write(str(datetime.datetime.now()) + ".CameraThread.setManual.Exit")

        elif message_packet["type"] == "automatic":
            logger.write(str(datetime.datetime.now()) + ".CameraThread.setAutomatic[" + message_packet["message"] + "].Enter")

            self.__interval = int(message_packet["message"])
            self.__last_capture = datetime.datetime.now()

            logger.write(str(datetime.datetime.now()) + ".CameraThread.setAutomatic.Exit")

        elif message_packet["type"] == "off":
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Camera: Off Message Received -- " + message_packet["message"])
            return 2
        else:
            return -1

    def move_camera(self, message=""):
        logger.write(str(datetime.datetime.now()) + " - Camera: " + message)