import firebase_admin
from firebase_admin import credentials, messaging

class NotificationManager():
    __notifier = None
    __topic = None
    __robot = None
    
    def __init__(self, config = None, app_initialized = False, topic = None, robot_name = ""):

        if app_initialized is False:
            #token_pi = config["token_pi"]
            token_windows = config["token_windows"]
            auth = credentials.Certificate(token_windows)
            firebase_admin.initialize_app(auth)


        self.__notifier = messaging
        self.__topic = topic
        self.__robot = robot_name
    
    def alert(self, message_type = "", message = None):
        if self.__notifier and self.__topic and self.__message:
            message = self.__notifier.Message(
                notification=self.__notifier.Notification(
                    title=message_type+
                )
            )
