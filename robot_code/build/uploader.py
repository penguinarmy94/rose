from google.cloud import storage
from . import logger
import json, datetime
from os import listdir
from os.path import isfile, join
onlyfiles = [f for f in listdir(mypath) if isfile(join(mypath, f))]

class ImageUplader():
    __config = None
    __robot = None
    __root = "Images"
    __client = None
    __bucket = None
    __queue = None

    def __init__(self, queue = None, config = None, robot = None, token = None):
        try:
            if not queue:
                raise TypeError("Queue parameter not set")
            if not config:
                raise TypeError("Config parameter not set")
            if not robot:
                raise TypeError("Robot parameter is not set")
            if not token:
                raise TypeError("Token parameter is not set")

            self.__config = config
            self.__robot = robot
            self.__queue = queue
        except Exception as e:
            print(str(e))

    def __activateClient(self, token):
        try:
            self.__client = storage.Client.from_service_account_json(token)
            self.__bucket = self.__client.bucket(self.__config["bucket"])
        except Exception as e:
            print(str(e))
    
    def run(self):
        while True:
            if not self.__queue.empty():
                if self.__read_queue() == 2:
                    break
                else:
                    continue
            else:
                continue
        
        logger.write(str(datetime.datetime.now()) + " - Uploader Powered Off")

            
    
    def read_queue(self):
        message_packet = json.loads(self.__queue.peek())

        if message_packet["type"] == "off":
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Uploader: Off Message Received -- " + message_packet["message"])
            return 2
        else:
            return 1


    def read_directory(self):
        for file in listdir(self.__config[""]):
            tempFile = join(self.__config[""], file)
            if isfile(tempFile):
                self.upload(tempFile)


    def upload(self, file_path):
        try:
            storage_path = self.__root + self.__robot.id + str(datetime.datetime.now()) + ".png"

            with open(file_path) as file:
                blob = self.__bucket.blob(storage_path)
                blob.upload_from_filename(filename=file_path)
                os.remove(file_path)
        except Exception as e:
            print(str(e))