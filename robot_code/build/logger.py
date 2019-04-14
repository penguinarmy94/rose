import datetime, time, threading
from . import queues

logLevels = ["none", "info", "debug"]
level = 0

def write(message):
    queues.logger_queue.put(message)

def runLogger():
    while True:
        file_name = "logs/Logs-" + str(datetime.date.today())
        if not queues.logger_queue.empty():
            message = queues.logger_queue.get()
            if message == "turn off":
                break
            else:
                writeFile(file_name, message)
        else:
            continue

def writeFile(file_name = None, message = None, level = None):
    global logLevels
    global level

    index = logLevels.index(level)

    if index >= level:
        if not file_name is None and not message is None:
            with open(file_name + ".txt", "a") as fileObj:
                    fileObj.write(message)
                    fileObj.write("\n")

def writeEnd():
    queues.logger_queue.put("turn off")
        
