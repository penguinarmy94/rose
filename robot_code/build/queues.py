from queue import Queue
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

brain_motor_queue = PeekableQueue()
brain_microphone_queue = PeekableQueue()
logger_queue = PeekableQueue()
brain_camera_queue = PeekableQueue()
brain_speaker_queue = PeekableQueue()
