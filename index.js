/**
 * @format
 */
import { AppRegistry } from "react-native";
import { name as appName } from './app.json'
import App from "./App";
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database'
import messaging from '@react-native-firebase/messaging'
import { GoogleSignin } from '@react-native-google-signin/google-signin';
GoogleSignin.configure({
    webClientId: '671015599305-0n13gc7ne117oevrepee0d27fub7gllr.apps.googleusercontent.com',
});
messaging().setBackgroundMessageHandler(async remoteMessage => {
    const user = auth().currentUser;
    if (user) {
        const myAuthUserId = user.uid;

        const dateFormat = Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const timeFormat = Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        const currentDate = dateFormat.format(new Date());
        const currentTime = timeFormat.format(new Date());

        // const usersSnapshot = await database().ref('Users').child(opponentAuthUserId).once('value');
        // const opponentName = await usersSnapshot.child('name').val();
        const databaseRef = database().ref('Users').child(myAuthUserId).child('notifications');
        if (remoteMessage.data.notificationType === 'postNotification') {
            try {
                const primaryKey = String(Math.floor(new Date().getTime() / 1000));
                await databaseRef.child(primaryKey).child('notifiedDate').set(currentDate);
                await databaseRef.child(primaryKey).child('notifiedTime').set(currentTime);
                await databaseRef.child(primaryKey).child('notificationType').set(remoteMessage.data.notificationType);
                await databaseRef.child(primaryKey).child('postId').set(remoteMessage.data.postId);
            } catch (error) {
                console.log(error);
            }
        }
        if (remoteMessage.data.notificationType === 'solutionNotification') {
            try {
                const primaryKey = String(Math.floor(new Date().getTime() / 1000));
                await databaseRef.child(primaryKey).child('notifiedDate').set(currentDate);
                await databaseRef.child(primaryKey).child('notifiedTime').set(currentTime);
                await databaseRef.child(primaryKey).child('notificationType').set(remoteMessage.data.notificationType);
                await databaseRef.child(primaryKey).child('postId').set(remoteMessage.data.postId);
                await databaseRef.child(primaryKey).child('solutionId').set(remoteMessage.data.solutionId);

            } catch (error) {
                console.log(error);
            }
        } else {
            console.log(remoteMessage.data)
        }
    }

})
AppRegistry.registerComponent(appName, () => App);