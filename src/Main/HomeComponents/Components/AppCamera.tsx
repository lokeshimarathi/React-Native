import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Camera,
  getCameraDevice,
  useCameraDevice,
  useCameraDevices,
} from 'react-native-vision-camera';
import {ActivityIndicator} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import FlashIcon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import BackIcon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import {RootStackParamList} from '../../../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';
type AppCameraProps = NativeStackScreenProps<RootStackParamList, 'AppCamera'>;
const AppCamera = ({navigation, route}: AppCameraProps) => {
  const [myMedia, setMyMedia] = useState<string>();
  const [myMediaType, setMyMediaType] = useState<'image' | 'video'>();
  const opponentAuthUserId = route.params.opponentAuthUserId;
  const receivedMyMedia = route.params?.myMedia;
  const receivedMyMediaType = route.params?.myMediaType;
  const [modalVisibility, setModalVisibility] = useState<boolean>(false);
  const [updateConditionSuccessfull, setUpdateConditionSuccessfull] =
    useState<boolean>(false);
  const [cameraPersmissionGranted, setCameraPermissionGranted] =
    useState<string>();
  const [microphonePermissionGranted, setMicroPhonePermissionGranted] =
    useState<string>();
  const [deviceCamera, setDeviceCamera] = useState<any>('back');
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [cameraTypePhoto, setCameraTypePhoto] = useState<boolean>(true);

  const [captureButtonBackgroundColor, setCaptureButtonBackgroundColor] =
    useState<string>('#FFFFFF');
  const [isVideoCapturing, setIsVideoCapturing] = useState<boolean>(false);
  const [isVideoPaused, setIsVideoPaused] = useState<boolean>(false);

  useEffect(() => {
    const askPermission = async () => {
      const newCameraPermission = await Camera.requestCameraPermission();
      const newMicrophonePermission =
        await Camera.requestMicrophonePermission();
      setCameraPermissionGranted(String(newCameraPermission));
      setMicroPhonePermissionGranted(newMicrophonePermission);
    };
    askPermission();
  }, []);

  const devices: any = Camera.getAvailableCameraDevices();
  const device: any = getCameraDevice(devices, deviceCamera);
  const [captured, setCaptured] = useState<boolean>(false);
  if (device === null)
    return (
      <ActivityIndicator
        size={50}
        style={{alignSelf: 'center'}}
        color="#40A2E3"
      />
    );

  const cameraPhotoCaptureRef = useRef<Camera>(null);
  useEffect(() => {
    if (cameraTypePhoto) {
      setCaptureButtonBackgroundColor('#EABE6C');
      const timer = setTimeout(() => {
        setCaptureButtonBackgroundColor('#FFFFFF');
      }, 800);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [captured === true]);

  const capturePhoto = async () => {
    if (cameraPhotoCaptureRef.current !== null) {
      const capturedPhoto = await cameraPhotoCaptureRef.current.takePhoto();
      try {
        setMyMedia(`file://${capturedPhoto.path}`);
        setMyMediaType('image');
        setCaptured(false);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleVideoRecording = async (captured: boolean) => {
    if (captured) {
      setCaptureButtonBackgroundColor('#FF0000');
      if (cameraPhotoCaptureRef.current !== null) {
        try {
          cameraPhotoCaptureRef.current.startRecording({
            onRecordingFinished: (video: any) => {
              setMyMedia(`file://${video.path}`);
              console.log('Captured video path:', video.path);
              setMyMediaType('video');
            },
            onRecordingError: (error: any) => console.log(error),
          });
          setIsVideoCapturing(true);
        } catch (error) {
          console.error(error);
        }
      }
    } else {
      setCaptureButtonBackgroundColor('#FFFFFF');
      if (cameraPhotoCaptureRef.current !== null) {
        try {
          cameraPhotoCaptureRef.current.stopRecording();
        } catch (error) {
          console.error(error);
        }
      }
      setIsVideoCapturing(false);
    }
  };

  const handleVideoPause = async (isVideoPaused: boolean) => {
    if (isVideoCapturing) {
      console.log('video capturing');

      if (isVideoPaused) {
        setIsVideoPaused(true);
        if (cameraPhotoCaptureRef.current !== null) {
          await cameraPhotoCaptureRef.current.pauseRecording();
          console.log('pauseRecording');
        }
      } else {
        setIsVideoPaused(false);
        if (cameraPhotoCaptureRef.current !== null) {
          await cameraPhotoCaptureRef.current.resumeRecording();
          console.log('resumeRecording');
        }
      }
    }
  };
  const [myMediaVideoPaused, setMyMediaVideoPaused] = useState<boolean>(false);
  const [myMediaVideoPressed, setMyMediaVideoPressed] =
    useState<boolean>(false);
  const [myMessageText, setMyMessageText] = useState<string>();

  const sendMessage = async (myMedia: string, myMediaType: string) => {
    setModalVisibility(true);

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
    if (myMedia || receivedMyMedia) {
      const storageRef = storage().ref(
        `Messages/${messagePrimaryKey}/${primaryKey}/`,
      );

      const result = await fetch(String(myMedia));
      const blob = await result.blob();

      await storageRef.put(blob);
      const mediaUrl = await storageRef.getDownloadURL();

      try {
        const snapshot = database().ref(`Messages/${messagePrimaryKey}/`);

        await snapshot.child('authUserId1').set(myAuthUserId);
        await snapshot.child('authUserId2').set(opponentAuthUserId);
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
        await snapshot
          .child('messages')
          .child(currentDate)
          .child(primaryKey)
          .child('media')
          .set(mediaUrl);
        await snapshot
          .child('messages')
          .child(currentDate)
          .child(primaryKey)
          .child('mediaType')
          .set(myMediaType);
        if (myMessageText) {
          await snapshot
            .child('messages')
            .child(currentDate)
            .child(primaryKey)
            .child('messageText')
            .set(myMessageText);
        }
        setUpdateConditionSuccessfull(true);
        await sendNotifications(
          myMessageText ? myMessageText : '',
          currentDate,
          primaryKey,

          messagePrimaryKey,
        );
      } catch (error) {
        setModalVisibility(false);
        setUpdateConditionSuccessfull(false);
        console.log(error);
        Alert.alert('Error, please try again..');
      }
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

    /**  try {
      // Hash the concatenated IDs using SHA-256 algorithm
      const hash = crypto
        .createHash('sha256')
        .update(concatenatedIds, 'utf-8')
        .digest('hex');
      return hash; // Return the hashed hexadecimal string
    } catch (error) {
      console.error(error);
      return null;
    }
    */
  };
  const sendNotifications = async (
    myMessageText: string,
    messageDatePrimaryKey: string,
    messageId: string,

    MessagesId: string,
  ) => {
    const mediaSnapshot = await database()
      .ref('Messages')
      .child(MessagesId)
      .child('messages')
      .child(messageDatePrimaryKey)
      .child(messageId)
      .once('value');
    const media = await mediaSnapshot.child('media').val();
    const mediaType = await mediaSnapshot.child('mediaType').val();
    console.log(media);
    console.log(mediaType);
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
            body: `${name}\n${
              myMessageText ? myMessageText : ''
            }\n${currentTime} ${currentTime}`,
            image:
              mediaType === 'image'
                ? String(media)
                : 'https://th.bing.com/th/id/R.fe6399039ca8718547355547c9ee59a4?rik=s4R20WIm4Tq0sw&riu=http%3a%2f%2fwww.clipartbest.com%2fcliparts%2f9iz%2f67K%2f9iz67K8ET.png&ehk=mdcKlY7hvKZPWTXYj6EWXnaReBkpse0Kr8tWbM7U9%2fA%3d&risl=&pid=ImgRaw&r=0',

            android: {
              notification: {
                pictureStyle: 'bigText',
                picture:
                  mediaType === 'image'
                    ? String(media)
                    : 'https://th.bing.com/th/id/R.fe6399039ca8718547355547c9ee59a4?rik=s4R20WIm4Tq0sw&riu=http%3a%2f%2fwww.clipartbest.com%2fcliparts%2f9iz%2f67K%2f9iz67K8ET.png&ehk=mdcKlY7hvKZPWTXYj6EWXnaReBkpse0Kr8tWbM7U9%2fA%3d&risl=&pid=ImgRaw&r=0',
              },
            },
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

  return (
    <ScrollView
      style={{
        backgroundColor: '#000000',
        paddingTop: myMedia || receivedMyMedia ? 20 : 0,
      }}>
      <Modal
        transparent={true}
        visible={modalVisibility}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <StatusBar
            backgroundColor={'rgba(0,0,0,0.5)'}
            barStyle={'light-content'}
          />
          {updateConditionSuccessfull ? (
            <View style={styles.ProfileUpdateCardDark}>
              <Animatable.Image
                animation={'pulse'}
                iterationCount={'infinite'}
                source={require('../../../images/CheckMark.png')}
                style={[styles.UpdateProfileLogo, {height: 100, width: 100}]}
              />
              <Text style={[styles.DescriptionTextDark, {color: '#59CE8F'}]}>
                {myMediaType === 'image' || receivedMyMediaType === 'image'
                  ? 'Image sent scuccessfully!'
                  : 'Video sent succuessfully!'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisibility(false);
                  setUpdateConditionSuccessfull(false);
                  navigation.pop();
                }}>
                <Text
                  style={[styles.DescriptionTextDark, {alignSelf: 'flex-end'}]}>
                  Ok
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.ProfileUpdateCardDark}>
              <Image
                source={require('../../../images/UploadLogo.png')}
                style={styles.UpdateProfileLogo}
              />
              <Text style={styles.DescriptionTextDark}>
                Sending please wait..
              </Text>
              <ActivityIndicator
                size={25}
                color={'#FFFFFF'}
                style={{alignSelf: 'center', marginTop: 20}}
              />
            </View>
          )}
        </View>
      </Modal>
      <View
        style={[
          styles.AppCamera,
          {
            alignItems: 'center',
          },
        ]}>
        {myMedia || receivedMyMedia ? (
          <TouchableOpacity
            onPress={() => {
              if (myMedia) setMyMedia('');
              else navigation.pop();
            }}
            style={{
              alignSelf: 'flex-start',
              marginLeft: 20,
              marginTop: 10,
            }}>
            <BackIcon name="arrow-back" color={'#FFFFFF'} size={30} />
          </TouchableOpacity>
        ) : null}
        {myMedia || receivedMyMedia ? (
          <View>
            <StatusBar backgroundColor={'#000000'} barStyle={'light-content'} />
            {myMediaType === 'image' || receivedMyMediaType === 'image' ? (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 20,
                }}>
                <Image
                  source={{uri: myMedia ? myMedia : receivedMyMedia}}
                  style={{
                    resizeMode: 'contain',
                    height: 500,
                    width: 500,
                    borderRadius: 14,
                    paddingHorizontal: 10,
                    backgroundColor: '#31363F',
                  }}
                />
              </View>
            ) : (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 20,
                }}>
                {/* Centering the Video component */}
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacity
                    style={{
                      height: 500,
                      width: 500,
                    }}
                    onPress={() => {
                      setMyMediaVideoPressed(!myMediaVideoPressed);
                    }}>
                    <Video
                      source={{uri: myMedia ? myMedia : receivedMyMedia}}
                      resizeMode="contain"
                      onEnd={() => {
                        setMyMediaVideoPressed(true);
                        setMyMediaVideoPaused(true);
                      }}
                      paused={myMediaVideoPaused}
                      style={{
                        height: 500,
                        width: 500,
                        backgroundColor: 'transparent',
                      }}
                    />
                  </TouchableOpacity>
                  {myMediaVideoPressed && (
                    <TouchableOpacity
                      onPress={() => {
                        if (!myMediaVideoPaused) {
                          setMyMediaVideoPressed(!myMediaVideoPressed);
                        }
                      }}
                      style={{
                        height: 500,
                        width: 500,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        position: 'absolute',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          if (myMediaVideoPaused) {
                            setMyMediaVideoPaused(false);
                            setMyMediaVideoPressed(false);
                          } else {
                            setMyMediaVideoPaused(true);
                          }
                        }}
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <View
                          style={{
                            borderRadius: 50,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            padding: 10,
                            alignSelf: 'center',
                          }}>
                          <FlashIcon
                            color={'#FFFFFF'}
                            name={myMediaVideoPaused ? 'play-arrow' : 'pause'}
                            size={30}
                          />
                        </View>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.AppCamera}>
            <StatusBar
              backgroundColor={'transparent'}
              barStyle={'light-content'}
              translucent={true}
            />
            <Camera
              ref={cameraPhotoCaptureRef}
              style={[StyleSheet.absoluteFill, {aspectRatio: 4 / 3}]}
              device={device}
              isActive={true}
              torch={flashOn ? 'on' : 'off'}
              photo
              video
              audio
            />
            <View style={styles.CameraOptions}>
              <View
                style={{
                  alignItems: 'flex-end',
                  paddingHorizontal: 30,
                  paddingTop: 70,
                }}>
                <TouchableOpacity
                  style={{
                    marginBottom: 50,
                  }}
                  onPress={() => {
                    if (deviceCamera === 'back') {
                      setDeviceCamera('front');
                    } else {
                      setDeviceCamera('back');
                    }
                  }}>
                  <Icon
                    name={deviceCamera === 'back' ? 'camera' : 'camera-retro'}
                    size={25}
                    color={'#FFFFFF'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (deviceCamera !== 'front') {
                      setFlashOn(!flashOn);
                    }
                  }}>
                  <FlashIcon
                    name={flashOn ? 'flash-off' : 'flash-on'}
                    size={30}
                    color={'#FFFFFF'}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  height: 200,
                  width: Dimensions.get('screen').width,
                  alignSelf: 'flex-end',

                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingBottom: 50,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    paddingBottom: 20,
                    width: Dimensions.get('screen').width,
                    paddingLeft: '45%',
                  }}>
                  <Text
                    style={{
                      color: '#EABE6C',
                      marginBottom: 10,
                      marginRight: 20,
                    }}>
                    {cameraTypePhoto ? 'Image' : 'Video'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setCameraTypePhoto(!cameraTypePhoto);
                    }}>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        marginBottom: 10,
                      }}>
                      {cameraTypePhoto ? 'Video' : 'Image'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    paddingLeft: '25%',
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      setCaptured(!captured);
                      if (cameraTypePhoto) {
                        capturePhoto();
                      } else {
                        handleVideoRecording(!captured);
                      }
                    }}>
                    <View
                      style={{
                        height: 70,
                        width: 70,
                        borderRadius: 35,
                        backgroundColor: captureButtonBackgroundColor,
                        marginRight: !cameraTypePhoto ? 40 : 100,
                      }}></View>
                  </TouchableOpacity>
                  {!cameraTypePhoto && (
                    <TouchableOpacity
                      onPress={() => {
                        handleVideoPause(!isVideoPaused);
                      }}
                      style={{
                        justifyContent: 'center',
                        borderColor: '#FFFFFF',
                        borderWidth: 0.8,
                        height: 60,
                        width: 60,
                        borderRadius: 60 / 2,
                        alignItems: 'center',
                        marginEnd: 'auto',
                      }}>
                      <FlashIcon
                        name={isVideoPaused ? 'play-arrow' : 'pause'}
                        color={'#FFFFFF'}
                        size={25}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        <View>
          {myMedia || receivedMyMedia ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View>
                <TextInput
                  placeholder={'Type here..'}
                  placeholderTextColor={'#6c757d'}
                  style={styles.TextInputDark}
                  onChangeText={e => {
                    setMyMessageText(e.replace(/\s+$/, ''));
                  }}
                  maxLength={300}></TextInput>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (receivedMyMedia && receivedMyMediaType) {
                    sendMessage(receivedMyMedia, receivedMyMediaType);
                  } else {
                    sendMessage(String(myMedia), String(myMediaType));
                  }
                }}
                style={{
                  backgroundColor: '#31363F',
                  height: 50,
                  width: 50,
                  borderRadius: 50 / 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Icon name="send" size={20} color={'#FFFFFF'} />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
};

export default AppCamera;

const styles = StyleSheet.create({
  AppCamera: {
    flex: 1,
    backgroundColor: '#000000',
  },
  CameraOptions: {
    height: Dimensions.get('screen').height,
    width: Dimensions.get('screen').width,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },

  TextInputDark: {
    marginTop: 10,
    marginBottom: 10,
    fontWeight: 'bold',
    fontSize: 15,

    height: 50,
    borderRadius: 24,
    backgroundColor: '#31363F',
    borderColor: '#F5F7F8',
    textAlign: 'left',
    textAlignVertical: 'center',
    color: '#FFFFFF',
    width: 320,
    paddingLeft: 10,
    marginRight: 10,
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
});
