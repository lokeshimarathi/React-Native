import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  useColorScheme,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions,
  Alert,
  TouchableOpacity,
  ScrollView,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import logo from '../../images/logo.png';
import database from '@react-native-firebase/database';
import auth, {firebase} from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import {RootStackParamList} from '../../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import {
  ImageLibraryOptions,
  MediaType,
  launchImageLibrary,
} from 'react-native-image-picker';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';
const handleLastActive = async (authUserId: string, isOnline: boolean) => {
  useEffect(() => {
    const databaseLastActiveRef = database().ref(
      `Users/${authUserId}/onlineStatus/`,
    );
    try {
      const timeFormat = Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      const dateFormat = Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const currentTime = timeFormat.format(new Date());
      const currentDate = dateFormat.format(new Date());
      databaseLastActiveRef.set({
        isOnline,
        lastActiveDate: currentDate,
        lastActiveTime: currentTime,
      });
      const onDisconnectActivity = databaseLastActiveRef.onDisconnect();
      onDisconnectActivity.set({
        isOnline: false,
        lastActiveDate: currentDate,
        lastActiveTime: timeFormat.format(new Date()),
      });
    } catch (error) {
      console.log(error);
    }
    return () => databaseLastActiveRef.off();
  }, [authUserId, isOnline]);
};

type PublicProps = NativeStackScreenProps<RootStackParamList, 'Public'>;
const Public = ({navigation, route}: PublicProps) => {
  const currentUser = auth().currentUser;

  if (currentUser) {
    const authUserId = currentUser.uid;
    handleLastActive(authUserId, true);
  }
  const light = useColorScheme() === 'light';
  const [profileImage, setProfileImage] = useState<string>(
    'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg',
  );
  const [watchSolutions, setWtchSolutions] = useState<boolean>(false);
  const [watchSolutionsId, setWatchSolutionId] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string>('video');
  const [media, setMedia] = useState<boolean>(true);
  const [pressedMediaName, setPressedMediaName] = useState<string | null>();
  const [pausedMediaName, setPausedMediaName] = useState<string | null>();
  const [mySolutionDescription, setMySolutionDescription] = useState<string>();
  const [mySolutionMedia, setMySolutionMedia] = useState<string | null>();
  const [mySolutionMediaType, setMySolutionMediaType] = useState<
    string | null
  >();
  const [modalVisibility, setModalVisibility] = useState<boolean>(false);
  const [updateConditionSuccessfull, setUpdateConditionSuccessfull] =
    useState<boolean>(false);
  const [myAuthUserId, setMyAuthUserId] = useState<string>();
  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setMyAuthUserId(user.uid);
    }
  }, []);
  const [currentUserName, setCurrentUserName] = useState<string>();
  useEffect(() => {
    const user = firebase.auth().currentUser;

    const authUserId = user?.uid;

    const databaseRef = database().ref(`Users/${authUserId}/profileImage`);
    databaseRef.on('value', async snapshot => {
      const data: string = await snapshot.val();
      const nameSnapshot = await database()
        .ref(`Users/${authUserId}/name`)
        .once('value');
      const name: string = await nameSnapshot.val();
      setCurrentUserName(name);
      if (data) {
        setProfileImage(data);
      } else {
        setProfileImage(
          'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg',
        );
      }
    });
    return () => databaseRef.off();
  }, []);
  const [mySolutionMediaPressed, setMySolutionMediaPressed] =
    useState<boolean>(false);
  const [mySolutionVideoPaused, setMySolutionVideoPaused] =
    useState<boolean>(true);
  const [
    mySolutionVideoControlerVisibility,
    setMySolutionVideoControlerVisibility,
  ] = useState<boolean>(true);
  const mysolutionMediaOptions: ImageLibraryOptions = {
    mediaType: 'mixed' as MediaType,
    maxHeight: 900,
    maxWidth: 900,
    quality: 0.8,
    videoQuality: 'high',
  };

  const handleMysolutionMedia = async () => {
    const result = await launchImageLibrary(mysolutionMediaOptions);
    if (!result.didCancel && !result.errorCode) {
      const firstAsset = result.assets?.[0];
      if (firstAsset) {
        setMySolutionMedia(firstAsset.uri);
        const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg)$/i;
        if (imageExtensions.test(String(firstAsset.uri))) {
          setMySolutionMediaType('image');
        } else {
          setMySolutionMediaType('video');
        }
      }
    }
  };
  const [posts, setPosts] = useState<any[]>();
  const [authUserId, setAuthUserId] = useState<string>();
  const [postsListener, setPostsListner] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    setLoading(true);
    const user = auth().currentUser;

    const myAuthUserId = user?.uid;
    setAuthUserId(myAuthUserId);
    const postsRef = database().ref('Posts/');
    postsRef.on('value', async snapshot => {
      if (snapshot.exists()) {
        const postsData: {
          [key: string]: {
            authUserId: string;
            date: string;
            mediaType: string;
            problemDescription: string;
            problemMedia: string;
            problemStatus: string;
            solutionCount: number;
            time: string;
            solutions: {
              [key: string]: {
                authUserId: string;
                date: string;
                solutionDescription: string;
                solutionMedia: string;
                solutionMediaType: string;
                time: string;
              };
            };
          };
        } = snapshot.val();
        if (postsData) {
          const postsArray = await Promise.all(
            Object.entries(postsData).map(async ([key, value]) => {
              if (typeof value === 'object' && value !== null) {
                const {authUserId} = value;

                const usersSnapshot = await database()
                  .ref(`Users/${authUserId}/`)
                  .once('value');
                const name: string = usersSnapshot.child('name').val();

                const profession: string = usersSnapshot
                  .child('profession')
                  .val();
                const profileImage: string = usersSnapshot
                  .child('profileImage')
                  .val();

                if (value.solutions) {
                  const solutionsArray = await Promise.all(
                    Object.entries(value.solutions).map(
                      async ([key, value]) => {
                        if (typeof value === 'object' && value !== null) {
                          const snapshot = await database()
                            .ref(`Users/${value.authUserId}/`)
                            .once('value');
                          const name = snapshot.child('name').val();

                          const profession = snapshot.child('profession').val();
                          const profileImage = snapshot
                            .child('profileImage')
                            .val();

                          return {
                            solutionId: key,
                            name: name,
                            profession: profession,
                            profileImage: profileImage,
                            ...value,
                          };
                        } else {
                          console.error('Invalid post data:', value);
                          return null;
                        }
                      },
                    ),
                  );

                  if (
                    value.authUserId !== myAuthUserId &&
                    value.problemStatus === 'notSolved'
                  ) {
                    return {
                      postId: key,
                      name: name,
                      profileImage: profileImage,
                      profession: profession,
                      authUserId: value.authUserId,
                      date: value.date,
                      mediaType: value.mediaType,
                      problemDescription: value.problemDescription,
                      problemMedia: value.problemMedia,
                      problemStatus: value.problemStatus,
                      solutionCount: value.solutionCount,
                      time: value.time,
                      solutions: solutionsArray.reverse(),
                    };
                  } else {
                    return null;
                  }
                } else {
                  if (
                    value.authUserId !== myAuthUserId &&
                    value.problemStatus === 'notSolved'
                  ) {
                    return {
                      postId: key,
                      name: name,
                      profileImage: profileImage,
                      profession: profession,
                      authUserId: value.authUserId,
                      date: value.date,
                      mediaType: value.mediaType,
                      problemDescription: value.problemDescription,
                      problemMedia: value.problemMedia,
                      problemStatus: value.problemStatus,
                      solutionCount: value.solutionCount,
                      time: value.time,
                    };
                  } else {
                    return null;
                  }
                }
              } else {
                console.error('Invalid post data:', value);
                return null;
              }
            }),
          );

          setPosts(postsArray.filter(post => post !== null).reverse());
          setLoading(false);
        } else {
          setLoading(false);
          console.error('No post data found.');
          setPosts([]);
        }
      } else {
        setLoading(false);
        setPosts([]);
        console.error('Snapshot does not exist.');
      }
    });

    return () => postsRef.off();
  }, []);

  const uploadSolution = async (
    postKey: string,
    solutionMediaType?: string,
  ) => {
    setModalVisibility(true);
    const dateFormat = Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeFormat = Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
    const currentDate = dateFormat.format(new Date());
    const currentTime = timeFormat.format(new Date());
    const primaryKey = Math.floor(new Date().getTime() / 1000);
    if (authUserId) {
      const databaseRef = database().ref(
        `Posts/${postKey}/solutions/${primaryKey}/`,
      );
      if (mySolutionMedia) {
        const response = await fetch(mySolutionMedia);
        const blob = await response.blob();
        const storageRef = storage().ref(
          `Posts/${postKey}/solutions/${primaryKey}/`,
        );
        await storageRef.put(blob);
        const getMySolutionMediaUrl = await storageRef.getDownloadURL();
        await databaseRef.child('solutionMedia').set(getMySolutionMediaUrl);
        await databaseRef.child('solutionMediaType').set(solutionMediaType);
      }
      await databaseRef.child('date').set(currentDate);
      await databaseRef.child('time').set(currentTime);
      await databaseRef.child('authUserId').set(authUserId);
      await databaseRef.child('solutionDescription').set(mySolutionDescription);
      const reDatabaseRef = database().ref(`Posts/${postKey}/solutionCount`);
      const snapshot = await reDatabaseRef.once('value');
      const solutionCount = snapshot.val();
      await reDatabaseRef.set(solutionCount + 1);
      await sendNotification(
        postKey,
        String(mySolutionDescription),
        String(primaryKey),
      );
      setMySolutionDescription('');
      setMySolutionMedia(null);
      setUpdateConditionSuccessfull(true);
    }
  };
  const sendNotification = async (
    postId: string,
    solutionDescription: string,
    solutionId: string,
  ) => {
    const user = auth().currentUser;
    if (user) {
      const myAuthUserId = user.uid;
      const mySnapshot = await database()
        .ref('Users')
        .child(myAuthUserId)
        .once('value');
      const name = await mySnapshot.child('name').val();
      const postSnapshot = await database()
        .ref(`Posts/${postId}/`)
        .once('value');
      const problemDescription = await postSnapshot
        .child('problemDescription')
        .val();
      const opponentAuthUserId = await postSnapshot.child('authUserId').val();
      const date = await postSnapshot.child('date').val();
      const time = await postSnapshot.child('time').val();
      const dateFormat = Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const timeFormat = Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const currentDate = dateFormat.format(new Date());
      const currentTime = timeFormat.format(new Date());
      const opponentSnapshot = await database()
        .ref('Users')
        .child(opponentAuthUserId)
        .once('value');
      const token = await opponentSnapshot.child('token').val();
      if (token) {
        try {
          const data = {
            data: {
              postId: postId,
              currentDate: currentDate,
              currentTime: currentTime,
              relatedPage: 'Public',
              notificationType: 'solutionNotification',
              solutionId: solutionId,
            },
            notification: {
              deepLink: 'Discover://Public',
              title: `${name}, posted a solution `,
              body: `${solutionDescription}\nfor:${problemDescription}\n${date} ${time}`,
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
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const [solutions, setSolutions] = useState<boolean>(false);
  const fetchSolutionCount = async (postKey: string) => {
    setSolutions(false);
    const solutionCountionSnapshot = await database()
      .ref(`Posts/${postKey}/solutionCount`)
      .once('value');
    const solutionCount = await solutionCountionSnapshot.val();
    if (solutionCount > 0) {
      setSolutions(true);
    } else {
      setSolutions(false);
    }
  };

  return (
    <View style={light ? styles.containerLight : styles.containerDark}>
      <StatusBar
        backgroundColor={light ? '#FFFFFF' : '#000000'}
        barStyle={light ? 'dark-content' : 'light-content'}
      />
      <Modal
        transparent={true}
        visible={modalVisibility}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}>
        <StatusBar
          backgroundColor={'rgba(0,0,0,0.5)'}
          barStyle={'light-content'}
        />
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          {updateConditionSuccessfull ? (
            <View
              style={
                light
                  ? styles.ProfileUpdateCardLight
                  : styles.ProfileUpdateCardDark
              }>
              <Animatable.Image
                animation={'pulse'}
                iterationCount={'infinite'}
                source={require('../../images/CheckMark.png')}
                style={[styles.UpdateProfileLogo, {height: 100, width: 100}]}
              />
              <Text
                style={[
                  light
                    ? styles.ModalContainerTextLight
                    : styles.ModalContainerTextDark,
                  {color: '#59CE8F'},
                ]}>
                Solution posted successfully!
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisibility(false);
                  setUpdateConditionSuccessfull(false);
                }}>
                <Text
                  style={[
                    light
                      ? styles.ModalContainerTextLight
                      : styles.ModalContainerTextDark,
                    {alignSelf: 'flex-end'},
                  ]}>
                  Ok
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={
                light
                  ? styles.ProfileUpdateCardLight
                  : styles.ProfileUpdateCardDark
              }>
              <Image
                source={require('../../images/UploadLogo.png')}
                style={styles.UpdateProfileLogo}
              />
              <Text
                style={
                  light
                    ? styles.ModalContainerTextLight
                    : styles.ModalContainerTextDark
                }>
                Please wait posting your solution..
              </Text>
              <ActivityIndicator
                size={25}
                color={light ? '#35374B' : '#FFFFFF'}
                style={{alignSelf: 'center', marginTop: 20}}
              />
            </View>
          )}
        </View>
      </Modal>
      <View style={styles.headerContainer}>
        <Image source={logo} style={styles.logo} />
        <Text style={light ? styles.textLight : styles.textDark}>Discover</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.push('Drawer');
          }}>
          <Image source={{uri: profileImage}} style={styles.profileImage} />
        </TouchableOpacity>
      </View>
      <View
        style={
          posts ? styles.MainContainer : [{justifyContent: 'center', flex: 1}]
        }>
        {loading ? (
          <>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={[1, 2, 3, 4]}
              keyExtractor={item => item.toString()}
              renderItem={({item}) => {
                return (
                  <View
                    style={light ? styles.PostCardLight : styles.PostCardDark}>
                    <View>
                      <View style={styles.UserDetails}>
                        <View
                          style={[
                            styles.UserProfileImage,
                            {backgroundColor: light ? '#dedede' : '#31363F'},
                          ]}></View>
                        <View style={styles.NameProfessionBlock}>
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
                                    styles.UserProfessionLight,
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
                                    styles.UserProfessionDark,
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
                      <View
                        style={
                          light
                            ? [
                                styles.UserNameLight,
                                {
                                  backgroundColor: light
                                    ? '#dedede'
                                    : '#31363F',
                                  height: 30,
                                  width: 320,
                                  borderRadius: 14,
                                  marginBottom: 5,
                                  alignSelf: 'center',
                                  marginHorizontal: 15,
                                },
                              ]
                            : [
                                styles.UserNameDark,
                                {
                                  backgroundColor: light
                                    ? '#dedede'
                                    : '#31363F',
                                  height: 30,
                                  width: 320,
                                  borderRadius: 14,
                                  marginBottom: 5,
                                  alignSelf: 'center',
                                  marginHorizontal: 15,
                                },
                              ]
                        }></View>
                      <View
                        style={
                          light
                            ? [
                                styles.UserNameLight,
                                {
                                  backgroundColor: light
                                    ? '#dedede'
                                    : '#31363F',
                                  height: 150,
                                  width: 320,
                                  borderRadius: 14,
                                  marginBottom: 5,
                                  alignSelf: 'center',
                                  marginHorizontal: 15,
                                },
                              ]
                            : [
                                styles.UserNameDark,
                                {
                                  backgroundColor: light
                                    ? '#dedede'
                                    : '#31363F',
                                  height: 150,
                                  width: 320,
                                  borderRadius: 14,
                                  marginBottom: 5,
                                  alignSelf: 'center',
                                  marginHorizontal: 15,
                                },
                              ]
                        }></View>
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
                                  alignSelf: 'center',
                                  marginHorizontal: 15,
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
                                  alignSelf: 'center',
                                  marginHorizontal: 15,
                                },
                              ]
                        }></View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          width: 350,
                        }}>
                        <View
                          style={
                            light
                              ? [
                                  styles.UserNameLight,
                                  {
                                    backgroundColor: light
                                      ? '#dedede'
                                      : '#31363F',
                                    height: 30,
                                    width: 100,
                                    borderRadius: 14,
                                    marginBottom: 5,

                                    marginHorizontal: 15,
                                    marginRight: 30,
                                  },
                                ]
                              : [
                                  styles.UserNameDark,
                                  {
                                    backgroundColor: light
                                      ? '#dedede'
                                      : '#31363F',
                                    height: 30,
                                    width: 100,
                                    borderRadius: 14,
                                    marginBottom: 5,

                                    marginHorizontal: 15,
                                    marginRight: 30,
                                  },
                                ]
                          }></View>
                        <View
                          style={
                            light
                              ? [
                                  styles.UserNameLight,
                                  {
                                    backgroundColor: light
                                      ? '#dedede'
                                      : '#31363F',
                                    height: 30,
                                    width: 100,
                                    borderRadius: 14,
                                    marginBottom: 5,
                                    marginLeft: 100,
                                    alignSelf: 'flex-end',
                                    marginEnd: 'auto',
                                  },
                                ]
                              : [
                                  styles.UserNameDark,
                                  {
                                    backgroundColor: light
                                      ? '#dedede'
                                      : '#31363F',
                                    height: 30,
                                    width: 100,
                                    borderRadius: 14,
                                    marginBottom: 5,
                                    marginLeft: 100,
                                    alignSelf: 'flex-end',
                                    marginEnd: 'auto',
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
        ) : (
          <>
            {Number(posts?.length) > 0 ? (
              <FlatList
                showsVerticalScrollIndicator={false}
                style={{
                  paddingBottom: 50,
                  marginBottom: 50,
                }}
                data={posts}
                keyExtractor={item => item.postId}
                renderItem={({item}) => {
                  return (
                    <View
                      style={
                        light ? styles.PostCardLight : styles.PostCardDark
                      }>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.push('UsersProfile', {
                            usersAuthUserId: item.authUserId,
                          });
                        }}>
                        <View style={styles.UserDetails}>
                          <Image
                            source={{
                              uri: item.profileImage
                                ? item.profileImage
                                : 'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg',
                            }}
                            style={styles.UserProfileImage}
                          />
                          <View style={styles.NameProfessionBlock}>
                            <Text
                              style={
                                light
                                  ? styles.UserNameLight
                                  : styles.UserNameDark
                              }>
                              {item.name}
                            </Text>

                            <Text
                              style={
                                light
                                  ? styles.UserProfessionLight
                                  : styles.UserProfessionDark
                              }>
                              {item.profession}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                      <Text
                        style={
                          light
                            ? styles.ProblemDescriptionLight
                            : styles.ProblemDescriptionDark
                        }>
                        {item.problemDescription}
                      </Text>
                      {item.problemMedia &&
                        (item.mediaType === 'image' ? (
                          <TouchableOpacity
                            onLongPress={() => {
                              navigation.push('MediaView', {
                                media: item.problemMedia,
                                mediaType: 'image',
                              });
                            }}>
                            <View style={styles.MediaContainer}>
                              <Image
                                source={{uri: item.problemMedia}}
                                style={styles.AttachedMediaImage}
                              />
                            </View>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onLongPress={() => {
                              navigation.push('MediaView', {
                                media: item.problemMedia,
                                mediaType: 'video',
                              });
                            }}
                            onPress={() => {
                              setPressedMediaName(item.problemMedia);
                            }}>
                            <View style={styles.MediaContainer}>
                              <Video
                                style={styles.AttachedVideo}
                                resizeMode="cover"
                                paused={pausedMediaName !== item.problemMedia}
                                playInBackground={false}
                                onAudioFocusChanged={() => {}}
                                onEnd={() => {
                                  setPressedMediaName(item.problemMedia);
                                  setPausedMediaName(item.problemMedia);
                                }}
                                onLoad={() => {
                                  setPressedMediaName(item.problemMedia);
                                }}
                                source={{
                                  uri: item.problemMedia,
                                }}
                              />

                              {pressedMediaName && (
                                <TouchableOpacity
                                  onPress={() => {
                                    setPressedMediaName(null);
                                  }}
                                  style={{
                                    position: 'absolute',
                                    height: 180,
                                    width: Dimensions.get('screen').width - 80,
                                    borderRadius: 14,
                                    marginBottom: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                  <View>
                                    <TouchableOpacity
                                      onPress={() => {
                                        if (
                                          pausedMediaName === item.problemMedia
                                        ) {
                                          setPressedMediaName(null);
                                        } else {
                                          setPressedMediaName(
                                            item.problemMedia,
                                          );
                                        }
                                        if (
                                          pausedMediaName === item.problemMedia
                                        ) {
                                          setPausedMediaName(null);
                                        } else {
                                          setPausedMediaName(item.problemMedia);
                                        }
                                        setPressedMediaName(item.problemMedia);
                                      }}>
                                      <View
                                        style={{
                                          borderRadius: 50,
                                          backgroundColor: 'rgba(0,0,0,0.5)',
                                          padding: 10,
                                        }}>
                                        {pressedMediaName ===
                                        item.problemMedia ? (
                                          <Icon
                                            color={'#FFFFFF'}
                                            name={
                                              pausedMediaName ===
                                              item.problemMedia
                                                ? 'pause'
                                                : 'play-arrow'
                                            }
                                            size={30}
                                          />
                                        ) : (
                                          <Icon
                                            color={'#FFFFFF'}
                                            name={'play-arrow'}
                                            size={30}
                                          />
                                        )}
                                      </View>
                                    </TouchableOpacity>
                                  </View>
                                </TouchableOpacity>
                              )}
                            </View>
                          </TouchableOpacity>
                        ))}
                      <Text
                        style={
                          light
                            ? styles.ProblemDescriptionLight
                            : styles.ProblemDescriptionDark
                        }>
                        {item?.date}
                      </Text>
                      <View style={styles.SolutionPart}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={
                              light ? styles.UserNameLight : styles.UserNameDark
                            }>
                            Solutions:
                          </Text>
                          <Text
                            style={
                              light
                                ? styles.UserProfessionLight
                                : styles.UserProfessionDark
                            }>
                            {item?.solutionCount}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'flex-end',
                            backgroundColor: '#40A2E3',
                            paddingHorizontal: 10,
                            borderRadius: 10,
                          }}
                          onPress={() => {
                            fetchSolutionCount(item.postId);
                            if (watchSolutionsId === item.postId) {
                              setWatchSolutionId(null);
                            } else {
                              setWatchSolutionId(item.postId);
                            }

                            setMySolutionMedia(null);
                            setMySolutionMediaType(null);
                          }}>
                          <Text
                            style={[styles.UserNameLight, {color: '#FFFFFF'}]}>
                            Want to solve?
                          </Text>

                          <Icon
                            name={
                              watchSolutionsId === item.postId
                                ? 'keyboard-arrow-up'
                                : 'keyboard-arrow-down'
                            }
                            size={30}
                            color={'#FFFFFF'}
                          />
                        </TouchableOpacity>
                      </View>
                      {watchSolutionsId === item.postId ? (
                        <View style={{flexDirection: 'column'}}>
                          <View style={styles.MySolutions}>
                            <View
                              style={
                                light
                                  ? styles.SolutionDescriptionLight
                                  : styles.SolutionDescriptionDark
                              }>
                              <TextInput
                                value={mySolutionDescription}
                                style={
                                  light
                                    ? styles.MySolutionInputLight
                                    : styles.MySolutionInputDark
                                }
                                onChangeText={
                                  setMySolutionDescription
                                }></TextInput>
                              <TouchableOpacity
                                onPress={() => {
                                  handleMysolutionMedia();
                                  setMySolutionMediaPressed(true);
                                  setMySolutionMedia(null);
                                  setMySolutionVideoPaused(true);
                                  setMySolutionVideoControlerVisibility(true);
                                }}>
                                <View
                                  style={{
                                    borderRadius: 15,
                                    backgroundColor: light
                                      ? '#EEF5FF'
                                      : '#3D3B40',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 30,
                                    width: 30,
                                  }}>
                                  <Icon
                                    name="add"
                                    size={25}
                                    color={light ? '#000000' : '#FFFFFF'}
                                  />
                                </View>
                              </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                              onPress={() => {
                                if (mySolutionDescription) {
                                  if (mySolutionMedia) {
                                    uploadSolution(
                                      item.postId,
                                      String(mySolutionMediaType),
                                    );
                                  } else {
                                    uploadSolution(item.postId);
                                  }
                                } else {
                                  Alert.alert(
                                    'Please describe your solution...',
                                  );
                                }
                              }}>
                              <Image
                                source={require('../../images/SendIcon.png')}
                                style={{
                                  borderRadius: 20,
                                  height: 40,
                                  width: 40,
                                  marginHorizontal: 10,
                                }}></Image>
                            </TouchableOpacity>
                          </View>
                          {mySolutionMedia &&
                            (mySolutionMediaType === 'image' ? (
                              <View>
                                <TouchableOpacity
                                  onLongPress={() => {
                                    setMySolutionMediaPressed(true);
                                  }}>
                                  <Image
                                    source={{uri: mySolutionMedia}}
                                    style={styles.MySolutionImage}
                                  />
                                </TouchableOpacity>
                                {mySolutionMediaPressed && (
                                  <TouchableOpacity
                                    onPress={() => {
                                      setMySolutionMediaPressed(false);
                                    }}
                                    style={{
                                      backgroundColor: 'rgba(0,0,0,.5)',
                                      height: 180,
                                      width:
                                        Dimensions.get('screen').width - 100,
                                      borderRadius: 14,
                                      marginBottom: 10,
                                      position: 'absolute',
                                      alignSelf: 'center',
                                      marginVertical: 10,
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                    }}>
                                    <TouchableOpacity
                                      onPress={() => {
                                        setMySolutionMediaPressed(false);
                                        setMySolutionMedia(null);
                                      }}>
                                      <Icon
                                        style={{color: '#FFFFFF'}}
                                        name="delete"
                                        size={25}
                                      />
                                    </TouchableOpacity>
                                  </TouchableOpacity>
                                )}
                              </View>
                            ) : (
                              <View>
                                <TouchableOpacity
                                  onPress={() => {
                                    setMySolutionMediaPressed(true);
                                    setMySolutionVideoControlerVisibility(true);
                                  }}
                                  onLongPress={() => {
                                    setMySolutionMediaPressed(true);
                                    setMySolutionVideoControlerVisibility(
                                      false,
                                    );
                                  }}>
                                  <Video
                                    style={styles.MySolutionVideo}
                                    resizeMode="cover"
                                    paused={mySolutionVideoPaused}
                                    playInBackground={false}
                                    onEnd={() => {
                                      setMySolutionVideoPaused(true);
                                      setMySolutionVideoControlerVisibility(
                                        true,
                                      );
                                    }}
                                    source={{
                                      uri: mySolutionMedia,
                                    }}
                                  />
                                </TouchableOpacity>
                                {mySolutionMediaPressed &&
                                  (mySolutionVideoControlerVisibility ? (
                                    <TouchableOpacity
                                      onPress={() => {
                                        setMySolutionMediaPressed(false);
                                      }}
                                      style={{
                                        position: 'absolute',
                                        height: 180,
                                        width:
                                          Dimensions.get('screen').width - 80,
                                        borderRadius: 14,
                                        marginBottom: 10,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}>
                                      <View>
                                        <TouchableOpacity
                                          onPress={() => {
                                            if (mySolutionVideoPaused) {
                                              setMySolutionMediaPressed(false);
                                            } else {
                                              setMySolutionMediaPressed(true);
                                            }
                                            setMySolutionVideoPaused(
                                              !mySolutionVideoPaused,
                                            );
                                          }}>
                                          <View
                                            style={{
                                              borderRadius: 50,
                                              backgroundColor:
                                                'rgba(0,0,0,0.5)',
                                              padding: 10,
                                            }}>
                                            <Icon
                                              color={'#FFFFFF'}
                                              name={
                                                mySolutionVideoPaused
                                                  ? 'play-arrow'
                                                  : 'pause'
                                              }
                                              size={30}
                                            />
                                          </View>
                                        </TouchableOpacity>
                                      </View>
                                    </TouchableOpacity>
                                  ) : (
                                    <TouchableOpacity
                                      onPress={() => {
                                        setMySolutionMediaPressed(false);
                                      }}
                                      style={{
                                        backgroundColor: 'rgba(0,0,0,.5)',
                                        height: 180,
                                        width:
                                          Dimensions.get('screen').width - 100,
                                        borderRadius: 14,
                                        marginBottom: 10,
                                        position: 'absolute',
                                        alignSelf: 'center',
                                        marginVertical: 10,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}>
                                      <TouchableOpacity
                                        onPress={() => {
                                          setMySolutionMediaPressed(false);
                                          setMySolutionMedia(null);
                                        }}>
                                        <Icon
                                          style={{color: '#FFFFFF'}}
                                          name="delete"
                                          size={25}
                                        />
                                      </TouchableOpacity>
                                    </TouchableOpacity>
                                  ))}
                              </View>
                            ))}
                          {item.solutions ? (
                            <View>
                              <View
                                style={{
                                  backgroundColor: light
                                    ? '#FFFFFF'
                                    : '#000000',
                                  height: 2,
                                  width: 320,
                                  marginTop: 20,
                                  alignSelf: 'center',
                                  paddingHorizontal: 20,
                                }}></View>
                              <Text
                                style={[
                                  light
                                    ? styles.UserNameLight
                                    : styles.UserNameDark,
                                  {
                                    marginHorizontal: 20,
                                    color: '#40A2D8',
                                    marginTop: 10,
                                  },
                                ]}>
                                Solutions:
                              </Text>
                              <View>
                                <FlatList
                                  style={{
                                    marginBottom: 50,
                                  }}
                                  data={item.solutions}
                                  keyExtractor={item => item.solutionId}
                                  renderItem={({item}) => (
                                    <View>
                                      <View>
                                        <TouchableOpacity
                                          onPress={() => {
                                            if (
                                              item.authUserId !== myAuthUserId
                                            ) {
                                              navigation.push('UsersProfile', {
                                                usersAuthUserId:
                                                  item.authUserId,
                                              });
                                            }
                                          }}>
                                          <View style={styles.UserDetails}>
                                            <Image
                                              source={{
                                                uri: item.profileImage
                                                  ? item.profileImage
                                                  : 'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg',
                                              }}
                                              style={styles.UserProfileImage}
                                            />
                                            <View
                                              style={
                                                styles.NameProfessionBlock
                                              }>
                                              <Text
                                                style={
                                                  light
                                                    ? styles.UserNameLight
                                                    : styles.UserNameDark
                                                }>
                                                {item.name === currentUserName
                                                  ? 'You'
                                                  : item.name}
                                              </Text>
                                              <Text
                                                style={
                                                  light
                                                    ? styles.UserProfessionLight
                                                    : styles.UserProfessionDark
                                                }>
                                                {item.profession}
                                              </Text>
                                            </View>
                                          </View>
                                        </TouchableOpacity>
                                        <Text
                                          style={
                                            light
                                              ? styles.ProblemDescriptionLight
                                              : styles.ProblemDescriptionDark
                                          }>
                                          {item.solutionDescription}
                                        </Text>

                                        {item.solutionMedia &&
                                          (item.solutionMediaType ===
                                          'image' ? (
                                            <View>
                                              <Text
                                                style={
                                                  light
                                                    ? styles.UserProfessionLight
                                                    : styles.UserProfessionDark
                                                }>
                                                📌 Attached image:
                                              </Text>
                                              <TouchableOpacity
                                                onPress={() => {
                                                  navigation.push('MediaView', {
                                                    media: item.solutionMedia,
                                                    mediaType: 'image',
                                                  });
                                                }}
                                                style={{
                                                  height: 100,
                                                  width: 100,
                                                  alignSelf: 'flex-start',
                                                }}>
                                                <View
                                                  style={[
                                                    styles.MediaContainer,
                                                    {
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      height: 100,
                                                      width: 100,
                                                      marginVertical: 10,
                                                      marginHorizontal: 30,
                                                    },
                                                  ]}>
                                                  <Image
                                                    source={{
                                                      uri: item.solutionMedia,
                                                    }}
                                                    style={[
                                                      styles.AttachedMediaImage,
                                                      {
                                                        height: 100,
                                                        width: 100,
                                                        alignSelf: 'flex-start',
                                                        resizeMode: 'cover',
                                                        marginBottom: 20,
                                                        marginTop: 10,
                                                      },
                                                    ]}
                                                  />
                                                </View>
                                              </TouchableOpacity>
                                            </View>
                                          ) : (
                                            <View>
                                              <Text
                                                style={
                                                  light
                                                    ? styles.UserProfessionLight
                                                    : styles.UserProfessionDark
                                                }>
                                                📌 Attached video:
                                              </Text>
                                              <TouchableOpacity
                                                onPress={() => {
                                                  navigation.push('MediaView', {
                                                    media: item.solutionMedia,
                                                    mediaType: 'video',
                                                  });
                                                }}
                                                style={{
                                                  height: 100,
                                                  width: 100,
                                                  alignSelf: 'flex-start',
                                                  position: 'relative',
                                                }}>
                                                <View
                                                  style={[
                                                    styles.MediaContainer,
                                                    {
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      height: 100,
                                                      width: 100,
                                                      marginVertical: 10,
                                                      marginHorizontal: 20,
                                                    },
                                                  ]}>
                                                  <Video
                                                    style={[
                                                      styles.AttachedVideo,
                                                      {
                                                        height: 100,
                                                        width: 100,
                                                        alignSelf: 'flex-start',
                                                        marginBottom: 10,
                                                      },
                                                    ]}
                                                    resizeMode="cover"
                                                    paused
                                                    playInBackground={false}
                                                    source={{
                                                      uri: item.solutionMedia,
                                                    }}
                                                  />
                                                  <View
                                                    style={{
                                                      backgroundColor:
                                                        'rgba(0,0,0,0.5)',
                                                      position: 'absolute',
                                                      top: '50%', // Position icon parent at the center vertically
                                                      left: '50%', // Position icon parent at the center horizontally
                                                      transform: [
                                                        {translateX: 5},
                                                        {translateY: -15},
                                                      ], // Adjust icon parent to center
                                                      borderRadius: 15,
                                                      borderWidth: 0.5,
                                                      borderColor: '#FFFFFF',
                                                      justifyContent: 'center', // Center the icon vertically
                                                      alignItems: 'center', // Center the icon horizontally
                                                      height: 30,
                                                      width: 30,
                                                    }}>
                                                    <Icon
                                                      style={{
                                                        paddingVertical: 5,
                                                      }}
                                                      color={'#FFFFFF'}
                                                      name={'play-arrow'}
                                                      size={20}
                                                    />
                                                  </View>
                                                </View>
                                              </TouchableOpacity>
                                            </View>
                                          ))}
                                      </View>
                                      <View
                                        style={{
                                          marginVertical: 10,
                                          height: 2,
                                          width: 320,
                                          backgroundColor: light
                                            ? '#FFFFFF'
                                            : '#000000',
                                          alignSelf: 'center',
                                          marginTop: 10,
                                        }}></View>
                                    </View>
                                  )}
                                />
                              </View>
                            </View>
                          ) : (
                            <View></View>
                          )}
                        </View>
                      ) : (
                        <View></View>
                      )}
                    </View>
                  );
                }}></FlatList>
            ) : (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  marginTop: 200,
                }}>
                <Image
                  source={require('../../images/NoDataIcon.png')}
                  style={{height: 150, width: 150}}
                />
                <Text
                  style={[
                    light ? styles.HeaderTextLight : styles.HeaderTextDark,
                    {fontSize: 12},
                  ]}>
                  No Posts found for your requirement!
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};
const {width, height} = Dimensions.get('screen');
const styles = StyleSheet.create({
  containerLight: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
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
  profileImage: {
    borderRadius: 20,
    height: 40,
    width: 40,

    resizeMode: 'cover',
  },
  MainContainer: {
    alignItems: 'center',
    // paddingVertical: 5,
    paddingHorizontal: 10,
  },
  PostCardLight: {
    backgroundColor: '#EEF5FF',
    paddingVertical: 10,
    width: width - 60,
    margin: 20,
    borderRadius: 14,
    // marginBottom: 100,
    paddingBottom: 10,
  },
  PostCardDark: {
    backgroundColor: '#27374D',
    paddingVertical: 10,
    width: width - 60,
    margin: 20,
    borderRadius: 14,
    // marginBottom: 100,
    paddingBottom: 10,
  },

  UserDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: Dimensions.get('window').width,
  },
  UserProfileImage: {
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  NameProfessionBlock: {
    flexDirection: 'column',
    paddingHorizontal: 10,
  },
  UserNameLight: {
    color: '#121212',
    fontSize: 14,
    fontWeight: 'bold',
    marginEnd: 'auto',
  },
  UserNameDark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginEnd: 'auto',
  },
  UserProfessionLight: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    marginEnd: 'auto',
  },
  UserProfessionDark: {
    color: '#E5E1DA',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    marginEnd: 'auto',
  },
  ProblemDescriptionLight: {
    paddingHorizontal: 10,
    color: '#121212',
  },
  ProblemDescriptionDark: {
    paddingHorizontal: 10,
    color: '#DADBDD',
  },
  MediaContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  AttachedMediaImage: {
    resizeMode: 'cover',
    height: 200,
    width: width - 80,
    borderRadius: 14,
    backgroundColor: '#000000',
  },
  AttachedVideo: {
    backgroundColor: '#000000',
    height: 180,
    width: Dimensions.get('screen').width - 80,
    borderRadius: 14,
    marginBottom: 10,
  },
  SolutionPart: {
    marginTop: 10,
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  MySolutions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  SolutionDescriptionLight: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  SolutionDescriptionDark: {
    backgroundColor: '#606470',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  MySolutionInputLight: {
    height: 40,
    width: 220,
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 12,
  },
  MySolutionInputDark: {
    height: 40,
    width: 220,

    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  MySolutionImage: {
    resizeMode: 'cover',
    height: 180,
    width: Dimensions.get('screen').width - 100,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#000000',
    alignSelf: 'center',
    marginVertical: 10,
  },
  MySolutionVideo: {
    height: 180,
    width: Dimensions.get('screen').width - 100,
    alignSelf: 'center',
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#000000',
    marginVertical: 10,
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
  ProfileUpdateCardLight: {
    height: 300,
    width: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: 10,
    shadowColor: '#000000',
    shadowRadius: 20,
    elevation: 14,
    shadowOpacity: 0.5,
  },
  ProfileUpdateCardDark: {
    height: 300,
    width: 300,
    backgroundColor: '#31363F',
    borderRadius: 14,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowRadius: 20,
    elevation: 14,
    shadowOpacity: 0.5,
  },
  UpdateProfileLogo: {
    height: 150,
    width: 150,
  },
  ModalContainerTextLight: {
    color: '#121212',
    textAlign: 'center',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  ModalContainerTextDark: {
    color: '#DADBDD',
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
  },
});
export default Public;
