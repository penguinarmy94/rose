import unittest
import time
import json
from sys import path

path.insert(0, "C://Users/Luis/Desktop/Fall 2018/")
from parameterized import parameterized
from build import queues
import app


class BrainTest(unittest.TestCase):
    @parameterized.expand([(["N", "S", "E", "W"], 2)])

    def construct(self):
        app.init()
    
    def destruct(self):
        queues.brain_motor_queue.put(json.dumps({"type": "destruct", "message": "Turn off system"}))

    def queue_mic(self, messages, delay):
        self.construct()

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
        
        self.destruct()
    
    def test_queue(self):
        queues.arduino_motor_queue.put("5")
        print(queues.arduino_motor_queue[0])
                
if __name__ == "__main__":
    unittest.main()