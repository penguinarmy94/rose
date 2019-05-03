# R.O.S.E: Robotic Observer for Security Enforcement
The ROSE project is based on building on top of current security robots out in the market. There is two main components: a robot chassis (ROSEbot) and a mobile application (ROSEapp)

In order to use this application, you must have access to a ROSEbot hardware piece. The robot software comes pre-installed
into the hardware components. This part of the software is not meant to be installed by the user directly.

In order to use the mobile application, the user needs to have an Android device with Android 7.0 or higher. There is currently no iOS version of the application. The following steps show you how to install the application:
1.	Download the rose.apk file from our github repository: http://github.com/penguinarmy94/rose
2.	Make sure the apk file is on the Android device that you want to use
3.	Install the APK using the Android APK installer that comes with your Android device
4.	Follow the on-screen instructions to fully install the application

## 1.0 Using the application

In order to use the ROSE application, you need to have both a user account and at least one physical robot from the ROSE,inc. organization. If you have a robot, but no user account, follow these steps:
1.	Open the ROSE application

!screenshots/rose.jpg!

2.	You will see the ROSE login page. Go to the register page by pressing on the “Register >” option
 
!screenshots/register.jpg!
 
3. Fill out the registration information with a valid email address, a password for your account, a name for the physical robot that you currently have, and the ID number for your robot. The ID can be found on the barcode that is attached to the robot hardware
4. Click register when you have all the information filled out

### 1.1 View your robot’s status information

1.	Log in to the ROSE application with your credentials
2.	Once inside the application, you will see the status information for your robot. The following are the status information you should be able to see:

!screenshots/info.jpg!

### 1.2. Access images taken by your robot

1.	Log in to the ROSE application using your credentials
2.	When you are in the info page, press on the “Images” tab
3.	You should see a list of images that your robot has taken (if any). Otherwise, you should see “No Images” 
 
!screenshots/images.jpg!

4. If you press on one of the images, you will notice that you can pinch to zoom in to the picture to see it more clearly. Press the back button or the “x” to exit the image screen

!screenshots/image_view.jpg!

### 1.3 Changing Robot Settings

1.	Log in to the mobile application using your credentials
2.	When you are in the info page, press on the “Settings” tab
3.	Here you can change settings such as:
a.	Turning your robot ON/OFF
b.	Turing the robot lights ON/OFF
c.	Taking a picture with your robot camera
d.	Changing the camera position
e.	Pick or create a phrase for your robot to say
4.	The power must be ON for the other settings to be modified

!screenshots/settings_home.jpg!
 
### 1.4 Add a robot

1.	Log in to the mobile application using your credentials
2.	When you get to the info screen, press on the “Settings” tab
3.	In the Settings screen, press on the “Add Robot” option

!screenshots/robot_add.jpg!

4. On this screen, you can create a name for your robot and fill out the robot ID section with the ID for the robot hardware. The robot ID is located on the barcode that is attached to the robot hardware
5. You can press on submit when you are done filling out the details

### 1.5 Change Robot

1.	Log in to the mobile application using your credentials
2.	When in the info screen, press on the “Settings” option
3.	When in the Settings screen, press on the “Change Robot” option
4.	You will see a list of robots for your account. Select the one you would like to see and/or modify. Click “Ok” when you are done
 
!screenshots/robot_change.jpg!

### 1.6 Edit Idle/Detect Behaviors

1.	Log in to the mobile application using your credentials
2.	When in the info screen, press on the “Settings” option
3.	When in the Settings screen, press on the “Behaviors” option
4.	You will see a dropdown list for both the idle/detect behaviors. Press on one of the options from the dropdown to change the robot behavior

!screenshots/behavior_edit.jpg!

5. In this screen, you can also delete behaviors that you have previously created. Press on the minus sign to delete a behavior. The only way you can delete a behavior is if none of your robots are using it

### 1.7 Create a Behavior

1.	Log in to the mobile application using your credentials
2.	When in the info screen, press on the “Settings” option
3.	When in the Settings screen, press on the “Behaviors” option
4.	When in the Behaviors screen, press on the plus sign at the bottom of the screen
5.	You will now see the behavior add screen. Fill out the name of the behavior and its description
6.	A behavior is a set of one or more blocks called “Actions” . These actions are pre-defined. Press on an action block to expand it and see its description and a place to put a value

!screenshots/behavior_create.jpg!

7. You can view the descriptions of each block to know what you want the robot to do. There is a range of movement, speaker, emergency light, and other types of actions
8. For each block, fill out the value field with the value that you would like. For example, if you would like to have the robot roam for five seconds, pick the Roaming action and fill the value with 5.
