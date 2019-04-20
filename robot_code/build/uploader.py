from google.cloud import storage
from . import logger
import json, datetime, os
from os import listdir
from os.path import isfile, join

class Uploader():
    __config = None
    __robot = None
    __root = "Images"
    __client = None
    __bucket = None
    __queue = None

    """
        Description: Constructor for Uploader class

        Parameters
        ----------
        queue: queues.PeekableQueue()
                    Description:
                        The queue that will be used as the interface for sending and receiving messages
                        between this module and other modules
        config: Dictionary
                    Description:
                        A dictionary that has all of the constants for the application, such as
                        path to image directory, path to app.py directory, etc.
        robot: robot.Robot()
                    Description:
                        A robot reference that this module will need to send notifications to the user
                        via the cloud messaging manager
    """
    def __init__(self, queue = None, robot = None, config = None):
        try:
            if not queue:
                raise TypeError("Queue parameter not set")
            if not config:
                raise TypeError("Config parameter not set")
            if not robot:
                raise TypeError("Robot parameter is not set")

            self.__config = config
            self.__robot = robot
            self.__queue = queue
            self.__activateClient(self.__config["token_pi"])
        except Exception as e:
            print(str(e))


    """
        Description: This function activates the cloud storage client which allows
        this module to upload content to the cloud storage server

        Parameters
        ----------
        token: String
                    Description:
                        A string path to the json file which contains the authentication
                        details for the cloud storage functions
    """
    def __activateClient(self, token):
        try:
            print("Uploadr:")
            self.__client = storage.Client.from_service_account_json(token)
            print(self.__client)
            self.__bucket = self.__client.bucket(self.__config["bucket"])
            print(self.__bucket)
        except Exception as e:
            print(str(e))
    
    """
        Description: This function is consumed by threading.Thread() to run the uploader
        functionality separate from the main thread of execution.

        The uploader goes into a loop and continues to read from its corresponding queue 
        for either messages that tell it to upload some files to a specific locatlon or to
        terminate.

        Parameters
        ----------
        None
    """
    def run(self):
        while True:
            if not self.__queue.empty():
                if self.__read_queue() == 2:
                    break
                else:
                    self.__read_directory()
                    continue
            else:
                self.__read_directory()
        
        logger.write(str(datetime.datetime.now()) + " - Uploader Powered Off")

            
    """
        Description: This function reads from the module's corresponding queue
        for any messages that tell it to terminate.

        Parameters
        ----------
        None
    """
    def __read_queue(self):
        message_packet = json.loads(self.__queue.peek())

        if message_packet["type"] == "off":
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Uploader: Off Message Received -- " + message_packet["message"])
            return 2
        else:
            return 1

    """
        Description: This function reads from a specific directory to check for files
        that it should upload to the cloud storage server. Currently only jpeg, jpg and wav files
        are supported.

        Parameters
        ----------
        None
    """
    def __read_directory(self):
        for file in listdir(self.__config["capture_path"]):
            tempFile = join(self.__config["capture_path"], file)
            if isfile(tempFile):
                print(tempFile)
                if file.startswith("x_"):
                    continue
                if tempFile.endswith(".jpeg") or tempFile.endswith(".jpg") or tempFile.endswith(".wav"):
                    new_path = self.__config["capture_path"] + "x_" + file
                    os.rename(tempFile, new_path)
                    self.__upload(file, new_path)

    """
        Description: This function is used for uploading files (given its file path) to 
        the cloud storage server and deleting the files after they are uploaded.

        Parameters
        ----------
        file_path: String
                    Description:
                        The file path of the file that is going to be uploaded to the
                        cloud storage server
    """
    def __upload(self, aFile, file_path):
        try:
            storage_path = self.__root + "/" + self.__robot.id + "/" + aFile

            print(storage_path)

            with open(file_path) as file:
                blob = self.__bucket.blob(storage_path)
                blob.upload_from_filename(filename=file_path)
                if file_path.endswith('.jpeg') or file_path.endswith('.jpg'):
                    self.__robot.videos.append(storage_path)
                    self.__robot.num_of_videos += 1
                    self.__write_queue(message_type="brain", message="upload complete")
                
    
        except Exception as e:
            print(str(e))
    

    def __write_queue(self, message_type = "brain", message = "upload complete"):
        self.__queue.put(json.dumps({ "type" : message_type, "message" : message}))