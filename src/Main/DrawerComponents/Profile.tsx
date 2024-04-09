import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  PermissionsAndroid,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Touchable,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import auth, {firebase} from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import Ionicons from 'react-native-vector-icons/Ionicons';
import storage from '@react-native-firebase/storage';
import {
  ImageLibraryOptions,
  MediaType,
  launchImageLibrary,
} from 'react-native-image-picker';
import * as Animatable from 'react-native-animatable';
import Geolocation from '@react-native-community/geolocation';
import {RootStackParamList} from '../../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
type ProfileProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const Profile = ({navigation, route}: ProfileProps) => {
  const light = useColorScheme() === 'light';
  const [backgroundImage, setBackgroundImage] = useState<string>();
  const [profileImage, setProfileImage] = useState<string>();
  const [name, setName] = useState<string>();
  const [username, setUsername] = useState<string>();
  const [dateOfBirth, setDateOfBirth] = useState<string>();
  const [gender, setGender] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [language, setLanguage] = useState<string>();
  const [interest, setInterest] = useState<string>();
  const [companyOrSchool, setCompanyOrSchool] = useState<string>();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [profession, setProfession] = useState<string>();
  const [about, setAbout] = useState<string>();
  const [location, setLocation] = useState<{
    latitude: string;
    longitude: string;
  }>();
  const [password, setPassword] = useState<string>();
  const [isGenderSelectionMenu, setIsGenderSelectionMenu] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showImageSelectionOption, setShowImageSelectionOption] =
    useState<boolean>(false);
  const [changeRequest, setChangeRequest] = useState<string>();
  const [newBackgroundImage, setNewBackgroundImage] = useState<string>();
  const [newProfileImage, setNewProfileImage] = useState<string>();
  const [statusBarBackgroundColor, setStatusBarBackgroundColor] =
    useState<string>('transparent');
  const [myAuthUserId, setMyAuthUserId] = useState<string>();
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean>(true);
  const [currentPassword, setCurrentPassword] = useState<string>();
  const [updateConditionSuccessfull, setUpdateConditionSuccessfull] =
    useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const screenWidth = Dimensions.get('window').width;
  const genderMenu = [
    {id: 1, label: 'Male'},
    {id: 2, label: 'Female'},
    {id: 3, label: 'Other'},
    {id: 4, label: 'Custom'},
  ];
  const [cloudBackgroundImage, setCloudBackgroundImage] = useState<string>('');
  const [activityIndicatorVisibility, setActivityIndicatorVisibility] =
    useState<boolean>(false);
  const [modalVisibility, setModalVisibility] = useState<boolean>(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const genderSelection = () => {
    setIsGenderSelectionMenu(true);
  };
  const handleConfirm = (date: Date) => {
    const today = new Date();
    if (date > today) {
      Alert.alert('Cannot select date..!');
      hideDatePicker();
    } else {
      const adjustedDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000,
      );

      setDateOfBirth(adjustedDate.toISOString().substring(0, 10));
      hideDatePicker();
    }
  };

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      const image = (
        await database().ref('Contents').child('backgroundImage').once('value')
      ).val();
      setCloudBackgroundImage(image);
    };
    fetchBackgroundImage();
  }, []);

  const backgroundImageOptions: ImageLibraryOptions = {
    mediaType: 'photo' as MediaType,
    maxWidth: 600, // Maximum width of the image
    maxHeight: 300, // Maximum height of the image
    quality: 0.8,
  };
  const profileImageOptions: ImageLibraryOptions = {
    mediaType: 'photo' as MediaType,
    maxWidth: 300, // Maximum width of the image
    maxHeight: 300, // Maximum height of the image
    quality: 0.8,
  };
  const handleProfileImageSelection = async () => {
    const result = await launchImageLibrary(profileImageOptions);
    if (!result?.didCancel && !result.errorCode) {
      const firstAsset = result.assets?.[0];
      if (firstAsset) {
        setNewProfileImage(firstAsset.uri);
      } else {
        Alert.alert('No image is selected...');
      }
    } else {
      Alert.alert('Canceled');
    }
  };
  const handleBackgroundImageSelection = async () => {
    const result = await launchImageLibrary(backgroundImageOptions);
    if (!result?.didCancel && !result.errorCode) {
      const firstAsset = result.assets?.[0];
      if (firstAsset) {
        setNewBackgroundImage(firstAsset.uri);
      } else {
        Alert.alert('No image is selected...');
      }
    } else {
      Alert.alert('Canceled');
    }
  };

  useEffect(() => {
    setModalVisibility(true);
    setActivityIndicatorVisibility(true);
    const user = auth().currentUser;
    const authUserId = user?.uid;
    setMyAuthUserId(authUserId);
    const databaseRef = database().ref(`Users/${authUserId}/`);
    databaseRef.on('value', async snapshot => {
      const data = await snapshot.val();
      if (data) {
        setBackgroundImage(data.backgroundImage);
        setProfileImage(data.profileImage);
        setEmail(data.email);
        setName(data.name);
        setUsername(data.username);
        setDateOfBirth(data.dateOfBirth);
        setGender(data.gender);
        setLanguage(data.language);
        setInterest(data.interest);
        setCompanyOrSchool(data.companyOrSchool);
        setProfession(data.profession);
        setLocation({
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        });
        setEmail(String(data.email));
        setPassword(data.password);
        setCurrentPassword(data.password);
        setAbout(data.about);
        setModalVisibility(false);
        setActivityIndicatorVisibility(false);
      } else {
        setModalVisibility(false);
        setActivityIndicatorVisibility(false);
        Alert.alert('No data!');
      }
      setModalVisibility(false);
      setActivityIndicatorVisibility(false);
    });
    return () => {
      databaseRef.off();
    };
  }, []);

  const handleDeleteBackngroundImage = async () => {
    const user = auth().currentUser;
    if (user) {
      const authUserId = user.uid;
      try {
        await database()
          .ref(`Users/${authUserId}`)
          .update({backgroundImage: null});
        setShowImageSelectionOption(false);
        setNewBackgroundImage('');
        Alert.alert('Background Image Deleted...');
      } catch (error) {
        setShowImageSelectionOption(false);
        console.log(error);
        Alert.alert('Error, please try again..!');
      }
    }
  };
  const handleDeleteProfileImage = async () => {
    const user = auth().currentUser;
    if (user) {
      const authUserId = user.uid;
      try {
        await database()
          .ref(`Users/${authUserId}`)
          .update({profileImage: null});
        setShowImageSelectionOption(false);
        Alert.alert('Profile Image Deleted...');
      } catch (error) {
        setShowImageSelectionOption(false);
        console.log(error);
        Alert.alert('Error, please try again..!');
      }
    }
  };

  useEffect(() => {
    const usernameAvailabilityCheck = async () => {
      const user = auth().currentUser;
      if (user) {
        const authUserId = user.uid;
        const snapshot = await database()
          .ref('Users')
          .orderByChild('username')
          .equalTo(String(username))
          .once('value');
        const data = await snapshot.val();
        if (data) {
          for (const key in data) {
            if (key) {
              if (key !== authUserId) {
                setIsUsernameAvailable(false);
              } else {
                setIsUsernameAvailable(true);
              }
            } else {
              setIsUsernameAvailable(true);
            }
          }
        } else {
          setIsUsernameAvailable(true);
        }
      }
    };
    usernameAvailabilityCheck();
  }, [username]);

  const reAuthenticate = () => {
    const user = firebase.auth().currentUser;
    if (user) {
      console.log(currentPassword);
      try {
        const credential = firebase.auth.EmailAuthProvider.credential(
          String(user.email),
          String(currentPassword),
        );
        return user.reauthenticateWithCredential(credential);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const updateUserData = async () => {
    setModalVisibility(true);
    setActivityIndicatorVisibility(false);
    setUpdateConditionSuccessfull(false);
    setUpdating(true);
    const user = firebase.auth().currentUser;

    if (user) {
      const authUserId = user.uid;

      const reference = database().ref(`Users/${authUserId}/`);

      if (newBackgroundImage) {
        const UserbackgroundImage = await fetch(newBackgroundImage);
        const blob = await UserbackgroundImage.blob();
        const storageReference = storage().ref(
          `Users/${authUserId}/backgroundImage/`,
        );

        try {
          await storageReference.put(blob);
          const backgroundImageUri = await storageReference.getDownloadURL();
          await reference.child('backgroundImage').set(backgroundImageUri);
        } catch (error) {
          console.log(error);
          Alert.alert(
            'Error in uploading background image\nplease try again...',
          );
        }
      }
      if (newProfileImage) {
        const UserProfileImage = await fetch(newProfileImage);
        const blob = await UserProfileImage.blob();
        const storageReference = storage().ref(
          `Users/${authUserId}/profileImage`,
        );
        try {
          await storageReference.put(blob);
          const profileImageUri = await storageReference.getDownloadURL();
          await reference.child('profileImage').set(profileImageUri);
        } catch (error) {
          console.log(error);
          Alert.alert('Error in uploading profile image\nplease try again...');
        }
      }

      await reference.child('name').set(name);
      await reference.child('username').set(username);
      await reference.child('email').set(user.email);
      await reference.child('gender').set(gender);
      await reference.child('dateOfBirth').set(dateOfBirth);
      await reference.child('location').set(location);
      await reference.child('language').set(language);
      await reference.child('interest').set(interest);
      await reference.child('companyOrSchool').set(companyOrSchool);
      await reference.child('profession').set(profession);

      await reference
        .child('about')
        .set(about)
        .then(async () => {
          await reAuthenticate();
          await user.updatePassword(String(password));
          await reference.child('password').set(password);
          setModalVisibility(true);
          setActivityIndicatorVisibility(false);
          setUpdateConditionSuccessfull(true);
          setUpdating(false);
        });
    }
  };

  return (
    <View
      style={
        light ? styles.ProfileContainerLight : styles.ProfileContainerDark
      }>
      <StatusBar
        barStyle={light ? 'light-content' : 'light-content'}
        backgroundColor={statusBarBackgroundColor}
        translucent={true}
      />
      <Modal
        transparent={true}
        visible={modalVisibility}
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
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          {activityIndicatorVisibility ? (
            <>
              <View style={styles.ProfileLoading}>
                <Text
                  style={
                    light
                      ? styles.DescriptionTextLight
                      : styles.DescriptionTextDark
                  }>
                  Fetching account details..
                </Text>
                <ActivityIndicator
                  size={25}
                  color={light ? '#35374B' : '#FFFFFF'}
                  style={{alignSelf: 'center', marginTop: 20}}
                />
              </View>
            </>
          ) : (
            <>
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
                    style={[
                      styles.UpdateProfileLogo,
                      {height: 100, width: 100},
                    ]}
                  />
                  <Text
                    style={[
                      light
                        ? styles.DescriptionTextLight
                        : styles.DescriptionTextDark,
                      {color: '#59CE8F'},
                    ]}>
                    Profile updated successfully!
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisibility(false);
                      setUpdateConditionSuccessfull(false);
                      setUpdating(false);
                    }}>
                    <Text
                      style={[
                        light
                          ? styles.DescriptionTextLight
                          : styles.DescriptionTextDark,
                        {alignSelf: 'flex-end'},
                      ]}>
                      Ok
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {updating ? (
                    <View
                      style={
                        light
                          ? styles.ProfileUpdateCardLight
                          : styles.ProfileUpdateCardDark
                      }>
                      <Image
                        source={require('../../images/ProfileUpdateLogo.png')}
                        style={styles.UpdateProfileLogo}
                      />
                      <Text
                        style={
                          light
                            ? styles.DescriptionTextLight
                            : styles.DescriptionTextDark
                        }>
                        Please wait updating your profile..
                      </Text>
                      <ActivityIndicator
                        size={25}
                        color={light ? '#35374B' : '#FFFFFF'}
                        style={{alignSelf: 'center', marginTop: 20}}
                      />
                    </View>
                  ) : (
                    <>
                      <View
                        style={
                          light
                            ? styles.ProfileUpdateCardLight
                            : styles.ProfileUpdateCardDark
                        }>
                        <Image
                          source={require('../../images/ErrorIcon.jpg')}
                          style={[
                            styles.UpdateProfileLogo,
                            {height: 200, width: 200},
                          ]}
                        />
                        <Text
                          style={
                            light
                              ? styles.DescriptionTextLight
                              : styles.DescriptionTextDark
                          }>
                          Error please try again..
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setModalVisibility(false);
                            setUpdateConditionSuccessfull(false);
                            setUpdating(false);
                          }}>
                          <Text
                            style={[
                              light
                                ? styles.DescriptionTextLight
                                : styles.DescriptionTextDark,
                              {alignSelf: 'flex-end'},
                            ]}>
                            Ok
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </View>
      </Modal>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={() => {
          setStatusBarBackgroundColor('transparent');
        }}
        onScroll={() => {
          if (light) {
            setStatusBarBackgroundColor('#FFFFFF');
          } else {
            setStatusBarBackgroundColor('#000000');
          }
        }}>
        <View style={styles.MainContainer}>
          <TouchableOpacity
            onPress={() => {
              setChangeRequest('backgroundImage');
              if (backgroundImage) {
                setShowImageSelectionOption(true);
              } else {
                handleBackgroundImageSelection();
              }
            }}>
            <Image
              source={
                newBackgroundImage
                  ? {uri: newBackgroundImage}
                  : backgroundImage
                  ? {uri: backgroundImage}
                  : {uri: cloudBackgroundImage}
              }
              style={styles.BackgroundImage}
            />
          </TouchableOpacity>

          <View style={styles.profileImageContainer}>
            <TouchableOpacity
              onPress={() => {
                setChangeRequest('profileImage');
                if (profileImage) {
                  setShowImageSelectionOption(true);
                } else {
                  handleProfileImageSelection();
                }
              }}>
              <Image
                source={
                  newProfileImage
                    ? {uri: newProfileImage}
                    : profileImage
                    ? {uri: profileImage}
                    : {
                        uri: 'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg',
                      }
                }
                style={
                  light ? styles.profileImageLight : styles.profileImageDark
                }
              />
            </TouchableOpacity>
          </View>
          <Modal
            transparent={true}
            visible={showImageSelectionOption}
            style={{alignSelf: 'center'}}>
            {changeRequest === 'backgroundImage' ? (
              <View
                style={
                  light
                    ? {
                        backgroundColor: '#FFFFFF',
                        height: 150,
                        width: 300,
                        alignSelf: 'center',
                        elevation: 2,
                        borderRadius: 5,
                        margin: '60%',
                      }
                    : {
                        backgroundColor: '#000000',
                        height: 150,
                        width: 300,
                        alignSelf: 'center',
                        elevation: 2,
                        borderRadius: 5,
                        margin: '60%',
                      }
                }>
                <TouchableOpacity
                  onPress={() => {
                    setShowImageSelectionOption(false);
                    handleBackgroundImageSelection();
                  }}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 18,
                      color: '#c0c0c0',
                      textAlign: 'left',
                      marginVertical: 5,
                      marginHorizontal: 10,
                      borderBottomColor: '#d3d3d3',
                      borderTopWidth: 0,
                      borderWidth: 1,
                      borderStartWidth: 0,
                      borderEndWidth: 0,
                      borderLeftWidth: 0,
                      borderRightWidth: 0,
                    }}>
                    Select Background Image
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDeleteBackngroundImage}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 18,
                      color: '#c0c0c0',
                      textAlign: 'left',
                      marginVertical: 5,
                      marginHorizontal: 10,
                      borderBottomColor: '#d3d3d3',
                      borderTopWidth: 0,
                      borderWidth: 1,
                      borderStartWidth: 0,
                      borderEndWidth: 0,
                      borderLeftWidth: 0,
                      borderRightWidth: 0,
                    }}>
                    Delete Background Image
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowImageSelectionOption(false);
                  }}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 18,
                      color: '#c0c0c0',
                      textAlign: 'left',
                      marginVertical: 5,
                      marginHorizontal: 10,
                      borderBottomColor: '#d3d3d3',
                      borderTopWidth: 0,
                      borderWidth: 1,
                      borderStartWidth: 0,
                      borderEndWidth: 0,
                      borderLeftWidth: 0,
                      borderRightWidth: 0,
                    }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={
                  light
                    ? {
                        backgroundColor: '#FFFFFF',
                        height: 150,
                        width: 300,
                        alignSelf: 'center',
                        elevation: 2,
                        borderRadius: 5,
                        margin: '60%',
                      }
                    : {
                        backgroundColor: '#000000',
                        height: 150,
                        width: 300,
                        alignSelf: 'center',
                        elevation: 2,
                        borderRadius: 5,
                        margin: '60%',
                      }
                }>
                <TouchableOpacity
                  onPress={() => {
                    setShowImageSelectionOption(false);
                    handleProfileImageSelection();
                  }}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 18,
                      color: '#c0c0c0',
                      textAlign: 'left',
                      marginVertical: 5,
                      marginHorizontal: 10,
                      borderBottomColor: '#d3d3d3',
                      borderTopWidth: 0,
                      borderWidth: 1,
                      borderStartWidth: 0,
                      borderEndWidth: 0,
                      borderLeftWidth: 0,
                      borderRightWidth: 0,
                    }}>
                    Select Profile Image
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDeleteProfileImage}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 18,
                      color: '#c0c0c0',
                      textAlign: 'left',
                      marginVertical: 5,
                      marginHorizontal: 10,
                      borderBottomColor: '#d3d3d3',
                      borderTopWidth: 0,
                      borderWidth: 1,
                      borderStartWidth: 0,
                      borderEndWidth: 0,
                      borderLeftWidth: 0,
                      borderRightWidth: 0,
                    }}>
                    Delete Profile Image
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowImageSelectionOption(false);
                  }}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 18,
                      color: '#c0c0c0',
                      textAlign: 'left',
                      marginVertical: 5,
                      marginHorizontal: 10,
                      borderBottomColor: '#d3d3d3',
                      borderTopWidth: 0,
                      borderWidth: 1,
                      borderStartWidth: 0,
                      borderEndWidth: 0,
                      borderLeftWidth: 0,
                      borderRightWidth: 0,
                    }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Modal>

          <View style={styles.ProfileContainer}>
            <View
              style={
                light
                  ? styles.AccountInformationContainerLight
                  : styles.AccountInformationContainerDark
              }>
              <View style={{height: 60, marginTop: 10}}>
                <Text
                  style={
                    light ? styles.HeaderTextLight : styles.HeaderTextDark
                  }>
                  📛 Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={
                    light ? styles.TextInputLight : styles.TextInputDark
                  }></TextInput>
              </View>
              <View
                style={light ? styles.DividerLight : styles.DividerDark}></View>
              <View style={{height: 60}}>
                <Text
                  style={
                    light ? styles.HeaderTextLight : styles.HeaderTextDark
                  }>
                  👤 Username
                </Text>
                <TextInput
                  value={username}
                  onChangeText={e => {
                    const regex = /[!@#$%^&*(),.?":{}|<>\s]/g;
                    setUsername(e.replace(regex, ''));
                  }}
                  style={
                    isUsernameAvailable
                      ? light
                        ? styles.TextInputLight
                        : styles.TextInputDark
                      : [
                          light ? styles.TextInputLight : styles.TextInputDark,
                          {color: '#F57D1F'},
                        ]
                  }></TextInput>
              </View>
              <View
                style={light ? styles.DividerLight : styles.DividerDark}></View>
              <View style={{height: 60}}>
                <Text
                  style={
                    light ? styles.HeaderTextLight : styles.HeaderTextDark
                  }>
                  📧 Email
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.push('EmailChange');
                  }}>
                  <Text
                    style={[
                      light ? styles.TextInputLight : styles.TextInputDark,
                      {marginTop: 10, color: '#73BBC9'},
                    ]}>
                    {email}
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={light ? styles.DividerLight : styles.DividerDark}></View>

              <View style={{height: 60}}>
                <Text
                  style={
                    light ? styles.HeaderTextLight : styles.HeaderTextDark
                  }>
                  🔐 Password
                </Text>
                <View style={{flexDirection: 'row'}}>
                  <TextInput
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={e => {
                      setPassword(e.replace(/\s/g, ''));
                    }}
                    style={
                      password
                        ? password.length >= 8
                          ? light
                            ? styles.TextInputLight
                            : styles.TextInputDark
                          : [
                              light
                                ? styles.TextInputLight
                                : styles.TextInputDark,
                              {color: '#F57D1F'},
                            ]
                        : light
                        ? styles.TextInputLight
                        : styles.TextInputDark
                    }></TextInput>
                  <TouchableOpacity
                    onPress={() => {
                      if (!showPassword) {
                        setShowPassword(true);
                      } else {
                        setShowPassword(false);
                      }
                    }}>
                    <Ionicons
                      name={!showPassword ? 'eye' : 'eye-off'}
                      size={25}
                      color={light ? '#121212' : '#FFFFFF'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={light ? styles.DividerLight : styles.DividerDark}></View>
            </View>
            <View
              style={
                light
                  ? styles.AccountInformationContainerLight
                  : styles.AccountInformationContainerDark
              }>
              <Text
                style={[
                  light ? styles.HeaderTextLight : styles.HeaderTextDark,
                  {marginBottom: 10, marginTop: 10},
                ]}>
                🧒🏻 Gender
              </Text>
              <TouchableOpacity onPress={genderSelection}>
                {gender !== '' ? (
                  <View>
                    <Text
                      style={
                        light ? styles.TextInputLight : styles.TextInputDark
                      }>
                      {gender}
                    </Text>
                    <View
                      style={
                        light ? styles.DividerLight : styles.DividerDark
                      }></View>
                  </View>
                ) : (
                  <View>
                    <Text
                      style={
                        light ? styles.TextInputLight : styles.TextInputDark
                      }>
                      select Gender
                    </Text>
                    <View
                      style={
                        light ? styles.DividerLight : styles.DividerDark
                      }></View>
                  </View>
                )}
              </TouchableOpacity>
              {isGenderSelectionMenu ? (
                <View
                  style={
                    light
                      ? {
                          backgroundColor: '#FFFFFF',
                          height: 150,
                          width: 300,
                          alignSelf: 'center',
                          elevation: 2,
                          borderRadius: 5,
                        }
                      : {
                          backgroundColor: '#121212',
                          height: 150,
                          width: 300,
                          alignSelf: 'center',
                          elevation: 2,
                          borderRadius: 5,
                        }
                  }>
                  <FlatList
                    data={genderMenu}
                    keyExtractor={item => item.id.toFixed()}
                    renderItem={({item}) => {
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            setGender(item.label);
                            setIsGenderSelectionMenu(false);
                          }}>
                          <Text
                            style={{
                              fontWeight: 'bold',
                              fontSize: 18,
                              color: '#c0c0c0',
                              textAlign: 'left',
                              marginVertical: 5,
                              marginHorizontal: 10,
                              borderBottomColor: '#d3d3d3',
                              borderTopWidth: 0,
                              borderWidth: 1,
                              borderStartWidth: 0,
                              borderEndWidth: 0,
                              borderLeftWidth: 0,
                              borderRightWidth: 0,
                            }}>
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              ) : (
                <View></View>
              )}
              <Text
                style={[
                  light ? styles.HeaderTextLight : styles.HeaderTextDark,
                  {marginBottom: 10},
                ]}>
                📆 Date of Birth
              </Text>
              <TouchableOpacity onPress={showDatePicker}>
                {dateOfBirth !== '' ? (
                  <Text
                    style={
                      light ? styles.TextInputLight : styles.TextInputDark
                    }>
                    {dateOfBirth}
                  </Text>
                ) : (
                  <Text
                    style={
                      light ? styles.TextInputLight : styles.TextInputDark
                    }>
                    select date of birth
                  </Text>
                )}
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
              <View
                style={light ? styles.DividerLight : styles.DividerDark}></View>
              <View style={{height: 70}}>
                <Text
                  style={
                    light ? styles.HeaderTextLight : styles.HeaderTextDark
                  }>
                  📌 Location
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.push('LocationChange');
                  }}>
                  <Text
                    style={
                      light ? styles.TextInputLight : styles.TextInputDark
                    }>{`Latitude:${location?.latitude}\nLongitude: ${location?.longitude}`}</Text>
                </TouchableOpacity>
              </View>
              <View
                style={light ? styles.DividerLight : styles.DividerDark}></View>
            </View>
            <View
              style={
                light
                  ? styles.AccountInformationContainerLight
                  : styles.AccountInformationContainerDark
              }>
              <View style={{height: 60, marginTop: 20}}>
                <Text
                  style={[
                    light ? styles.HeaderTextLight : styles.HeaderTextDark,
                    {marginBottom: 10},
                  ]}>
                  🗣️ Language
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.push('LanguageChange');
                  }}>
                  <Text
                    style={
                      light ? styles.TextInputLight : styles.TextInputDark
                    }>
                    {language}
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={light ? styles.DividerLight : styles.DividerDark}></View>
              <View style={{height: 60}}>
                <Text
                  style={
                    light ? styles.HeaderTextLight : styles.HeaderTextDark
                  }>
                  🧑🏻‍💻 Interest
                </Text>
                <TextInput
                  value={interest}
                  onChangeText={setInterest}
                  style={
                    light ? styles.TextInputLight : styles.TextInputDark
                  }></TextInput>
              </View>
              <View
                style={light ? styles.DividerLight : styles.DividerDark}></View>
              <View style={{height: 60}}>
                <Text
                  style={
                    light ? styles.HeaderTextLight : styles.HeaderTextDark
                  }>
                  🏢 CompanyOrSchool
                </Text>
                <TextInput
                  value={companyOrSchool}
                  onChangeText={setCompanyOrSchool}
                  style={
                    light ? styles.TextInputLight : styles.TextInputDark
                  }></TextInput>
              </View>
              <View
                style={light ? styles.DividerLight : styles.DividerDark}></View>
              <View style={{height: 60}}>
                <Text
                  style={
                    light ? styles.HeaderTextLight : styles.HeaderTextDark
                  }>
                  👷🏻 Profession
                </Text>
                <TextInput
                  value={profession}
                  onChangeText={setProfession}
                  style={
                    light ? styles.TextInputLight : styles.TextInputDark
                  }></TextInput>
              </View>
              <View style={{height: 60}}>
                <Text
                  style={
                    light ? styles.HeaderTextLight : styles.HeaderTextDark
                  }>
                  💁🏻 About
                </Text>
                <TextInput
                  value={about}
                  onChangeText={setAbout}
                  style={
                    light ? styles.TextInputLight : styles.TextInputDark
                  }></TextInput>
              </View>
              <View
                style={light ? styles.DividerLight : styles.DividerDark}></View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (
                name &&
                username &&
                email &&
                password &&
                gender &&
                dateOfBirth &&
                location &&
                language &&
                interest &&
                companyOrSchool &&
                profession &&
                isUsernameAvailable &&
                password.length >= 8 &&
                about
              ) {
                updateUserData();
              } else {
                Alert.alert('All fields are required!');
              }
            }}
            style={styles.NextButton}>
            <Text style={{fontSize: 16, fontWeight: 'bold', color: '#FFFFFF'}}>
              Update
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  ProfileContainerLight: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  ProfileContainerDark: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 30,
    justifyContent: 'space-between',
    width: Dimensions.get('window').width,
  },
  textLight: {
    color: '#000000',
    fontSize: 26,
    fontWeight: 'bold',
  },
  textDark: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  MainContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    flexDirection: 'column',
    alignItems: 'center',

    paddingLeft: 20,
    paddingRight: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  BackgroundImage: {
    resizeMode: 'cover',
    height: 180,
    width: Dimensions.get('screen').width,
    borderRadius: 14,
    marginBottom: 10,
  },

  profileImageContainer: {
    borderRadius: 40,
    height: 80,
    width: 80,
    position: 'absolute',
    resizeMode: 'cover',
    alignSelf: 'baseline',
    marginTop: '30%',
    marginLeft: '5%',
  },
  profileImageLight: {
    borderRadius: 40,
    height: 80,
    width: 80,
    resizeMode: 'cover',
    alignSelf: 'baseline',
    marginTop: '35%',
    marginLeft: '5%',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileImageDark: {
    borderRadius: 40,
    height: 80,
    width: 80,
    resizeMode: 'cover',
    alignSelf: 'baseline',
    marginTop: '35%',
    marginLeft: '5%',
    borderWidth: 3,
    borderColor: '#000000',
  },
  TextViewBox: {
    fontWeight: 'bold',
    fontSize: 15,

    height: 40,
    marginTop: 10,
    marginLeft: 10,
    width: 300,
    textAlign: 'left',
    color: '#B0B0B0',
  },

  NextButton: {
    margin: 10,
    borderRadius: 30,
    backgroundColor: '#429BEE',
    height: 45,
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 10,
    elevation: 10,
    marginVertical: 30,
  },
  SubOption: {
    flexDirection: 'row',
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  SignInOption: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  OptionLogo: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  AlreadyHavingAccount: {
    flexDirection: 'row',
    marginTop: 30,
  },
  AlreadyHavingAccountText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000000',
    marginHorizontal: 2,
  },
  AlreadyHavingAccountSignInText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0094FF',
    marginHorizontal: 2,
    marginBottom: 20,
  },
  ProfileContainer: {
    marginTop: 50,
    width: Dimensions.get('screen').width,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    paddingEnd: 'auto',
  },
  HeaderTextLight: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },
  HeaderTextDark: {
    color: '#DADBDD',
    fontSize: 16,
    fontWeight: 'bold',
  },
  TextInputLight: {
    fontWeight: 'bold',
    fontSize: 14,
    width: 300,
    textAlign: 'left',
    color: '#6c757d',
  },
  TextInputDark: {
    fontWeight: 'bold',
    fontSize: 14,
    width: 300,
    textAlign: 'left',
    color: '#6c757d',
  },
  DividerLight: {
    height: 3,
    width: 350,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    opacity: 0.4,
  },
  DividerDark: {
    height: 3,
    width: 350,
    backgroundColor: '#000000',
    marginBottom: 20,
    opacity: 0.4,
  },
  AccountInformationContainerLight: {
    marginBottom: 30,
    marginEnd: 10,
    paddingEnd: 10,
    borderRadius: 14,
    backgroundColor: '#EEF5FF',

    paddingLeft: 10,
    opacity: 0.8,
  },
  AccountInformationContainerDark: {
    marginBottom: 30,
    marginEnd: 10,
    paddingEnd: 10,
    borderRadius: 14,
    backgroundColor: '#191919',
    paddingLeft: 10,
    opacity: 0.8,
  },
  ProfileLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
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
