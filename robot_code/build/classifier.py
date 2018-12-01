
# coding: utf-8

# In[1]:

import numpy as np
import scipy as sp
import pydub
import matplotlib as plt 
from pyAudioAnalysis import audioTrainTest as aT

from sys import path
import json

config_file = open('config.json')
config = json.load(config_file)
config_file.close()
path.insert(0, config["home_path"])

# In[2]:

# Reading the dataset with .wav files
#sr, x = scipy.io.wavfile.read('/home/sarvpsin/Desktop/pyAudioAnalysis/pyAudioAnalysis/Data_mic/gun_shot_wav/102305.wav ')


# In[8]:


aT.featureAndTrain(["build/gun_shot", "build/car_horn"], 1.0, 1.0, aT.shortTermWindow, aT.shortTermStep, "svm", "SVMTry", False)


# In[12]:

#train test split here

aT.fileClassification("build/gun_shot/7060.wav", "SVMTry","svm")


# In[6]:

# knn
#accuracy and F1_score


# In[7]:

#svm
#accuracy and F1_score


# In[8]:

#random forest
#accuracy and F1_score


# In[9]:

#CPU Usage


# In[ ]:

#Time taken by each model

