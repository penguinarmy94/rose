from queue import Queue
from multiprocessing import Queue as q
import json

class PeekableQueue(Queue):
    def peek(self):
        try:
            head = self.queue[0]
            return head
        except:
            return json.dumps({"type": "none", "message": "no peek allowed"})
    def clear(self):
        self.queue.clear()

class ProcessQueue():
    __queue = None

    def __init__(self):
        self.__queue = q()

    def empty(self):
        return self.__queue.empty()
    
    def get(self):
        return self.__queue.get()

    def put(self, obj):
        self.__queue.put(obj)

    def clear(self):
        while not self.__queue.empty():
            self.__queue.get()


brain_motor_queue = PeekableQueue()
brain_microphone_queue = PeekableQueue()
logger_queue = PeekableQueue()
brain_camera_queue = PeekableQueue()
brain_speaker_queue = PeekableQueue()
brain_notifier_queue = PeekableQueue()
brain_sensor_queue = PeekableQueue()
brain_uploader_queue = PeekableQueue()
