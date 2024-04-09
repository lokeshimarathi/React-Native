import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  StatusBar,
  Dimensions,
  Image,
  Touchable,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import logo from '../../images/logo.png';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {RootStackParamList} from '../../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
type MessagesProps = NativeStackScreenProps<RootStackParamList, 'Messages'>;
const Messages = ({navigation, route}: MessagesProps) => {
  const light = useColorScheme() === 'light';
  const [activityIndicatorVisibility, setActivityIndicatorVisibility] =
    useState<boolean>(false);
  const [messages, setMessages] = useState<any[]>();
  const [myAuthUserId, setMyAuthUserId] = useState<string>();
  useEffect(() => {
    const interval = setInterval(() => {
      const user = auth().currentUser;
      const myAuthUserId = user?.uid;
      setMyAuthUserId(myAuthUserId);
      const databaseRef = database().ref('Messages/');
      databaseRef.once('value', async snapshot => {
        let messages = [];
        const data: Record<string, any> = snapshot.val(); // Specify type of data

        for (const key in data) {
          const values = data[key];
          if (
            values.authUserId1 === myAuthUserId ||
            values.authUserId2 === myAuthUserId
          ) {
            const lastMessagesKey = values.lastMessage;
            for (const [messagePrimaryKey, messageValue] of Object.entries(
              values.messages,
            )) {
              if (typeof messageValue === 'object' && messageValue !== null) {
                for (const messageKey in messageValue) {
                  if (messageKey === values.lastMessage) {
                    let opponentUserId;
                    if (values.authUserId1 !== myAuthUserId) {
                      opponentUserId = values.authUserId1;
                    } else {
                      opponentUserId = values.authUserId2;
                    }
                    const userSnapshot = await database()
                      .ref('Users')
                      .child(opponentUserId)
                      .once('value');
                    const opponentDetails = userSnapshot.val();
                    const messageSnapshot = await database()
                      .ref(
                        `Messages/${key}/messages/${messagePrimaryKey}/${lastMessagesKey}`,
                      )
                      .once('value');
                    const messageText = messageSnapshot
                      .child('messageText')
                      .val();
                    const time = messageSnapshot.child('time').val();
                    const sender = messageSnapshot.child('sender').val();
                    const seen = messageSnapshot.child('seen').val();
                    const mediaType = messageSnapshot.child('mediaType').val();
                    let date = messagePrimaryKey;
                    const dateformat = Intl.DateTimeFormat('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    });
                    let currentDate = dateformat.format(new Date());
                    currentDate = currentDate.split('/').join('-');
                    if (date === currentDate) {
                      date = time;
                    }
                    let notify;
                    if (sender === myAuthUserId) {
                      notify = 'dontNotify';
                    } else {
                      notify = seen === 'notSeen' ? 'notify' : 'dontNotify';
                    }

                    messages.push({
                      key: key,
                      profileImage: opponentDetails.profileImage,
                      name: opponentDetails.name,
                      date: date,
                      sender: sender,
                      messageText: messageText,
                      notify: notify,
                      opponentUserId: opponentUserId,
                      mediaType: mediaType,
                    });
                  }
                }
              } else {
                return null;
              }
            }
          }
        }
        setMessages(messages);
        setActivityIndicatorVisibility(false);
      });
    }, 1000);
    setActivityIndicatorVisibility(false);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={light ? styles.MessagesLight : styles.MessagesDark}>
      <StatusBar
        backgroundColor={light ? '#FFFFFF' : '#000000'}
        barStyle={light ? 'dark-content' : 'light-content'}
      />

      <View style={styles.headerContainer}>
        <Image source={logo} style={styles.logo} />
        <Text style={light ? styles.textLight : styles.textDark}>Messages</Text>
      </View>
      {!messages ? (
        <>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
            keyExtractor={item => item.toString()}
            renderItem={({item}) => {
              return (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    marginBottom: 20,
                    marginTop: 10,
                    marginLeft: 20,
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <View
                      style={[
                        styles.UserProfileImage,
                        {backgroundColor: light ? '#dedede' : '#31363F'},
                      ]}></View>
                    <View>
                      <View
                        style={
                          light
                            ? [
                                styles.UserNameLight,
                                {
                                  backgroundColor: light
                                    ? '#dedede'
                                    : '#31363F',
                                  height: 20,
                                  width: 100,
                                  borderRadius: 14,
                                  marginBottom: 5,
                                },
                              ]
                            : [
                                styles.UserNameDark,
                                {
                                  backgroundColor: light
                                    ? '#dedede'
                                    : '#31363F',
                                  height: 20,
                                  width: 100,
                                  borderRadius: 14,
                                  marginBottom: 5,
                                },
                              ]
                        }></View>

                      <View
                        style={
                          light
                            ? [
                                ,
                                {
                                  backgroundColor: light
                                    ? '#dedede'
                                    : '#31363F',
                                  height: 20,
                                  width: 200,
                                  borderRadius: 14,
                                  marginTop: 5,
                                },
                              ]
                            : [
                                ,
                                {
                                  backgroundColor: light
                                    ? '#dedede'
                                    : '#31363F',
                                  height: 20,
                                  width: 200,
                                  borderRadius: 14,
                                  marginTop: 5,
                                },
                              ]
                        }></View>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        </>
      ) : messages?.length !== 0 ? (
        <FlatList
          data={messages}
          keyExtractor={item => item.key}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => {
                navigation.push('MessageComponent', {
                  recieverAuthUserId: item.opponentUserId,
                });
              }}
              style={
                light
                  ? styles.MessageContainerLight
                  : styles.MessageContainerDark
              }>
              <TouchableOpacity
                onPress={() => {
                  navigation.push('MediaView', {
                    media: item.profileImage
                      ? item.profileImage
                      : 'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg',
                    mediaType: 'image',
                  });
                }}>
                <Image
                  source={{
                    uri: item.profileImage
                      ? item.profileImage
                      : 'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg',
                  }}
                  style={styles.UserProfileImage}
                />
              </TouchableOpacity>
              <View style={styles.NameMessageBlock}>
                <Text
                  style={light ? styles.UserNameLight : styles.UserNameDark}>
                  {item.name}
                </Text>

                <Text
                  style={
                    item.notify === 'notify'
                      ? styles.NotifyLastMessage
                      : light
                      ? styles.LastMessageLight
                      : styles.LastMessageDark
                  }>
                  {item.mediaType
                    ? item.sender === myAuthUserId
                      ? `You:${item.mediaType}`
                      : item.mediaType
                    : item.sender === myAuthUserId
                    ? `You:${item.messageText}`
                    : item.messageText}
                </Text>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginEnd: 'auto',
                  flexDirection: 'column',
                }}>
                <Text
                  style={
                    item.notify === 'notify'
                      ? styles.NotifyDate
                      : light
                      ? styles.DateTimeLight
                      : styles.DateTimeDark
                  }>
                  {item.date}
                </Text>
                {item.notify === 'notify' ? (
                  <View style={styles.UnssenIcon}></View>
                ) : (
                  <View></View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 150,
          }}>
          <Image
            source={require('../../images/MessagesLogo.png')}
            style={styles.MessagesLogo}
          />
          <Text style={light ? styles.HeaderTextLight : styles.HeaderTextDark}>
            Currently, there are no messages!
          </Text>
          <Text
            style={
              light ? styles.DescriptionTextLight : styles.DescriptionTextDark
            }>
            If you receive or send any messages,
          </Text>
          <Text
            style={
              light ? styles.DescriptionTextLight : styles.DescriptionTextDark
            }>
            you will be notified and they will be stored here.
          </Text>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  MessagesLight: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  MessagesDark: {
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
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
    marginEnd: 'auto',
  },
  textDark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginEnd: 'auto',
  },
  MessageContainerLight: {
    // backgroundColor:'#FF0000',
    backgroundColor: '#F5F7F8',
    height: 80,
    width: Dimensions.get('screen').width - 20,
    marginHorizontal: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
  },
  MessageContainerDark: {
    // backgroundColor:'#FF0000',
    backgroundColor: '#35374B',
    height: 80,
    width: Dimensions.get('screen').width - 20,
    marginHorizontal: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
  },
  UserProfileImage: {
    height: 55,
    width: 55,
    borderRadius: 55 / 2,
  },
  NameMessageBlock: {
    flexDirection: 'column',
    paddingHorizontal: 10,
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: Dimensions.get('screen').width - 170,
  },
  UserNameLight: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
    marginEnd: 'auto',
  },
  UserNameDark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginEnd: 'auto',
  },
  LastMessageLight: {
    color: '#6c757d',
    fontSize: 14,
    marginEnd: 'auto',
  },
  LastMessageDark: {
    color: '#E5E1DA',
    fontSize: 14,

    marginEnd: 'auto',
  },
  DateTimeLight: {
    fontSize: 10,
    color: '#121212',
  },
  DateTimeDark: {
    fontSize: 10,
    color: '#DADBDD',
  },
  UnssenIcon: {
    backgroundColor: '#008DDA',
    height: 15,
    width: 15,
    borderRadius: 15 / 2,
    marginBottom: 10,
    marginTop: 10,
  },
  MessagesLogo: {
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
  NotifyLastMessage: {
    color: '#008DDA',
    fontSize: 14,

    marginEnd: 'auto',
  },
  NotifyDate: {
    color: '#008DDA',
    fontSize: 10,
  },
});
export default Messages;
