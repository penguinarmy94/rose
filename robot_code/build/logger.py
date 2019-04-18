import datetime, time, threading, os
from . import queues

logLevels = ["none", "info", "debug"]
level = "none"

def write(message):
    queues.logger_queue.put(message)

def runLogger():
    while True:
        # The log path should be read from config. Pass into logger?
        log_path = "/home/pi/Desktop/Projects/rose/robot_code/logs/"
        try:
            os.makedirs(log_path)
        except FileExistsError:
            pass

        file_name = log_path + "Logs-" + str(datetime.date.today())
        if not queues.logger_queue.empty():
            message = queues.logger_queue.get()
            if message == "turn off":
                break
            else:
                writeFile(file_name, message)
        else:
            continue

def writeFile(file_name = None, message = None, lvl = "none"):
    global logLevels
    global level

    index = logLevels.index(level)

    if lvl in logLevels:
        lvlIndex = logLevels.index(lvl)
    else:
        lvlIndex = 0

    if index >= lvlIndex:
        if not file_name is None and not message is None:
            with open(file_name + ".txt", "a") as fileObj:
                    fileObj.write(message)
                    fileObj.write("\n")

def writeEnd():
    queues.logger_queue.put("turn off")
        
