from . import logger

class SensorHandler():
    __sensors = {}
    __queue = None

    def __init__(self, sensors = None, queue = None):
        if isinstance(sensors, 'dict') and isinstance(queue, 'PeekableQueue'):
            self.__sensors = sensors
            self.__queue = queue
        elif not sensors:
            raise TypeError("Argument 'sensors' is not of type 'dict'")
        else:
            pass
    
    def addSensor(self, name = None, sensor_object = None):
        if name and sensor_object:
            self.__sensors[name] = sensor_object
            return True
        else:
            return False
    
    def removeSensor(self, name = None):
        if name in self.__sensors.keys:
            self.__sensors[name] = None
    
    def run(self):
        while True:
            if not self.__queue.empty():
                result = self.read_queue()

                if result == 2:
                    break
        





