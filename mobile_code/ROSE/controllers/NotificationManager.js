import firebase from 'react-native-firebase';
import { Notification } from 'react-native-firebase';

export default class NotificationManager {

    constructor(topic = "none") {
        this._topic = topic;
        this._notificationReceived = true;

        firebase.messaging().getToken().then((token) => {
            if(token) {
                this._token = token;
                this._tokenRefresh = firebase.messaging().onTokenRefresh((token) => {
                    if(token) {
                        this.__token = token;
                    }
                    else {
                        throw Error("Token is no longer available");
                    }
                });
            }
            else {
                throw Error("No token available for this device");
            }
        })
    }

    subscribeToRobot = () => {
        this.checkPermission();
        alert("subscribed");
    }

    setTopic = (topic) => {
        this._topic = topic;
    }

    unsubscribeFromRobot = () => {
        if(this._topic) {
            firebase.messaging().unsubscribeFromTopic(this._topic);
        }
    }

    checkPermission = () => {
        firebase.messaging().hasPermission().then((enabled) => {
            if(enabled) {
                firebase.messaging().subscribeToTopic(this._topic);
                this._channel = new firebase.notifications.Android.Channel('messaging-channel', 'Test Channel', firebase.notifications.Android.Importance.Max)
                    .setDescription('My apps notification channel');
                firebase.notifications().android.createChannel(this._channel);
                this.checkNotifications();
            }
            else {
                firebase.messaging().requestPermission().then(() => {
                    this._authorized = true;
                    firebase.messaging().subscribeToTopic(this._topic);
                    this._channel = new firebase.notifications.Android.Channel('messaging-channel', 'Test Channel', firebase.notifications.Android.Importance.Max)
                        .setDescription('My apps notification channel');
                    firebase.notifications().android.createChannel(this._channel);
                    this.checkNotifications();
                })
                .catch(error => {
                    this._authorized = false; 
                    alert(str(error)); 
                });
            }
        });
    }

    checkNotifications = () => {
        this._displayListener = firebase.notifications().onNotificationDisplayed((notification) => {
            if(notification) { 
                this._notificationReceived = true;
            }
            else {
                alert("error!");
            }
        });
        this._notificationListener = firebase.notifications().onNotification((notification) => {
            if (this._notificationReceived == true) {
                this._notificationReceived = false;
                alert("activated");
                notification.android.setChannelId("messaging-channel");
                notification.android.setSmallIcon("rose_logo")
                firebase.notifications().displayNotification(notification);
            }
        });
    }
}