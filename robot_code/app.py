from build.brain import Brain
from build.motor import Motor
from threading import Thread
import build.queues as queues, functools

br = None

def init():
    br = Brain(queues.brain_motor_queue, "")
    motor = Motor(queues.brain_motor_queue, queues.arduino_motor_queue)

    motor_thread = Thread(target=functools.partial(motor.run))
    motor_thread.start()
    brain_thread = Thread(target=functools.partial(br.begin))
    brain_thread.start()


if __name__ == "__main__":
    init()



