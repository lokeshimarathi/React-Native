import {
  View,
  Text,
  useColorScheme,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ImageLibraryOptions,
  MediaType,
  launchImageLibrary,
} from 'react-native-image-picker';
import Video from 'react-native-video';
import Icons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import {child} from 'firebase/database';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';
const Ask = () => {
  const light = useColorScheme() === 'light';
  const [problemDescription, setProblemDescription] = useState<string>();
  const [media, setMedia] = useState<string | null>();
  const [mediaType, setMediaType] = useState<string>();
  const [pressed, setPressed] = useState<boolean>(false);
  const [controlOption, setControlOption] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const [modalVisibility, setModalVisibility] = useState<boolean>(false);
  const [updateConditionSuccessfull, setUpdateConditionSuccessfull] =
    useState<boolean>(false);
  const mediaOptions: ImageLibraryOptions = {
    mediaType: 'mixed' as MediaType,
    maxHeight: 900,
    maxWidth: 900,
    quality: 0.8,
    videoQuality: 'high',
  };
  const handleMedia = async () => {
    const result = await launchImageLibrary(mediaOptions);
    if (!result.didCancel && !result.errorCode) {
      const firstAsset = result.assets?.[0];
      if (firstAsset) {
        setMedia(firstAsset.uri);
        const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg)$/i;
        if (imageExtensions.test(String(firstAsset.uri))) {
          setMediaType('image');
        } else {
          setMediaType('video');
        }
      }
    }
  };

  const upload = async () => {
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
      hour12: true,
    });
    const currentDate = dateFormat.format(new Date());
    const currentTime = timeFormat.format(new Date());
    const primaryKey = Math.floor(new Date().getTime() / 1000);
    const user = auth().currentUser;
    if (user) {
      const authUserId = user.uid;
      const snapshot = database().ref(`Posts/${primaryKey}/`);
      if (media) {
        const response = await fetch(media);
        const blob = await response.blob();
        const storageRef = storage().ref(`Posts/${primaryKey}/${authUserId}/`);
        await storageRef.put(blob);
        const referenceUrl = await storageRef.getDownloadURL();
        await snapshot.child('problemMedia').set(referenceUrl);
        await snapshot.child('mediaType').set(mediaType);
      }
      await snapshot.child('authUserId').set(String(authUserId));
      await snapshot
        .child('problemDescription')
        .set(String(problemDescription));
      await snapshot.child('time').set(String(currentTime));
      await snapshot.child('date').set(String(currentDate));

      await snapshot.child('solutionCount').set(0);
      await snapshot
        .child('problemStatus')
        .set('notSolved')
        .then(async () => {
          await sendNotification(String(primaryKey));
        });
      setProblemDescription('');
      setMedia(null);
      setUpdateConditionSuccessfull(true);
    }
  };

  const sendNotification = async (postId: string) => {
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
      const problemMedia = await postSnapshot.child('problemMedia').val();
      const mediaType = await postSnapshot.child('mediaType').val();
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
      const snapshot = await database().ref('Users').once('value');
      const data = await snapshot.val();

      for (const authUserId in data) {
        if (authUserId !== myAuthUserId) {
          const tokens = snapshot.child(authUserId).child('token').val();
          [tokens].forEach(async token => {
            if (token) {
              try {
                if (problemMedia) {
                  let data;
                  if (mediaType === 'image') {
                    data = {
                      data: {
                        postId: postId,
                        currentDate: currentDate,
                        currentTime: currentTime,
                        relatedPage: 'Public',
                        notificationType: 'postNotification',
                      },
                      notification: {
                        deepLink: 'Discover://Public',
                        title: name,
                        body: `${problemDescription}\n${date} ${time}\n${mediaType}`,
                        image: problemMedia,
                        android: {
                          notification: {
                            pictureStyle: 'bigPicture',
                            picture: problemMedia,
                          },
                        },
                      },
                      to: token,
                    };
                  } else {
                    data = {
                      data: {
                        postId: postId,
                        date: date,
                        time: time,
                        relatedPage: 'Public',
                        notificationType: 'postNotification',
                      },
                      notification: {
                        deepLink: 'Discover://Public',
                        title: name,
                        body: `${problemDescription}\n${date} ${time}\n${mediaType}`,
                        image:
                          'https://th.bing.com/th/id/R.fe6399039ca8718547355547c9ee59a4?rik=s4R20WIm4Tq0sw&riu=http%3a%2f%2fwww.clipartbest.com%2fcliparts%2f9iz%2f67K%2f9iz67K8ET.png&ehk=mdcKlY7hvKZPWTXYj6EWXnaReBkpse0Kr8tWbM7U9%2fA%3d&risl=&pid=ImgRaw&r=0',
                        android: {
                          notification: {
                            pictureStyle: 'bigPicture',
                            picture:
                              'https://th.bing.com/th/id/R.fe6399039ca8718547355547c9ee59a4?rik=s4R20WIm4Tq0sw&riu=http%3a%2f%2fwww.clipartbest.com%2fcliparts%2f9iz%2f67K%2f9iz67K8ET.png&ehk=mdcKlY7hvKZPWTXYj6EWXnaReBkpse0Kr8tWbM7U9%2fA%3d&risl=&pid=ImgRaw&r=0',
                          },
                        },
                      },
                      to: token,
                    };
                  }

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
                } else {
                  const data = {
                    data: {
                      postId: postId,
                      currentDate: currentDate,
                      currentTime: currentTime,
                      relatedPage: 'Public',
                      notificationType: 'postNotification',
                    },
                    notification: {
                      deepLink: 'Discover://Public',
                      title: name,
                      body: `${problemDescription}\n${date} ${time}`,
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
              } catch (err) {
                console.error(err);
              }
            }
          });
        }
      }
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
                Problem posted successfully! you will be notified once you
                receive solution
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
                    {alignSelf: 'flex-end', bottom: 0},
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
                Please wait posting your problem..
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
      <ScrollView>
        <View style={styles.headerContainer}>
          <Text style={light ? styles.textLight : styles.textDark}>
            Ask questions
          </Text>
          <Text
            style={
              light ? styles.DescriptionTextLight : styles.DescriptionTextDark
            }>
            Inquire openly, and discover solutions effortlessly.
          </Text>
        </View>
        <View style={styles.CenterContainer}>
          <View style={light ? styles.InputFieldLight : styles.InputFieldDark}>
            <TextInput
              placeholder="Please decribe your question here..."
              placeholderTextColor={'#6c757d'}
              style={light ? styles.TextInputLight : styles.TextInputDark}
              multiline={true}
              maxLength={300}
              value={problemDescription}
              onChangeText={setProblemDescription}></TextInput>
            <View style={styles.BottomView}>
              <Text
                style={
                  light
                    ? styles.DescriptionTextLight
                    : styles.DescriptionTextDark
                }>
                Attach media
              </Text>
              <TouchableOpacity
                onPress={() => {
                  handleMedia();
                  setPaused(false);
                  setPressed(false);
                }}>
                <Image
                  source={require('../../images/AddIcon.png')}
                  style={styles.GalleryIcon}
                />
              </TouchableOpacity>
            </View>
            {media ? (
              mediaType === 'image' ? (
                <View>
                  <TouchableOpacity
                    onLongPress={() => {
                      setPressed(true);
                    }}>
                    <Image source={{uri: media}} style={styles.AttachedMedia} />
                  </TouchableOpacity>
                  {pressed && (
                    <TouchableOpacity
                      onPress={() => {
                        setPressed(false);
                      }}
                      style={{
                        backgroundColor: 'rgba(0,0,0,.5)',
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
                            setPressed(false);
                            setMedia(null);
                          }}>
                          <Icon
                            style={{color: '#FFFFFF'}}
                            name="delete"
                            size={25}
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <TouchableOpacity onPress={() => {}}>
                  <TouchableOpacity
                    onLongPress={() => {
                      setPressed(true);
                      setControlOption(false);
                    }}
                    onPress={() => {
                      setPressed(true);
                      setControlOption(!controlOption);
                    }}>
                    <View style={{borderRadius: 14}}>
                      <Video
                        paused={paused}
                        resizeMode="cover"
                        source={{uri: media}}
                        style={styles.AttachedVideo}
                      />
                    </View>
                  </TouchableOpacity>
                  {pressed && (
                    <TouchableOpacity
                      onPress={() => {
                        if (!paused) {
                          setPressed(false);
                        }
                      }}
                      style={{
                        backgroundColor: 'rgba(0,0,0,.5)',
                        position: 'absolute',
                        height: 180,
                        width: Dimensions.get('screen').width - 80,
                        borderRadius: 14,
                        marginBottom: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <View>
                        {controlOption ? (
                          <TouchableOpacity
                            onPress={() => {
                              setPaused(!paused);
                            }}>
                            <Icon
                              style={{color: '#FFFFFF'}}
                              name={paused ? 'play-arrow' : 'pause'}
                              size={25}
                            />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onPress={() => {
                              setPressed(false);
                              setMedia(null);
                              setPaused(false);
                            }}>
                            <Icon
                              style={{color: '#FFFFFF'}}
                              name="delete"
                              size={25}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              )
            ) : (
              <View></View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => {
              if (problemDescription) {
                upload();
              } else {
                Alert.alert('Please define problem...');
              }
            }}
            style={styles.SendButton}>
            <Text
              style={[
                light
                  ? styles.DescriptionTextLight
                  : styles.DescriptionTextDark,
                {marginLeft: 10},
              ]}>
              upload
            </Text>
            <Image
              source={require('../../images/UppIcon.png')}
              style={[styles.GalleryIcon, {alignSelf: 'center'}]}
            />
          </TouchableOpacity>
          <View></View>
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  CenterContainer: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 30,
  },
  HelpLogo: {
    height: 250,
    width: 250,
    paddingTop: 20,
    marginTop: 20,
  },
  containerLight: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    width: Dimensions.get('window').width,
  },
  textLight: {
    color: '#121212',
    fontSize: 20,
    fontWeight: 'bold',
    marginEnd: 'auto',
  },
  textDark: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginEnd: 'auto',
  },
  DescriptionTextLight: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: 'bold',
    marginEnd: 'auto',
  },
  DescriptionTextDark: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: 'bold',
    marginEnd: 'auto',
  },
  MainContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    flexDirection: 'column',
    marginTop: 'auto',
    marginBottom: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  ProblemInformationContainerLight: {
    marginBottom: 30,
    paddingEnd: 'auto',
    borderRadius: 14,
    backgroundColor: '#EEF5FF',
    paddingLeft: 10,
    opacity: 0.8,
    width: 380,
    height: 300,
    alignSelf: 'center',
  },
  ProblemInformationContainerDark: {
    marginBottom: 30,
    paddingEnd: 'auto',
    borderRadius: 14,
    backgroundColor: '#191919',
    paddingLeft: 10,
    opacity: 0.8,
    width: 380,
    height: 300,
    alignSelf: 'center',
  },
  InputFieldLight: {
    fontWeight: 'bold',
    fontSize: 15,
    borderWidth: 1,

    marginTop: 10,
    marginBottom: 10,
    width: Dimensions.get('screen').width - 40,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderColor: '#F5F7F8',
    textAlign: 'left',
    textAlignVertical: 'top',
    color: '#000000',
    padding: 10,
    shadowColor: '#1D24CA',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    elevation: 15,
    shadowRadius: 3.84,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  InputFieldDark: {
    fontWeight: 'bold',
    fontSize: 15,

    marginTop: 10,
    marginBottom: 10,
    width: Dimensions.get('screen').width - 40,
    borderRadius: 14,
    backgroundColor: '#2D3250',
    borderColor: '#F5F7F8',
    textAlign: 'left',
    textAlignVertical: 'top',
    color: '#000000',
    padding: 10,
    shadowColor: '#1D24CA',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    elevation: 15,
    shadowRadius: 3.84,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  TextInputLight: {
    fontWeight: 'bold',
    fontSize: 15,
    borderWidth: 1,
    height: 200,
    width: 350,
    borderRadius: 7,
    backgroundColor: '#EEF5FF',
    borderColor: '#F5F7F8',
    textAlign: 'left',
    textAlignVertical: 'top',
    color: '#000000',
  },
  TextInputDark: {
    fontWeight: 'bold',
    fontSize: 15,
    borderWidth: 1,
    height: 200,
    borderRadius: 7,
    backgroundColor: '#EEF5FF',
    borderColor: '#F5F7F8',
    textAlign: 'left',
    textAlignVertical: 'top',
    color: '#000000',
    width: 350,
  },
  UploadSection: {
    flexDirection: 'row',
    flex: 1,
  },

  BottomView: {
    height: 60,
    marginLeft: 80,
    alignSelf: 'flex-end',
    paddingEnd: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    padding: 10,

    marginTop: 10,
  },
  GalleryIcon: {
    height: 30,
    width: 30,
    margin: 10,
    alignSelf: 'flex-end',
  },

  SendButton: {
    margin: 10,
    borderRadius: 30,
    backgroundColor: '#EEF5FF',
    paddingHorizontal: 10,
    paddingLeft: 10,

    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D24CA',
    shadowOpacity: 10,
    elevation: 10,
    alignSelf: 'flex-end',
    paddingEnd: 'auto',
    marginRight: 40,
    flexDirection: 'row',
  },
  AttachedMedia: {
    resizeMode: 'cover',
    height: 180,
    width: Dimensions.get('screen').width - 80,
    borderRadius: 14,
    marginBottom: 10,
  },
  AttachedVideo: {
    height: 180,
    width: Dimensions.get('screen').width - 80,
    borderRadius: 14,
    marginBottom: 10,
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

export default Ask;
