import firebase_admin, json, datetime
from firebase_admin import credentials, messaging
from . import logger

class NotificationManager():
    __notifier = None
    __topic = None
    __robot = None
    __queue = None
    
    def __init__(self, queue = None, config = None, app_initialized = False, robot = ""):

        if app_initialized is False:
            #token_pi = config["token_pi"]
            token_windows = config["token_windows"]
            auth = credentials.Certificate(token_windows)
            firebase_admin.initialize_app(auth)

        self.__notifier = messaging
        self.__topic = robot.id
        self.__robot = robot
        
        if queue is None:
            raise TypeError
        else:
            self.__queue = queue

    def run(self):
        while True:
            if not self.__queue.empty():
                if self.__read_queue() == 2:
                    break
                else:
                    continue
        
        logger.write(str(datetime.datetime.now()) + " - Notification Manager: Powered Off")

    def __read_queue(self):
        message_packet = json.loads(self.__queue.peek())

        if message_packet["type"] == "notification":
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Notification Manager: Notification Message Received -- " + message_packet["message"])

            self.alert("Robot Moved", message_packet["message"])
            return 1
        elif message_packet["type"] == "off":
            message_packet = json.loads(self.__queue.get())
            self.notify(message_type=self.__robot.name + ": Off Message", message = message_packet["message"])
            logger.write(str(datetime.datetime.now()) + " - Brain to Notification Manager: Off Message Received -- " + message_packet["message"])
            return 2
        else:
            return 0
    
    def notify(self, message_type = "", message = None):
        if self.__notifier and self.__topic and message:
            a_message = self.__notifier.Message(
                notification=self.__notifier.Notification(
                    title=message_type,
                    body=message
                ),
                topic = self.__topic
            )

            response = self.__notifier.send(a_message)
            logger.write(str(datetime.datetime.now()) + " - Notification Manager: " + response + " -- " + message)
