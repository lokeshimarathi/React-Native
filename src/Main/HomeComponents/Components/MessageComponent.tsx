import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Touchable,
  TouchableOpacity,
  View,
  useColorScheme,
  FlatList,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {RootStackParamList} from '../../../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';
import {ActivityIndicator} from 'react-native-paper';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import PlayIcon from 'react-native-vector-icons/MaterialIcons';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import {DataSnapshot} from 'firebase/database';
import Video from 'react-native-video';
import axios from 'axios';
type MessageComponentProps = NativeStackScreenProps<
  RootStackParamList,
  'MessageComponent'
>;
const MessageComponent = ({navigation, route}: MessageComponentProps) => {
  const opponentAuthUserId: string = route.params.recieverAuthUserId;
  const light = useColorScheme() === 'light';

  const [opponentActivityLog, setOpponentActivityLog] =
    useState<string>('last seen');
  const [messages, setMessages] = useState<any[]>();
  const [myMessageText, setMyMessageText] = useState<string>();
  const [activityIndicatorVisibility, setActivityIndicatorVisibility] =
    useState<boolean>(false);
  const [opponentUserDetails, setOpponentUserDetails] = useState<{
    profileImage?: string;
    name: string;
    isOnline: boolean;
    lastActiveDate: string;
    lastActiveTime: string;
  }>();
  const [tempMyMessageText, setTempMyMessageText] = useState<string>();
  const [myProfileImage, setMyProfileImage] = useState<string>(
    'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg',
  );
  const [myMessageTextValue, setMyMessageTextValue] = useState<string>();
  const [opponentActivityLogCopy, setOpponentActivityLogCopy] =
    useState<string>();
  const [myUserIdInDatabase, setMyUserIdInDatabase] = useState<string>();
  useEffect(() => {
    const fetchMyDetails = async () => {
      const user = auth().currentUser;
      if (user) {
        const myAuthUserId = user.uid;

        const snapshot = await database()
          .ref(`Users/${myAuthUserId}/`)
          .once('value');
        const data = await snapshot.child('profileImage').val();
        if (data) {
          setMyProfileImage(data);
        }
      }
    };
    fetchMyDetails();
  }, []);
  const handleMyMessageAttachMedia = async () => {
    const myMediaOption: ImageLibraryOptions = {
      mediaType: 'mixed',
      maxHeight: 900,
      maxWidth: 900,
      quality: 0.8,
      videoQuality: 'high',
    };
    const result = await launchImageLibrary(myMediaOption);
    if (!result.didCancel && !result.errorCode) {
      const firstAsset = result.assets?.[0];
      if (firstAsset) {
        const myMedia = firstAsset.uri;
        var myMediaType: 'image' | 'video';
        const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg)$/i;
        if (imageExtensions.test(String(firstAsset.uri))) {
          myMediaType = 'image';
        } else {
          myMediaType = 'video';
        }

        navigation.push('AppCamera', {
          opponentAuthUserId: opponentAuthUserId,
          myMedia: String(myMedia),
          myMediaType: myMediaType,
        });
      }
    }
  };
  useEffect(() => {
    setActivityIndicatorVisibility(true);
    const databaseRef = database().ref(`Users/${opponentAuthUserId}/`);
    databaseRef.on('value', async opponentUserSnapshot => {
      const opponentUserDetails = await opponentUserSnapshot.val();
      setOpponentUserDetails({
        profileImage:
          opponentUserDetails.profileImage ||
          'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg',
        name: opponentUserDetails.name || 'User',
        isOnline: opponentUserDetails.onlineStatus.isOnline,
        lastActiveDate: opponentUserDetails.onlineStatus.lastActiveDate,
        lastActiveTime: opponentUserDetails.onlineStatus.lastActiveTime,
      });

      setActivityIndicatorVisibility(false);
    });

    return () => databaseRef.off();
  }, [opponentAuthUserId]);

  useEffect(() => {
    if (opponentUserDetails) {
      if (opponentUserDetails.isOnline) {
        setOpponentActivityLog('Active Now');
      } else {
        const lastActiveDate = opponentUserDetails?.lastActiveDate;
        const lastActiveTime = opponentUserDetails?.lastActiveTime;
        const dateFormat = Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        const timeFormat = Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
        const [lastActiveHours, lastActiveMinutes, lastActiveSeconds] = String(
          lastActiveTime,
        )
          ?.split(':')
          .map(Number);
        const lastActiveTimeStamp =
          (lastActiveHours * 3600 +
            lastActiveMinutes * 60 +
            lastActiveSeconds) *
          1000;
        const currentTime = timeFormat.format(new Date());
        const [currentHour, currentMinute, currentSecond] = currentTime
          .split(':')
          .map(Number);
        const currentTimeStamp =
          (currentHour * 3600 + currentMinute * 60 + currentSecond) * 1000;
        if (lastActiveDate === dateFormat.format(new Date())) {
          const timeDifference = currentTimeStamp - lastActiveTimeStamp;

          if (timeDifference < 3600000) {
            setOpponentActivityLog(
              `Last Active ${String(
                Math.floor(timeDifference / 60000),
              )} minutes ago`,
            );
          } else {
            const lastActiveHour12 = lastActiveHours % 12 || 12;
            const ampm = lastActiveHours > 12 ? 'PM' : 'AM';
            setOpponentActivityLog(
              `Last Active at ${lastActiveHour12}:${lastActiveMinutes} ${ampm}`,
            );
          }
        } else {
          const lastActiveHour12 = lastActiveHours % 12 || 12;
          const ampm = lastActiveHours > 12 ? 'PM' : 'AM';
          const time = `${lastActiveHour12}:${lastActiveMinutes}${ampm}`;
          setOpponentActivityLog(`Last active ${lastActiveDate} at ${time}`);
        }
      }
    }
  }, [opponentUserDetails]);

  useEffect(() => {
    const user = auth().currentUser;
    const myAuthUserId = user?.uid;
    const databaseReference = database().ref(`Messages/`);
    const handleData = async (snapshot: any) => {
      const data = await snapshot.val();
      if (data) {
        Object.keys(data).forEach(async mainKey => {
          const values = data[mainKey];
          if (
            (values.authUserId1 === myAuthUserId &&
              values.authUserId2 === opponentAuthUserId) ||
            (values.authUserId1 === opponentAuthUserId &&
              values.authUserId2 === myAuthUserId)
          ) {
            if (values.authUserId1 === myAuthUserId) {
              setMyUserIdInDatabase('authUserId1');
              try {
                if (values.typing.authUserId2 === true) {
                  setOpponentActivityLog('Typing...');
                } else {
                  if (opponentUserDetails) {
                    if (opponentUserDetails.isOnline) {
                      setOpponentActivityLog('Active Now');
                    } else {
                      const lastActiveDate =
                        opponentUserDetails?.lastActiveDate;
                      const lastActiveTime =
                        opponentUserDetails?.lastActiveTime;
                      const dateFormat = Intl.DateTimeFormat('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      });
                      const timeFormat = Intl.DateTimeFormat('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                      });
                      const [
                        lastActiveHours,
                        lastActiveMinutes,
                        lastActiveSeconds,
                      ] = String(lastActiveTime)?.split(':').map(Number);
                      const lastActiveTimeStamp =
                        (lastActiveHours * 3600 +
                          lastActiveMinutes * 60 +
                          lastActiveSeconds) *
                        1000;
                      const currentTime = timeFormat.format(new Date());
                      const [currentHour, currentMinute, currentSecond] =
                        currentTime.split(':').map(Number);
                      const currentTimeStamp =
                        (currentHour * 3600 +
                          currentMinute * 60 +
                          currentSecond) *
                        1000;
                      if (lastActiveDate === dateFormat.format(new Date())) {
                        const timeDifference =
                          currentTimeStamp - lastActiveTimeStamp;

                        if (timeDifference < 3600000) {
                          setOpponentActivityLog(
                            `Last Active ${String(
                              Math.floor(timeDifference / 60000),
                            )} minutes ago`,
                          );
                        } else {
                          const lastActiveHour12 = lastActiveHours % 12 || 12;
                          const ampm = lastActiveHours > 12 ? 'PM' : 'AM';
                          setOpponentActivityLog(
                            `Last Active at ${lastActiveHour12}:${lastActiveMinutes} ${ampm}`,
                          );
                        }
                      } else {
                        const lastActiveHour12 = lastActiveHours % 12 || 12;
                        const ampm = lastActiveHours > 12 ? 'PM' : 'AM';
                        const time = `${lastActiveHour12}:${lastActiveMinutes}${ampm}`;
                        setOpponentActivityLog(
                          `Last active ${lastActiveDate} at ${time}`,
                        );
                      }
                    }
                  }
                }
              } catch (error) {
                console.log(error);
              }
            } else {
              setMyUserIdInDatabase('authUserId2');
              try {
                if (values.typing.authUserId1 === true) {
                  setOpponentActivityLog('Typing...');
                } else {
                  if (opponentUserDetails) {
                    if (opponentUserDetails.isOnline) {
                      setOpponentActivityLog('Active Now');
                    } else {
                      const lastActiveDate =
                        opponentUserDetails?.lastActiveDate;
                      const lastActiveTime =
                        opponentUserDetails?.lastActiveTime;
                      const dateFormat = Intl.DateTimeFormat('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      });
                      const timeFormat = Intl.DateTimeFormat('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                      });
                      const [
                        lastActiveHours,
                        lastActiveMinutes,
                        lastActiveSeconds,
                      ] = String(lastActiveTime)?.split(':').map(Number);
                      const lastActiveTimeStamp =
                        (lastActiveHours * 3600 +
                          lastActiveMinutes * 60 +
                          lastActiveSeconds) *
                        1000;
                      const currentTime = timeFormat.format(new Date());
                      const [currentHour, currentMinute, currentSecond] =
                        currentTime.split(':').map(Number);
                      const currentTimeStamp =
                        (currentHour * 3600 +
                          currentMinute * 60 +
                          currentSecond) *
                        1000;
                      if (lastActiveDate === dateFormat.format(new Date())) {
                        const timeDifference =
                          currentTimeStamp - lastActiveTimeStamp;

                        if (timeDifference < 3600000) {
                          setOpponentActivityLog(
                            `Last Active ${String(
                              Math.floor(timeDifference / 60000),
                            )} minutes ago`,
                          );
                        } else {
                          const lastActiveHour12 = lastActiveHours % 12 || 12;
                          const ampm = lastActiveHours > 12 ? 'PM' : 'AM';
                          setOpponentActivityLog(
                            `Last Active at ${lastActiveHour12}:${lastActiveMinutes} ${ampm}`,
                          );
                        }
                      } else {
                        const lastActiveHour12 = lastActiveHours % 12 || 12;
                        const ampm = lastActiveHours > 12 ? 'PM' : 'AM';
                        const time = `${lastActiveHour12}:${lastActiveMinutes}${ampm}`;
                        setOpponentActivityLog(
                          `Last active ${lastActiveDate} at ${time}`,
                        );
                      }
                    }
                  }
                }
              } catch (error) {
                console.log(error);
              }
            }
            const messages = await Promise.all(
              Object.entries(values.messages).map(async ([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                  const message = await Promise.all(
                    Object.entries(value).map(([messageKey, messageValue]) => {
                      if (
                        typeof messageValue === 'object' &&
                        messageValue !== null
                      ) {
                        const databaseRef = database().ref(
                          `Messages/${mainKey}/messages/`,
                        );
                        if (messageValue.sender !== myAuthUserId) {
                          databaseRef
                            .child(`${key}/${messageKey}/`)
                            .child('seen')
                            .set('seen');
                        }
                        return {
                          messageKey: messageKey,
                          ...messageValue,
                        };
                      } else {
                        return null;
                      }
                    }),
                  );

                  return {
                    date: key,
                    message: message
                      .filter(message => message !== null)
                      .reverse(),
                  };
                } else {
                  return null;
                }
              }),
            );

            setMessages(
              messages.filter(messages => messages !== null).reverse(),
            );
          }
        });
      }
    };
    databaseReference.on('value', handleData);
    return () => databaseReference.off();
  }, [opponentUserDetails]);

  const sendTextMessage = async () => {
    const dateFormat = Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeFormat = Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    let currentDate = dateFormat.format(new Date());
    const modifiedDate = currentDate.split('/');
    currentDate = modifiedDate.join('-');
    const currentTime = timeFormat.format(new Date());
    const user = auth().currentUser;
    const myAuthUserId = user?.uid;

    const messagePrimaryKey = messagePrimaryKeyGenerating(
      String(myAuthUserId),
      opponentAuthUserId,
    );

    const primaryKey = `${Math.floor(
      new Date().getTime() / 1000,
    )}${myAuthUserId}`;

    try {
      const snapshot = database().ref(`Messages/${messagePrimaryKey}/`);
      if (String(myAuthUserId).localeCompare(opponentAuthUserId) < 0) {
        await snapshot.child('authUserId1').set(myAuthUserId);
        await snapshot.child('authUserId2').set(opponentAuthUserId);
      } else {
        await snapshot.child('authUserId1').set(opponentAuthUserId);
        await snapshot.child('authUserId2').set(myAuthUserId);
      }
      await snapshot.child('lastMessage').set(primaryKey);
      await snapshot
        .child('messages')
        .child(currentDate)
        .child(primaryKey)
        .child('sender')
        .set(myAuthUserId);
      await snapshot
        .child('messages')
        .child(currentDate)
        .child(primaryKey)
        .child('time')
        .set(currentTime);
      await snapshot
        .child('messages')
        .child(currentDate)
        .child(primaryKey)
        .child('seen')
        .set('notSeen');
      await snapshot
        .child('messages')
        .child(currentDate)
        .child(primaryKey)
        .child('status')
        .set('notDeleted');

      if (myMessageText) {
        await snapshot
          .child('messages')
          .child(currentDate)
          .child(primaryKey)
          .child('messageText')
          .set(myMessageText)
          .then(() => {
            sendNotifications(myMessageText, primaryKey);
          });
      }

      setMyMessageText('');
      setTempMyMessageText('');
    } catch (error) {
      //console.log(error);
      Alert.alert('Error, please try again..');
    }
  };
  const messagePrimaryKeyGenerating = (
    authUserId1: string,
    authUserId2: string,
  ) => {
    const concatenatedIds: string =
      authUserId1.localeCompare(authUserId2) < 0
        ? `${authUserId1}${authUserId2}`
        : `${authUserId2}${authUserId1}`;

    return concatenatedIds.toLowerCase();
  };

  const sendNotifications = async (
    myMessageText: string,
    messageId: string,
  ) => {
    const user = auth().currentUser;
    if (user) {
      const myAuthUserId = user.uid;
      const userSnapshot = await database()
        .ref('Users')
        .child(myAuthUserId)
        .once('value');
      const name = userSnapshot.child('name').val();
      const dateFormat = Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const timeFormat = Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const currentDate = dateFormat.format(new Date());
      const currentTime = timeFormat.format(new Date());
      const tokenSnapshot = await database()
        .ref('Users')
        .child(opponentAuthUserId)
        .child('token')
        .once('value');
      const token = await tokenSnapshot.val();
      if (token) {
        const data = {
          data: {
            messageId: messageId,
            date: currentDate,
            time: currentTime,
            relatedPage: 'Messages',
            notificationType: 'messageNotification',
          },
          notification: {
            title: 'Message',
            body: `${name}\n${myMessageText}\n${currentTime} ${currentTime}`,
          },
          to: token,
        };
        const config = {
          method: 'post',
          url: 'https://fcm.googleapis.com/fcm/send',
          headers: {
            Authorization:
              'key=AAAAnDulfMk:APA91bFWt2aL3U9f3MADXvyNGKRJQli9wPJepaXrv2eZDNCkkm7jJF1VxRZopRRGSa-vpffG2G4naBF0bqOCZdzkSWA2ZpKh6gaAlr-RppzEr9CIR_LgynXqk112piXOXzp8sYcL4Z8b',
            'Content-Type': 'application/json',
          },
          data: JSON.stringify(data),
        };
        const response = await axios(config);
        console.log(JSON.stringify(response.data));
      }
    }
  };

  const handleDeleteForEveryone = async (messageKey: string) => {
    const user = auth().currentUser;
    if (user) {
      const myAuthUserId = user.uid;
      const databaseRef = database().ref('Messages/');
      const handleChange = async (snapshot: any) => {
        const data = await snapshot.val();
        if (data) {
          Object.keys(data).forEach(async key => {
            const values = await data[key];

            if (
              (values.authUserId1 === myAuthUserId &&
                values.authUserId2 === opponentAuthUserId) ||
              (values.authUserId1 === opponentAuthUserId &&
                values.authUserId2 === myAuthUserId)
            ) {
              databaseRef.child(`${key}/messages/`).once('value', snapshot => {
                const data = snapshot.val();
                Object.keys(data).forEach(nKey => {
                  const values = data[nKey];
                  Object.keys(values).forEach(mKey => {
                    const myValues = values[mKey];
                    if (mKey === messageKey) {
                      const databaseRef = database().ref(
                        `Messages/${key}/messages/${nKey}/${mKey}/`,
                      );
                      databaseRef.child('status').set('deleted');
                    }
                  });
                });
              });
            }
          });
        }
      };

      databaseRef.on('value', handleChange);
    }
  };

  const handleDeleteAlert = (messageKey: string) => {
    Alert.alert(
      'Delete message',
      'You want to delete for evryone?',
      [
        {
          text: 'Yes',
          onPress: () => handleDeleteForEveryone(messageKey),
        },
      ],
      {cancelable: true},
    );
  };

  useEffect(() => {
    if (myMessageText) {
      const user = auth().currentUser;
      if (user) {
        const myAuthUserId = user.uid;
        const databaseRef = database().ref(`Messages/`);
        databaseRef.once('value', snapshot => {
          const data = snapshot.val();
          Object.keys(data).forEach(key => {
            const values = data[key];
            if (
              (values.authUserId1 === myAuthUserId &&
                values.authUserId2 === opponentAuthUserId) ||
              (values.authUserId1 === opponentAuthUserId &&
                values.authUserId2 === myAuthUserId)
            ) {
              if (myUserIdInDatabase === 'authUserId1') {
                databaseRef
                  .child(`${key}`)
                  .child('typing')
                  .child('authUserId1')
                  .set(true);
              } else {
                databaseRef
                  .child(`${key}`)
                  .child('typing')
                  .child('authUserId2')
                  .set(true);
              }
            }
          });
        });
      }
    } else {
      const user = auth().currentUser;
      if (user) {
        const myAuthUserId = user.uid;
        const databaseRef = database().ref(`Messages/`);
        databaseRef.once('value', snapshot => {
          const data = snapshot.val();
          Object.keys(data).forEach(key => {
            const values = data[key];
            if (
              (values.authUserId1 === myAuthUserId &&
                values.authUserId2 === opponentAuthUserId) ||
              (values.authUserId1 === opponentAuthUserId &&
                values.authUserId2 === myAuthUserId)
            ) {
              if (myUserIdInDatabase === 'authUserId1') {
                databaseRef
                  .child(`${key}`)
                  .child('typing')
                  .child('authUserId1')
                  .set(false);
              } else {
                databaseRef
                  .child(`${key}`)
                  .child('typing')
                  .child('authUserId2')
                  .set(false);
              }
            }
          });
        });
      }
    }
  }, [myMessageText]);
  const flatListRef = useRef<FlatList>(null);
  useEffect(() => {
    if (flatListRef.current !== null) {
      flatListRef.current.scrollToEnd();
    }
  }, [messages]);

  return (
    <View
      style={
        light ? styles.MessageComponentLight : styles.MessageComponentDark
      }>
      <StatusBar
        backgroundColor={light ? '#F5F7F8' : '#31363F'}
        barStyle={light ? 'dark-content' : 'light-content'}
      />
      <SafeAreaView>
        <View
          style={
            light ? styles.OpponentDetailsLight : styles.OpponentDetailsDark
          }>
          <TouchableOpacity
            onPress={() => {
              navigation.pop();
            }}>
            <Icon
              name="arrow-back"
              size={30}
              color={light ? '#000000' : '#FFFFFF'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.OpponentDetails}>
            <Image
              source={{
                uri: opponentUserDetails?.profileImage
                  ? opponentUserDetails?.profileImage
                  : 'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg',
              }}
              style={styles.OpponentProfileImage}
            />
            <View style={styles.OpponentNameAndActiveStatus}>
              <Text
                style={
                  light ? styles.OpponentNameLight : styles.OpponentNameDark
                }>
                {opponentUserDetails?.name}
              </Text>
              <Text style={styles.ActiveLogTextLight}>
                {opponentActivityLog}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <View style={styles.Messages}>
        {activityIndicatorVisibility ? (
          <View style={styles.StartMessageContainer}>
            <Text
              style={
                light ? styles.DescriptionTextLight : styles.DescriptionTextDark
              }>
              Loading messages..
            </Text>
            <ActivityIndicator
              size={25}
              color={light ? '#35374B' : '#FFFFFF'}
              style={{alignSelf: 'center', marginTop: 20}}
            />
          </View>
        ) : messages ? (
          <View>
            <View style={styles.MessageContainer}>
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.date}
                renderItem={({item}) => (
                  <View>
                    <Text
                      style={[
                        light
                          ? styles.DescriptionTextLight
                          : styles.DescriptionTextDark,
                        {
                          backgroundColor: light ? '#F5F7F8' : '#31363F',
                          alignSelf: 'center',
                          padding: 5,
                          borderRadius: 14,
                          opacity: 0.8,
                          paddingHorizontal: 10,
                        },
                      ]}>
                      {item?.date}
                    </Text>
                    <FlatList
                      data={item.message}
                      keyExtractor={item => item.messageKey}
                      renderItem={({item}) => (
                        <View
                          style={{
                            width: Dimensions.get('screen').width,
                            //backgroundColor: '#FF0000',
                            marginTop: 10,
                          }}>
                          {item.sender === opponentAuthUserId ? (
                            <>
                              <TouchableOpacity
                                style={styles.OpponentMessageContainer}>
                                {item.status === 'notDeleted' ? (
                                  <View
                                    style={{
                                      backgroundColor: light
                                        ? '#F5F7F8'
                                        : '#35374B',
                                      padding: 10,
                                      marginTop: 5,
                                      marginLeft: '5%',
                                      maxWidth: '80%',
                                      alignSelf: 'flex-start',
                                      borderRadius: 20,
                                    }}>
                                    {item.media ? (
                                      <View>
                                        {item.mediaType === 'image' ? (
                                          <TouchableOpacity
                                            onPress={() => {
                                              navigation.push('MediaView', {
                                                media: item.media,
                                                mediaType: item.mediaType,
                                              });
                                            }}>
                                            <Image
                                              source={{
                                                uri: item.media,
                                              }}
                                              style={{
                                                height: 200,
                                                width: 200,
                                                borderRadius: 7,
                                                marginLeft: 10,
                                                alignSelf: 'center',
                                                marginBottom: 10,
                                              }}
                                            />
                                          </TouchableOpacity>
                                        ) : (
                                          <View>
                                            <Video
                                              source={{uri: item.media}}
                                              style={{
                                                height: 200,
                                                width: 200,
                                                borderRadius: 7,
                                                marginLeft: 10,
                                                alignSelf: 'center',
                                                marginBottom: 10,
                                                backgroundColor: '#000000',
                                              }}
                                              resizeMode="contain"
                                              paused={true}></Video>
                                            <TouchableOpacity
                                              onPress={() => {
                                                navigation.push('MediaView', {
                                                  media: item.media,
                                                  mediaType: item.mediaType,
                                                });
                                              }}
                                              style={{
                                                height: 200,
                                                width: 200,
                                                borderRadius: 7,
                                                marginLeft: 10,
                                                alignSelf: 'center',
                                                marginBottom: 10,
                                                position: 'absolute',

                                                alignItems: 'center',
                                                justifyContent: 'center',
                                              }}>
                                              <View
                                                style={{
                                                  borderRadius: 50,
                                                  backgroundColor:
                                                    'rgba(0,0,0,0.2)',
                                                  padding: 10,
                                                  alignSelf: 'center',
                                                  justifyContent: 'center',
                                                  alignItems: 'center',
                                                }}>
                                                <PlayIcon
                                                  color={'#FFFFFF'}
                                                  name={'play-arrow'}
                                                  size={25}
                                                />
                                              </View>
                                            </TouchableOpacity>
                                          </View>
                                        )}
                                      </View>
                                    ) : (
                                      <></>
                                    )}
                                    <View>
                                      <Text
                                        style={{
                                          color: light ? '#000000' : '#FFFFFF',
                                          fontWeight: '500',
                                        }}>
                                        {item.messageText}
                                      </Text>
                                    </View>
                                    <View
                                      style={[
                                        styles.leftArrow,
                                        {
                                          backgroundColor: light
                                            ? '#F5F7F8'
                                            : '#35374B',
                                        },
                                      ]}></View>
                                    <View
                                      style={[
                                        styles.leftArrowOverlap,
                                        {
                                          backgroundColor: light
                                            ? '#FFFFFF'
                                            : '#000000',
                                        },
                                      ]}>
                                      <Image
                                        source={{
                                          uri: opponentUserDetails?.profileImage,
                                        }}
                                        style={[
                                          styles.OpponentProfileImage,
                                          {
                                            height: 25,
                                            width: 25,
                                            borderRadius: 25 / 2,
                                            position: 'absolute',
                                            bottom: 3,
                                            right: -30,
                                            marginRight: 35,
                                          },
                                        ]}
                                      />
                                    </View>
                                  </View>
                                ) : (
                                  <View
                                    style={{
                                      backgroundColor: light
                                        ? '#F5F7F8'
                                        : '#31363F',
                                      padding: 10,
                                      marginTop: 5,
                                      marginLeft: '5%',
                                      maxWidth: '80%',
                                      alignSelf: 'flex-start',
                                      borderRadius: 20,
                                    }}>
                                    <View>
                                      <Text
                                        style={{
                                          color: light ? '#000000' : '#FFFFFF',
                                          fontWeight: '500',
                                        }}>
                                        This message was deleted
                                      </Text>
                                    </View>
                                    <View
                                      style={[
                                        styles.leftArrow,
                                        {
                                          backgroundColor: light
                                            ? '#F5F7F8'
                                            : '#31363F',
                                        },
                                      ]}></View>
                                    <View
                                      style={[
                                        styles.leftArrowOverlap,
                                        {
                                          backgroundColor: light
                                            ? '#FFFFFF'
                                            : '#000000',
                                        },
                                      ]}>
                                      <Image
                                        source={{
                                          uri: opponentUserDetails?.profileImage,
                                        }}
                                        style={[
                                          styles.OpponentProfileImage,
                                          {
                                            height: 25,
                                            width: 25,
                                            borderRadius: 25 / 2,
                                            position: 'absolute',
                                            bottom: 3,
                                            right: -30,
                                            marginRight: 35,
                                          },
                                        ]}
                                      />
                                    </View>
                                  </View>
                                )}
                              </TouchableOpacity>

                              <View
                                style={[
                                  styles.MessageStatus,
                                  {justifyContent: 'flex-start'},
                                ]}>
                                <Text
                                  style={
                                    light
                                      ? styles.MessageStatusTextLight
                                      : styles.MessageStatusTextDark
                                  }>
                                  {item.time}
                                </Text>
                              </View>
                            </>
                          ) : (
                            <>
                              <TouchableOpacity
                                onLongPress={() => {
                                  if (item.status === 'notDeleted') {
                                    handleDeleteAlert(item.messageKey);
                                  }
                                }}
                                style={styles.MyMessageContainer}>
                                {item.status === 'notDeleted' ? (
                                  <View
                                    style={{
                                      backgroundColor: '#40A2E3',
                                      padding: 10,
                                      marginTop: 5,

                                      maxWidth: '80%',
                                      alignSelf: 'flex-end',
                                      borderRadius: 20,
                                    }}>
                                    {item.media ? (
                                      <View>
                                        {item.mediaType === 'image' ? (
                                          <TouchableOpacity
                                            onPress={() => {
                                              navigation.push('MediaView', {
                                                media: item.media,
                                                mediaType: item.mediaType,
                                              });
                                            }}>
                                            <Image
                                              source={{
                                                uri: item.media,
                                              }}
                                              style={{
                                                height: 200,
                                                width: 200,
                                                borderRadius: 7,
                                                marginLeft: 10,
                                                alignSelf: 'center',
                                                marginBottom: 10,
                                              }}
                                            />
                                          </TouchableOpacity>
                                        ) : (
                                          <View>
                                            <Video
                                              source={{uri: item.media}}
                                              style={{
                                                height: 200,
                                                width: 200,
                                                borderRadius: 7,
                                                marginLeft: 10,
                                                alignSelf: 'center',
                                                marginBottom: 10,
                                                backgroundColor: '#000000',
                                              }}
                                              resizeMode="contain"
                                              paused={true}></Video>
                                            <TouchableOpacity
                                              onPress={() => {
                                                navigation.push('MediaView', {
                                                  media: item.media,
                                                  mediaType: item.mediaType,
                                                });
                                              }}
                                              style={{
                                                height: 200,
                                                width: 200,
                                                borderRadius: 7,
                                                marginLeft: 10,
                                                alignSelf: 'center',
                                                marginBottom: 10,
                                                position: 'absolute',

                                                alignItems: 'center',
                                                justifyContent: 'center',
                                              }}>
                                              <View
                                                style={{
                                                  borderRadius: 50,
                                                  backgroundColor:
                                                    'rgba(0,0,0,0.2)',
                                                  padding: 10,
                                                  alignSelf: 'center',
                                                  justifyContent: 'center',
                                                  alignItems: 'center',
                                                }}>
                                                <PlayIcon
                                                  color={'#FFFFFF'}
                                                  name={'play-arrow'}
                                                  size={25}
                                                />
                                              </View>
                                            </TouchableOpacity>
                                          </View>
                                        )}
                                      </View>
                                    ) : (
                                      <></>
                                    )}
                                    <View
                                      style={{
                                        backgroundColor: '#40A2E3',
                                      }}>
                                      <Text
                                        style={{
                                          color: light ? '#FFFFFF' : '#FFFFFF',
                                          fontWeight: '500',
                                        }}>
                                        {item.messageText}
                                      </Text>
                                    </View>
                                    <View style={styles.rightArrow}></View>
                                    <View
                                      style={[
                                        styles.rightArrowOverlap,
                                        {
                                          backgroundColor: light
                                            ? '#FFFFFF'
                                            : '#000000',
                                        },
                                      ]}></View>
                                    <Image
                                      source={{uri: myProfileImage}}
                                      style={[
                                        styles.OpponentProfileImage,
                                        {
                                          height: 25,
                                          width: 25,
                                          borderRadius: 25 / 2,
                                          position: 'absolute',
                                          bottom: -2,
                                          right: -30,
                                          marginLeft: 20,
                                        },
                                      ]}
                                    />
                                  </View>
                                ) : (
                                  <View
                                    style={{
                                      backgroundColor: '#40A2E3',
                                      padding: 10,
                                      marginTop: 5,

                                      maxWidth: '80%',
                                      alignSelf: 'flex-end',
                                      borderRadius: 20,
                                    }}>
                                    <View
                                      style={{
                                        backgroundColor: '#40A2E3',
                                      }}>
                                      <Text
                                        style={{
                                          color: light ? '#35374B' : '#35374B',
                                          fontWeight: '500',
                                        }}>
                                        This message was deleted
                                      </Text>
                                    </View>
                                    <View style={styles.rightArrow}></View>
                                    <View
                                      style={[
                                        styles.rightArrowOverlap,
                                        {
                                          backgroundColor: light
                                            ? '#FFFFFF'
                                            : '#000000',
                                        },
                                      ]}></View>
                                    <Image
                                      source={{uri: myProfileImage}}
                                      style={[
                                        styles.OpponentProfileImage,
                                        {
                                          height: 25,
                                          width: 25,
                                          borderRadius: 25 / 2,
                                          position: 'absolute',
                                          bottom: -2,
                                          right: -30,
                                          marginLeft: 20,
                                        },
                                      ]}
                                    />
                                  </View>
                                )}
                              </TouchableOpacity>

                              <View style={styles.MessageStatus}>
                                <Text
                                  style={
                                    light
                                      ? styles.MessageStatusTextLight
                                      : styles.MessageStatusTextDark
                                  }>
                                  {item?.time}
                                </Text>
                                <Text
                                  style={
                                    light
                                      ? styles.MessageStatusTextLight
                                      : styles.MessageStatusTextDark
                                  }>
                                  {item.seen === 'notSeen'
                                    ? 'sent'
                                    : 'received'}
                                </Text>
                              </View>
                            </>
                          )}
                        </View>
                      )}
                    />
                  </View>
                )}
              />
            </View>
          </View>
        ) : (
          !myMessageText && (
            <Animatable.View
              animation={'slideInUp'}
              style={styles.StartMessageContainer}>
              <Image
                source={require('../../../images/NewMessageStartIcon.png')}
                style={styles.NewMessageStartLogo}
              />
              <Text
                style={
                  light ? styles.DescriptionTextLight : styles.HeaderTextDark
                }>
                Begin your conversation now..!
              </Text>
            </Animatable.View>
          )
        )}
      </View>

      <View style={styles.MessageSending}>
        <View style={styles.MyMessage}>
          <View
            style={
              light
                ? styles.MessageDescriptionLight
                : styles.MessageDescriptionDark
            }>
            <TextInput
              value={tempMyMessageText}
              onChangeText={e => {
                setMyMessageText(e.replace(/\s+$/, ''));
                setTempMyMessageText(e);
              }}
              placeholder="Type here..."
              placeholderTextColor={light ? '#35374B' : '#FFFFFF'}
              keyboardType={'ascii-capable'}
              style={
                light ? styles.MyMessageInputLight : styles.MyMessageInputDark
              }></TextInput>
            <TouchableOpacity
              onPress={() => {
                navigation.push('AppCamera', {
                  opponentAuthUserId: opponentAuthUserId,
                });
              }}>
              <View
                style={{
                  borderRadius: 15,
                  backgroundColor: light ? '#FFFFFF' : '#31363F',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 30,
                  width: 30,
                  marginRight: 10,
                }}>
                <Icon
                  name="camera"
                  size={20}
                  color={light ? '#000000' : '#FFFFFF'}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleMyMessageAttachMedia}>
              <View
                style={{
                  borderRadius: 15,
                  backgroundColor: light ? '#FFFFFF' : '#31363F',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 30,
                  width: 30,
                }}>
                <Icon
                  name="add"
                  size={20}
                  color={light ? '#000000' : '#FFFFFF'}
                />
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={sendTextMessage}>
            <Icon name="send" size={30} color={light ? '#000000' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MessageComponent;

const styles = StyleSheet.create({
  MessageComponentLight: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  MessageComponentDark: {
    flex: 1,
    backgroundColor: '#000000',
  },
  OpponentDetailsLight: {
    backgroundColor: '#F5F7F8',
    height: 70,
    width: Dimensions.get('screen').width,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  OpponentDetailsDark: {
    backgroundColor: '#31363F',
    height: 70,
    width: Dimensions.get('screen').width,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  OpponentDetails: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  OpponentProfileImage: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  OpponentNameLight: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',

    textAlignVertical: 'center',
    verticalAlign: 'middle',
  },

  OpponentNameDark: {
    color: '#DADBDD',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',

    textAlignVertical: 'center',
    verticalAlign: 'middle',
  },
  ActiveLogTextLight: {
    color: '#40A2E3',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 10,
  },

  OpponentNameAndActiveStatus: {
    // justifyContent: 'flex-start',
    // alignItems: 'flex-start',
    marginHorizontal: 10,
  },
  Messages: {
    flex: 1,
  },
  MessageSending: {
    width: Dimensions.get('screen').width,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  MyMessage: {
    width: Dimensions.get('screen').width - 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
    paddingLeft: 2,
  },
  MessageDescriptionLight: {
    backgroundColor: '#EEF5FF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  MessageDescriptionDark: {
    backgroundColor: '#606470',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  MyMessageInputLight: {
    height: 40,
    width: 230,
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 14,
    paddingRight: 5,
  },
  MyMessageInputDark: {
    height: 40,
    width: 230,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    paddingRight: 5,
  },
  StartMessageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  NewMessageStartLogo: {
    alignSelf: 'center',
    height: 250,
    width: 250,
    resizeMode: 'contain',
  },
  HeaderTextLight: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',

    textAlign: 'center',
    alignSelf: 'center',
  },

  HeaderTextDark: {
    color: '#DADBDD',
    fontSize: 18,
    fontWeight: 'bold',

    textAlign: 'center',
    alignSelf: 'center',
  },
  DescriptionTextLight: {
    color: '#121212',

    textAlign: 'center',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  DescriptionTextDark: {
    color: '#DADBDD',
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
  },
  MessageContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  OpponentMessageContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 20,
    width: Dimensions.get('screen').width,
    alignItems: 'flex-end',
    paddingLeft: 30,
  },
  rightArrow: {
    position: 'absolute',
    backgroundColor: '#40A2E3',
    //backgroundColor:"red",
    width: 20,
    height: 25,
    bottom: 0,
    borderBottomLeftRadius: 25,
    right: -10,
  },

  rightArrowOverlap: {
    position: 'absolute',
    backgroundColor: '#eeeeee',
    //backgroundColor:"green",
    width: 20,
    height: 35,
    bottom: -6,
    borderBottomLeftRadius: 18,
    right: -20,
  },

  /*Arrow head for recevied messages*/
  leftArrow: {
    position: 'absolute',
    backgroundColor: '#F5F7F8',
    //backgroundColor:"red",
    width: 20,
    height: 25,
    bottom: 0,
    borderBottomRightRadius: 25,
    left: -10,
  },

  leftArrowOverlap: {
    position: 'absolute',
    backgroundColor: '#eeeeee',
    //backgroundColor:"green",
    width: 20,
    height: 35,
    bottom: -6,
    borderBottomRightRadius: 18,
    left: -20,
  },
  MyMessageContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,

    width: Dimensions.get('screen').width,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginRight: '20%',
    paddingRight: 50,
    marginBottom: 20,
  },
  MessageStatus: {
    flexDirection: 'row',

    width: Dimensions.get('screen').width,
    paddingHorizontal: 70,
    justifyContent: 'flex-end',
  },
  MessageStatusTextLight: {
    color: '#31363F',
    marginHorizontal: 5,
    fontSize: 10,
  },
  MessageStatusTextDark: {
    color: '#FFFFFF',
    marginHorizontal: 5,
    fontSize: 10,
  },
});
