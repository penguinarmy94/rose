from queue import Queue

class PeekableQueue(Queue):
    def peek(self):
        return self.queue[0]

brain_motor_queue = PeekableQueue()
arduino_motor_queue = PeekableQueue()
log = PeekableQueue()
on = True
