import unittest
import time
import json
import sys, os
from sys import path

config_file = open('../config.json')
config = json.load(config_file)
config_file.close()
path.insert(0, config["home_path"])

from build import queues, database, behavior
#import app


class DatabaseTest(unittest.TestCase):
    __db = None
    __robot = None

    def setUp(self):
        self.__robot = behavior.Behavior()
        self.__robot.battery = 50

        self.__robot.robotid = config["robotid"]
        self.__robot.connection = 5
        self.__db = database.Database(queues.brain_database_queue, self.__robot, config)
    
    def tearDown(self):
        print("Database stopped")
        #self.__db.close()
        #queues.brain_motor_queue.put(json.dumps({"type": "destruct", "message": "Turn off system"}))

    def test_read(self):
        self.__db.read()

        self.assertEqual(self.__robot.robotid, "01A1Z100BY")
        self.assertEqual(self.__robot.userid.get().to_dict()["username"], "rosellc@gmail.com")
        self.assertEqual(self.__robot.name, "robot1")
        self.assertEqual(self.__robot.power, True)
    
    """
    def test_queue(self):
        queues.arduino_motor_queue.put("5")
        print(queues.arduino_motor_queue)
    """
                
if __name__ == "__main__":
    unittest.main()
