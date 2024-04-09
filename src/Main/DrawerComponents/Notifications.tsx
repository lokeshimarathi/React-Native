import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  FlatList,
  PermissionsAndroid,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import * as Animatable from 'react-native-animatable';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {RootStackParamList} from '../../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
type NotificationProps = NativeStackScreenProps<
  RootStackParamList,
  'Notifications'
>;
const Notifications = ({navigation}: NotificationProps) => {
  useEffect(() => {
    const requests = async () => {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission Required',
          message: 'Cool Discover App needs send notifications ',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
    };
    requests();
  }, []);
  const [hasNotifications, setHasNotifications] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const light = useColorScheme() === 'light';
  useEffect(() => {
    const user = auth().currentUser;
    const myAuthUserId = user?.uid;

    const databaseRef = database()
      .ref('Users')
      .child(String(myAuthUserId))
      .child('notifications');

    databaseRef.on('value', async snapshot => {
      const getNotifications = [];
      const notificationData = await snapshot.val();
      for (const notificationKey in notificationData) {
        const notificationValue = notificationData[notificationKey];
        if (
          typeof notificationValue === 'object' &&
          notificationValue !== null
        ) {
          const notificationType = notificationValue.notificationType;

          const notifiedDate = notificationValue.notifiedDate;
          const notifiedTime = notificationValue.notifiedTime;
          const postId = notificationValue.postId;

          const postSnapshot = await database()
            .ref('Posts')
            .child(postId)
            .once('value');
          const postData = await postSnapshot.val();
          const problemDescription = await postData.problemDescription;
          const postTime = await postData.time;
          const postDate = await postData.date;
          const authUserId = await postData.authUserId;

          if (notificationType === 'solutionNotification') {
            const solutionId = notificationValue.solutionId;

            const solutionSnapshot = await database()
              .ref('Posts')
              .child(postId)
              .child('solutions')
              .child(solutionId)
              .once('value');
            const solutionDescription = await solutionSnapshot
              .child('solutionDescription')
              .val();

            const solutionAuthUserId = await solutionSnapshot
              .child('authUserId')
              .val();
            const solutionDate = await solutionSnapshot.child('date').val();
            const solutionTime = await solutionSnapshot.child('time').val();

            const solutionUserSnapshot = await database()
              .ref('Users')
              .child(solutionAuthUserId)
              .once('value');
            const solutionUsersData = await solutionUserSnapshot.val();
            const solutionUserName = await solutionUsersData.name;

            const solutionUserProfileImage =
              await solutionUsersData.profileImage;

            getNotifications.push({
              notificationId: notificationKey,
              notificationType: notificationType,
              solutionUserName: solutionUserName,
              solutionUserProfileImage:
                solutionUserProfileImage ||
                'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg',
              postId: postId,
              problemDescription: problemDescription,
              solutionDate: solutionDate,
              solutionTime: solutionTime,
              notifiedDate: notifiedDate,
              notifiedTime: notifiedTime,
              solutionDescription: solutionDescription,
            });
          } else {
            const postUserSnapshot = await database()
              .ref('Users')
              .child(authUserId)
              .once('value');
            const postUserName = await postUserSnapshot.child('name').val();
            const postUserProfileImage = await postUserSnapshot
              .child('profileImage')
              .val();
            getNotifications.push({
              notificationId: notificationKey,
              notificationType: notificationType,
              postId: postId,
              problemDescription: problemDescription,
              postDate: postDate,
              postTime: postTime,
              notifiedDate: notifiedDate,
              notifiedTime: notifiedTime,
              postUserName: postUserName,
              postUserProfileImage:
                postUserProfileImage ||
                'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg',
            });
          }
          setHasNotifications(true);
          setNotifications(
            getNotifications
              .filter(notification => notification !== null)
              .reverse(),
          );
        } else {
          return null;
        }
      }
    });
    return () => databaseRef.off();
  }, []);

  return (
    <View
      style={
        light
          ? styles.NotificationsContainerLight
          : styles.NotificationsContainerDark
      }>
      <StatusBar
        barStyle={light ? 'dark-content' : 'light-content'}
        backgroundColor={light ? '#FFFFFF' : '#000000'}
      />
      <View style={styles.headerContainer}>
        <Text style={light ? styles.textLight : styles.textDark}>
          Notifications
        </Text>
      </View>
      <View style={styles.MainContainer}>
        {!hasNotifications ? (
          <View>
            <Animatable.Image
              animation="pulse"
              iterationCount={1}
              direction="reverse"
              source={require('../../images/NotificationsLogo.png')}
              style={styles.NotificationsLogo}
            />
            <Text
              style={light ? styles.HeaderTextLight : styles.HeaderTextDark}>
              Currently, there are no notifications!
            </Text>
            <Text
              style={
                light ? styles.DescriptionTextLight : styles.DescriptionTextDark
              }>
              If you receive any notifications,
            </Text>
            <Text
              style={
                light ? styles.DescriptionTextLight : styles.DescriptionTextDark
              }>
              you will be notified and they will be stored here.
            </Text>
          </View>
        ) : (
          <FlatList
            style={{
              flex: 1,
            }}
            data={notifications}
            keyExtractor={item => item.notificationId}
            renderItem={({item}) => {
              return (
                <View
                  style={{
                    width: Dimensions.get('screen').width - 10,
                    // alignSelf: 'center',
                    marginBottom: 20,
                  }}>
                  <Text
                    style={
                      light ? styles.DateTimeTextLight : styles.DateTimeTextDark
                    }>
                    {item.notifiedDate}
                  </Text>
                  <Text
                    style={
                      light
                        ? [
                            styles.DescriptionTextLight,
                            {
                              backgroundColor: '#dedede',
                              paddingHorizontal: 10,
                              borderRadius: 14,
                              paddingVertical: 5,
                            },
                          ]
                        : [
                            styles.DescriptionTextDark,
                            {
                              marginTop: 10,
                              backgroundColor: '#222831',
                              paddingHorizontal: 10,
                              borderRadius: 14,
                              paddingVertical: 5,
                            },
                          ]
                    }>
                    {item.notifiedTime}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.push('PostView', {postId: item.postId});
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 10,
                    }}>
                    <Image
                      source={{
                        uri:
                          item.notificationType === 'solutionNotification'
                            ? item.solutionUserProfileImage
                            : item.postUserProfileImage,
                      }}
                      style={{
                        marginTop: 10,
                        height: 60,
                        width: 60,
                        borderRadius: 60 / 2,
                        resizeMode: 'cover',
                      }}
                    />
                    <View>
                      <View
                        style={{
                          flexDirection: 'row',
                        }}>
                        <Text
                          style={[
                            light
                              ? styles.DateTimeTextLight
                              : styles.DateTimeTextDark,
                            {
                              fontWeight: 'bold',
                              marginLeft: 10,
                              textAlignVertical: 'top',
                              fontSize: 16,
                            },
                          ]}>
                          {item.notificationType === 'solutionNotification'
                            ? `${item.solutionUserName}, `
                            : `${item.postUserName}, `}
                        </Text>
                        <Text
                          style={
                            light
                              ? styles.DateTimeTextLight
                              : styles.DateTimeTextDark
                          }>
                          posted{' '}
                          {item.notificationType === 'solutionNotification'
                            ? `solution for your `
                            : `problem`}
                        </Text>
                      </View>
                      <Text
                        style={[
                          light
                            ? styles.DateTimeTextLight
                            : styles.DateTimeTextDark,
                          {
                            marginLeft: 10,
                          },
                        ]}>
                        Problem: {item.problemDescription}
                      </Text>
                      <Text
                        style={[
                          light
                            ? styles.DateTimeTextLight
                            : styles.DateTimeTextDark,
                          {
                            marginLeft: 10,
                          },
                        ]}>
                        On:{' '}
                        {item.notificationType === 'solutionNotification'
                          ? `${item.solutionDate}, ${item.solutionTime}`
                          : `${item.postDate}, ${item.postTime}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  NotificationsContainerLight: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  NotificationsContainerDark: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    width: Dimensions.get('window').width,
  },
  logo: {
    height: 30,
    width: 30,
    marginEnd: 10,
  },
  textLight: {
    color: '#000000',
    fontSize: 26,
    fontWeight: 'bold',
    marginEnd: 'auto',
  },
  textDark: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginEnd: 'auto',
  },
  MainContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    flexDirection: 'column',
    marginTop: 'auto',
    marginBottom: 'auto',
    paddingTop: 30,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
  },
  NotificationsLogo: {
    alignSelf: 'center',
    height: 250,
    width: 250,
  },
  HeaderTextLight: {
    marginTop: 20,
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    alignSelf: 'center',
  },

  HeaderTextDark: {
    marginTop: 20,
    color: '#DADBDD',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    alignSelf: 'center',
  },
  DescriptionTextLight: {
    color: '#121212',

    textAlign: 'center',
    alignSelf: 'center',
  },
  DescriptionTextDark: {
    color: '#DADBDD',

    textAlign: 'center',
    alignSelf: 'center',
  },
  DateTimeTextLight: {
    color: '#121212',
  },
  DateTimeTextDark: {
    color: '#DADBDD',
  },
});
