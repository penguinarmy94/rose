from . import logger
from threading import Thread
import json, datetime, time, subprocess
from . import classifier

class Microphone():
    __queue = None
    __config = None
    __classifier = None
    
    def __init__(self,queue = None, config = None):
        self.__queue = queue
        self.__config = config
        self.__classifier = classifier.Classifier(config)
        
    def run(self):
        while True:
            if not self.__queue.empty():
                result = self.__read_queue()
                if result == 2:
                    break
                else:
                    continue
            else:
                #run the rest of the logic
                #start microphone, record()
                #classify it# 
                file_path = self.__record()
            
                isThreat,percentage = self.__classify(file_path)        
               
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
            file_path = self.__config["capture_path"] + "/image_" + datetime.datetime.now().strftime("%Y%m%d.%H:%M:%S") + ".wav"
            subprocess.check_output("arecord -D dmic_sv -c2 -r 44100 -f S32_LE -t "+ self.__config["record_time"] + "wav -V mono -v " + file_path)
    
            return file_path
        
        except Exception as e:
            print(str(e))


    def __classify(self, file_path):
        #call classify
        isThreat,percentage = self.__classify(file_path)
        
        # if true, send a message to the the brain saying it is a threat 
        if isThreat:
            self.__write_queue("Threat Detected")
        
        logger.write(str(datetime.datetime.now()) + " - Microphone : Threat Detected with " + percentage + " confidence")
    
        
    def __write_queue(self, message):
        logger.write(str(datetime.datetime.now()) + " - Microphone to Brain: " + message)
        try:
            self.__queue.put(json.dumps({"type": "brain", "message":message}))
        except Exception as e:
            error_message = "Microphone.__write_queue() Error: " + str(e)
            time_stamp = str(datetime.datetime.now())
        
            print(time_stamp + ": " + error_message)
            logger.write(time_stamp+ ": " +error_message)


