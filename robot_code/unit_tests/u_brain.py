import unittest
import time
import json
from sys import path
path.insert(0, "/home/pi/Desktop/ROSE/rose/robot_code")
from build import queues
import app


class BrainTest(unittest.TestCase):

    def setUp(self):
        app.init()
    
    def tearDown(self):
        queues.brain_motor_queue.put(json.dumps({"type": "destruct", "message": "Turn off system"}))

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
