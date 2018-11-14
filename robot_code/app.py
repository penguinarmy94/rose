from build.brain import Brain
from build.motor import Motor
from build.behavior import Behavior
from build.database import Database
from threading import Thread
import build.queues as queues, functools, json

br = None

with open('config.json') as config_file:
            config = json.loads(config_file)

def init():
    robot = Behavior()
    robot.battery = 50
    robot.robotid = config["robotid"]
    robot.connection = 5

    br = Brain(queues.brain_motor_queue, queues.brain_microphone_queue, queues.brain_database_queue, queues.brain_camera_queue, "")
    motor = Motor(queues.brain_motor_queue)
    database = Database(queues.brain_database_queue, behavior)

    motor_thread = Thread(target=functools.partial(motor.run))
    motor_thread.start()
    brain_thread = Thread(target=functools.partial(br.begin))
    brain_thread.start()


if __name__ == "__main__":
    init()



