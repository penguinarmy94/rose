from pyAudioAnalysis import audioTrainTest as aT
from sys import path
import json

aT.featureAndTrain(["assets/gun_shot", "assets/car_horn", "assets/jackhammer", "assets/drilling", "assets/children_playing", "assets/dog_bark"],1.0, 1.0, aT.shortTermWindow, aT.shortTermStep, "svm", "svmModel", False )
