import time

class Serial():
    __port = None
    __bandwidth = 0
    in_waiting = 0
    __inBuffer = ""
    __outBuffer = ""

    def __init__(self, port="/dev/", bandwidth=0):
        self.__port = port
        self.__bandwidth = bandwidth
    
    def write(self, bytes):
        self.__outBuffer += bytes.decode()
        self.out_waiting = len(self.__outBuffer)

    def writePython(self, bytes):
        time.sleep(2)
        self.__inBuffer += bytes.decode()
        self.in_waiting = len(self.__inBuffer)
    
    def read(self, buffer=0):
        message = self.__inBuffer[:buffer]
        self.__inBuffer = self.__inBuffer[buffer:]
        self.in_waiting = len(self.__inBuffer)

        return message.encode()
        