from google.cloud import storage
import json, os, datetime

class ImageUplader():
    __config = None
    __robot = None
    __root = "Images"
    __client = None
    __bucket = None

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
            pass

    def read_queue(self):
        pass

    def upload(self, file_path):
        try:
            storage_path = self.__root + self.__robot.id + str(datetime.datetime.now()) + ".png"

            with open(file_path) as file:
                blob = self.__bucket.blob(storage_path)
                blob.upload_from_filename(filename=file_path)
                os.remove(file_path)
        except Exception as e:
            print(str(e))