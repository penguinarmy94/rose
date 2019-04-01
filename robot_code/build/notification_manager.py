import firebase_admin, json, datetime
from firebase_admin import credentials, messaging
from . import logger

class NotificationManager():
    __notifier = None
    __topic = None
    __robot = None
    __queue = None
    __notificationsOn = False
    
    """
        Description: Constructor for Notification Manager class

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
        app_initialized: Boolean
                    Description:
                        A boolean that tells this module whether the Google Firebase application has
                        been initialized or not
        robot: robot.Robot()
                    Description:
                        A robot reference that this module will need to send notifications to the user
                        via the cloud messaging manager
    """
    def __init__(self, queue = None, config = None, app_initialized = False, robot = ""):
        try:
            if app_initialized is False:
                token = config["token_pi"]
                auth = credentials.Certificate(token)
                firebase_admin.initialize_app(auth)

            self.__notifier = messaging
            self.__topic = robot.id
            self.__robot = robot
            
            if queue is None:
                raise TypeError("Queue parameter has not been initialized")
            else:
                self.__queue = queue
        except Exception as e:
            print(str(e))

    """
        Description: This function is used is consumed by threading.Thread() to run
        the notification manager functionality separate from the main thread of execution.

        The notification manager listens to messages from its queue and it performs based
        on those messages, whether it is to send a notification to the user or end terminate.

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
                    continue
            else:
                continue
        
        logger.write(str(datetime.datetime.now()) + " - Notification Manager: Powered Off")


    """
        Description: This function is used to read from the queue that corresponds to this 
        module. These are the possible instructions that the notification manager will process
        and execute:

        notification --> sends a notification to the user only if all notification types are allowed
        threat_detected --> sends an alert to the user that a threat was detected
        notification_on --> turns on a flag to tell this module to send all types of notifications
        notification_off --> turns off a flag to tell this module to only send "OFF" and threat detected
                             notifications
        off --> sends an "OFF" notification to the user and then terminates this module

        Parameters
        ----------
        None
    """
    def __read_queue(self):
        message_packet = json.loads(self.__queue.peek())

        if message_packet["type"] == "notification":
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Notification Manager: Notification Message Received -- " + message_packet["message"])

            if self.__notificationsOn:
                self.notify(message_type=self.__robot.name + ": Status", message= message_packet["message"])
            
            return 1
        elif message_packet["type"] == "threat_detected":
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Notification Manager: Notification Message Received -- " + message_packet["message"])

            self.notify(message_type=self.__robot.name + ": Alert", message= message_packet["message"])
            
            return 1
        elif message_packet["type"] == "notification_on":
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Notification Manager: Notification Message Received -- " + message_packet["message"])

            self.__notificationsOn = True
            return 1
        elif message_packet["type"] == "notification_off":
            message_packet = json.loads(self.__queue.get())
            logger.write(str(datetime.datetime.now()) + " - Brain to Notification Manager: Notification Message Received -- " + message_packet["message"])

            self.__notificationsOn = False
        elif message_packet["type"] == "off":
            message_packet = json.loads(self.__queue.get())
            self.notify(message_type=self.__robot.name + ": Off Message", message = message_packet["message"])
            logger.write(str(datetime.datetime.now()) + " - Brain to Notification Manager: Off Message Received -- " + message_packet["message"])
            return 2
        else:
            return 0
    

    """
        Description: This function is used to send notifications via the cloud messaging
        manager to the user

        Parameters
        ----------
        None
    """
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
