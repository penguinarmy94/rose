from queue import Queue

class PeekableQueue(Queue):
    def peek(self):
        return self.queue[0]

brain_motor_queue = PeekableQueue()
brain_microphone_queue = PeekableQueue()
brain_database_queue = PeekableQueue()
brain_camera_queue = PeekableQueue()
