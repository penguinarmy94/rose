import json, firebase_admin, sys, os, time
from firebase_admin import credentials, firestore
from build import queues, robot as rob

class Database():
    __db = None
    __dbQueue = None
    __robot = None
    __robotRef = None
    __subscriber = None
    __initialized = False
    __actionRef = None
    __actions = []

    def __init__(self, config = None):
        
        token = config["token_pi"]
        #token = config["token_windows"]

        auth = credentials.Certificate(token)

        firebase_admin.initialize_app(auth)

        self.__db = firestore.client()

        self.__robotRef = self.__db.collection(u"Robots").document(config["robotid"])
        self.__actionRef = self.__db.collection(u"Action")

    
    def initialize(self, robot = None):

        if self.__robot == None:
            if type(robot) is type(rob.Robot()):
                self.__robot = robot
                self._initialized = True
                return 1
            else:
                print("robot object and/or queue is not of correct type")
                return -1
        else:
            print("Database has already been initialized")
            return 0

    
    def create_subscriber_model(self):

        if self.__subscriber == None:
            def snapshotHandler(snapshot, change, time):
                for doc in snapshot:
                    bot = doc.to_dict()
                    self.__robot.from_dict(bot)

            self.__subscriber = self.__robotRef.on_snapshot(snapshotHandler)
        else:
            print("Subscriber model has already been created. Current subscriber needs to be closed first")
    

    def close(self):
        self.__subscriber.unsubscribe()
        self.__subscriber = None
        self.__initialized = False

    def get_actions(self):
        if not len(self.__actions) == 0:
            return self.__actions
        else:
            documents = self.__actionRef.get()

            for document in documents:
                self.__actions.append(document.to_dict())
            
            return self.__actions

    def update_connection(self):
        if not self.__robot == None:
            self.__robotRef.update({
                u'connection': self.__robot.connection
            })
        else:
            print("Robot has not been set yet")
    
    def update_charging(self):
        if not self.__robot == None:
            self.__robotRef.update({
                u'charging': self.__robot.charging
            })
        else:
            print("Robot has not been set yet")
    
    def update_battery(self):
        if not self.__robot == None:
            self.__robotRef.update({
                u'battery': self.__robot.charging
            })
        else:
            print("Robot has not been set yet")
    
    def update_videos(self):
        if not self.__robot == None:
            self.__robotRef.update({
                u'videos': self.__robot.videos,
                u'num_of_videos': self.__robot.num_of_videos
            })
        else:
            print("Robot has not been set yet")
    
    def update_picture_sensor_status(self):
        if not self.__robot == None:
            self.__robotRef.update({
                u'manual_picture': self.__robot.manualPicture
            })
        else:
            print("Robot has not been set yet")

    def update_robot(self):
        if not self.__robot == None:
            self.__robotRef.update({
                u'connection': self.__robot.connection,
                u'charging': self.__robot.charging,
                u'battery': self.__robot.battery,
                u'num_of_videos': self.__robot.num_of_videos,
                u'videos': self.__robot.videos
            })
        else:
            print("Robot has not been set yet")
