from sys import path
import json
from pyAudioAnalysis import audioTrainTest as aT

class Classifier:
    __threshold = 0.70
    __config = None
    __model = "svmModel"
    __type = "svm"

    def __init__(self, config = None):
        try:
            self.__config = config
            #positiveData = self.__config["home_path"] + "/assets/gun_shot"
            #negativeData = self.__config["home_path"] + "/assets/car_horn"
            #aT.featureAndTrain([positiveData, negativeData], 1.0, 1.0, aT.shortTermWindow, aT.shortTermStep, "svm", "svmSMtemp", False)
        except Exception as e:
            print("Classifier Init Error: " + str(e))

    #Train and Test Split here
    def classify(self, file_path):
        result =  aT.fileClassification(file_path , self.__model,self.__type)
        print("Classification Success")
    
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
            
            
        
            
            
    

