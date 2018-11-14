import json, firebase_admin, sys, os, time
from sys import path
from firebase_admin import credentials, firestore
from . import queues

path.insert(0, "C:/Users/Luis/Desktop/Fall 2018/CMPE 295A/Robot Code/robot_code")

class Database():
    __auth = ""
    __db = None
    __dbQueue = None
    __token_pi = None
    __token_windows = None
    __behavior = None

    def __init__(self, dbQueue, behavior):
        self.__dbQueue = dbQueue
        self.__behavior = behavior

        config_file = open('../config.json')
        config = json.load(config_file)
        config_file.close()
        
        self.__token_pi = config["token_pi"]
        self.__token_windows = config["token_windows"]

        self.__auth = credentials.Certificate(self.__token_windows)
        firebase_admin.initialize_app(self.__auth)
        self.__db = firestore.client()
    
    def run(self):
        while True:
            self.read()
            time.sleep(5)
           #perform database tasks like read() and write()

    def close(self):
        #self.__db.close()
        print("closed")
    
    def read(self):
        results = self.__db.collection(u'Robots').document(self.__behavior.robotid)

        try:
            robot = results.get().to_dict()

            if not robot["idle_behavior"] == self.__behavior.idle_behavior:
                self.__behavior.idle_behavior = robot["idle_behavior"]
            if not robot["detect_behavior"] == self.__behavior.detect_behavior:
                self.__behavior.detect_behavior = robot["detect_behavior"]
            if not robot["power"] == self.__behavior.power:
                self.__behavior.idle_behavior = robot["power"]
            if not robot["name"] == self.__behavior.name:
                self.__behavior.name = robot["name"]
            if not robot["num_of_videos"] == self.__behavior.num_of_videos:
                self.__behavior.num_of_videos = robot["num_of_videos"]
            if not robot["userid"] == self.__behavior.userid:
                self.__behavior.userid = robot["userid"]

        except Exception as e:
            print(str(e))

