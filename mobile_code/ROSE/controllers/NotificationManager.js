import firebase from 'react-native-firebase';
import { Notification } from 'react-native-firebase';

export default class NotificationManager {

    constructor(topic = "none") {
        this._topic = topic;

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
                this.checkPermission();
            }
            else {
                throw Error("No token available for this device");
            }
        })
    }

    subscribeToRobot = (topic) => {
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
                //firebase.notifications().removeDeliveredNotification(notification.notificationId);
            }
            else {
                alert("error!");
            }
        });
        this._notificationListener = firebase.notifications().onNotification((notification) => {
            notification.android.setChannelId("messaging-channel");
            notification.android.setSmallIcon("rose_logo")
            firebase.notifications().displayNotification(notification);
        });
    }
}