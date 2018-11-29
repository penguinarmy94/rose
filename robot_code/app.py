import json, functools
from threading import Thread
from sys import path

config_file = open('config.json')
config = json.load(config_file)
config_file.close()
path.insert(0, config["home_path"])

from build import brain, motor, behavior, database, queues


br = None

def init():
    robot = behavior.Behavior()
    robot.battery = 50
    robot.robotid = config["robotid"]
    robot.connection = 5

    br = brain.Brain(queues.brain_motor_queue, queues.brain_microphone_queue, queues.brain_database_queue, queues.brain_camera_queue, "")
    mtr = motor.Motor(queues.brain_motor_queue)
    db = database.Database(queues.brain_database_queue, behavior, config)

    #motor_thread = Thread(target=functools.partial(mtr.run))
    #motor_thread.start()
    #brain_thread = Thread(target=functools.partial(br.begin))
    #brain_thread.start()


if __name__ == "__main__":
    init()



