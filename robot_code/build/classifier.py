
#import numpy as np
#import scipy as sp
#import pydub
#import matplotlib as plt
#import hmmlearn
#import sklearn
#import eyed3
#import simplejson
from sys import path
import json
from pyAudioAnalysis import audioTrainTest as aT

class Classifier:
    __threshold = 0.70
    __config = None

    def __init__(self, config = None):
        positiveData = self.__config["home_path"] + "/assets/gun_shot"
        negativeData = self.__config["home_path"] + "assets/car_horn"
        aT.featureAndTrain([positiveData, negativeData], 1.0, 1.0, aT.shortTermWindow, aT.shortTermStep, "svm", "svmSMtemp", False)


    #Train and Test Split here
    def __classify(self, file_path  ):
        result =  aT.fileClassification(file_path , "svmTry","svm")
        print(result)
    
        #check the gunshot by parsing the result tuple
        percentage = result[1]
        print(percentage)
        
        act = result[2]
        print(act)
        
        
        index = act.index("gun_shot")
        
        percentageGunshot = percentage[index]
        
        
        if percentageGunshot > self.__threshold:
            return (True, percentageGunshot)
        else:
            return (False, percentageGunshot)
            
            
        
            
            
    

