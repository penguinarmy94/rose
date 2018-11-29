import unittest
import time
import json
from sys import path

config_file = open('../config.json')
config = json.load(config_file)
config_file.close()
path.insert(0, config["home_path"])

from build import queues, brain, behavior


class BrainTest(unittest.TestCase):
    __brain = None

    def setUp(self):
        self.__brain = brain.Brain(queues.brain_motor_queue, queues.brain_microphone_queue, queues.brain_database_queue, queues.brain_camera_queue, behavior.Behavior())

    
    def tearDown(self):
        
    def test_queue_mic(self):
        messages = ["N", "S", "E", "W"]
        delay = 30
        count = 0

        for message in messages:
            queues.brain_motor_queue.put(json.dumps({"type": "microphone", "message": message}))
            print(message)
            time.sleep(delay)
        
        self.assertFalse(queues.log.empty())
        if not queues.log.empty():
            while not queues.log.empty():
                queues.log.get()
                count += 1
            
            self.assertTrue(count == len(messages))
        else:
            self.assertTrue(1 == 2)
    
    """
    def test_queue(self):
        queues.arduino_motor_queue.put("5")
        print(queues.arduino_motor_queue)
    """
                
if __name__ == "__main__":
    unittest.main()
