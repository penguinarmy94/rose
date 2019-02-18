#arecord -D dmic_sv -c2 -r 48000 -f S32_LE -t wav -V mono -v recording.wav -d 30
import json

class Microphone():
    __micQueue = None

    def __init__(self, queue):
        self.__micQueue = queue

    def run(self):
        while True:
            self.record()
            isThreat = self.getClassification()
            self.writeBrain()
    
    def record(self):
        record = ""
        print(record)
    
    def getClassification(self):
        classify = ""
        print(classify)
    
    def writeBrain(self):
        message_packet = { "type": "brain", "message": "threat"}

        self.__micQueue.put(json.dumps(message_packet))
        