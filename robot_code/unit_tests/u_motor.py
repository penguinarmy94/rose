import unittest
import time
import json
from sys import path

config_file = open('../config.json')
config = json.load(config_file)
config_file.close()
path.insert(0, config["home_path"])

from build import queues, motor


class MotorTest(unittest.TestCase):
    __motor = None

    def setUp(self):
        self.__motor = motor.Motor(queues.brain_motor_queue)
    
    def tearDown(self):
        self.__motor = None
        
"""
    def test_move_up(self):
        test_cases = ["F5-", "B10-", "N555040-", 5]

        for index in range(len(test_cases) - 2):
            self.assertEquals(self.__motor.move(test_cases[index]), test_cases[index].encode())

        self.assertEquals(self.__motor.move(test_cases[2]), "Command Not Found")
        self.assertEquals(self.__motor.move(test_cases[3]), "Error")
"""
    def test_valid(self):
        test_cases = ["F5-", "B10-", "L3-"]

        for value in test_cases:
            self.__motor.move(value)
            time.sleep(2)
       
                
if __name__ == "__main__":
    unittest.main()
