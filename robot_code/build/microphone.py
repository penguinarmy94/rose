from . import logger
from threading import Thread
import json, datetime, time, subprocess, os
from . import classifier

class Microphone():
    __queue = None
    __config = None
    __classifier = None
    __interval = "15"
    __currentTime = None
    __uploadInterval = 30
    
    def __init__(self,queue = None, config = None):
        try:
            self.__queue = queue
            self.__config = config
            self.__classifier = classifier.Classifier(config)
            self.__currentTime = datetime.datetime.now()
        except Exception as e:
            print("Microphone Init Error: " + str(e))
        
    def run(self):
        while True:
            if not self.__queue.empty():
                result = self.__read_queue()
                if result == 2:
                    break
                else:
                    file_path = self.__record()
            
                    self.__classify(file_path)
            else:
                #run the rest of the logic
                #start microphone, record()
                #classify it# 
                file_path, date = self.__record()
                print(file_path)
                self.__classify(file_path, date)        
               
        logger.write(str(datetime.datetime.now()) + " - Microphone: Powered Off")
           
    def __read_queue(self):
        message_packet = json.loads(self.__queue.peek())

        if message_packet["type"] == "off":
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Microphone: Off Message Received --" + message_packet["message"])
            return 2
        else:
            return 0

    def __record(self):
        try:
            now = datetime.datetime.now()
            no_use = ""

            if self.__currentTime.minute == now.minute and self.__currentTime.second >= self.__uploadInterval:
                self.__currentTime = now + datetime.timedelta(minutes=1)
                no_use = "x_"
            
            path = self.__config["capture_path"]
            date = datetime.datetime.now().strftime("%Y%m%d.%H:%M:%S")
            file_path = path + no_use + "audio_" + date + ".wav"
            subprocess.check_output("arecord -D plughw:1 -c2 -r 48000 -d " + self.__interval + " -f S32_LE -t wav -q " + file_path, shell=True)
            print("microphone done recording")
            return (file_path, date)
        
        except Exception as e:
            logger.write(str(datetime.datetime.now()) + " - Microphone.__record Error: " + str(e))
            print("Mirophone.__record Error: " + str(e))


    def __classify(self, file_path, date):
        #call classify
        isThreat,percentage = self.__classifier.classify(file_path)

        if not "y_" in file_path:
            os.rename(file_path, self.__config["capture_path"] + "y_audio_" + date + ".wav")

        # if true, send a message to the the brain saying it is a threat 
        if isThreat:
            self.__write_queue("Threat Detected")
            logger.write(str(datetime.datetime.now()) + " - Microphone : Threat Detected with " + str(percentage) + " confidence")
    
        
    def __write_queue(self, message):
        logger.write(str(datetime.datetime.now()) + " - Microphone to Brain: " + message)
        try:
            self.__queue.put(json.dumps({"type": "brain", "message":message}))
        except Exception as e:
            error_message = "Microphone.__write_queue() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())
        
            print(time_stamp + ": " + error_message)
            logger.write(time_stamp+ ": " +error_message)


