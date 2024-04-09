import React, {useEffect, useState} from 'react';
import {
  Button,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Touchable,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import 'firebase/database';
import {RootStackParamList} from '../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';
type InterestProps = NativeStackScreenProps<RootStackParamList, 'Interest'>;

const Interest = ({navigation, route}: InterestProps) => {
  const email: string = route.params.email;
  const profileImage: string = route.params.profileImage;
  const name: string = route.params.name;
  const username: string = route.params.username;
  const password: string = route.params.password;
  const dateOfBirth: string = route.params.dateOfBirth;
  const gender: string = route.params.gender;
  const profession: string = route.params.profession;
  const companyOrSchool: string = route.params.companyOrSchool;
  const Location: {latitude: number; longitude: number} = route.params.Location;
  const Language: string = route.params.language;
  const [Interest, setInterest] = useState<string>('');
  const [about, setAbout] = useState<string>('');
  const [modalVisibility, setModalVisibility] = useState<boolean>(false);
  const [accountCreatedSuccessfully, setAccountCreatedSuccessfully] =
    useState<boolean>(false);
  const [creatingProfile, setCreatingProfile] = useState<boolean>(false);
  const createProfile = async () => {
    setModalVisibility(true);
    setCreatingProfile(true);
    try {
      const user = auth().currentUser;
      const authUserId = user?.uid;

      const response = await fetch(profileImage);

      
      const blob = await response.blob();
      console.log(blob);
      const ref = storage().ref().child(`${authUserId} /profileImage/`);

      await ref.put(blob).then(async () => {
        const profileImageUri = await ref.getDownloadURL();
        const token = await messaging().getToken();
        await database()
          .ref()
          .child('Users')
          .child(`${authUserId}`)
          .child('token')
          .set(token);
        await database()
          .ref()
          .child('Users')
          .child(`${authUserId}`)
          .child('email')
          .set(email);
        await database()
          .ref()
          .child('Users')
          .child(`${authUserId}`)
          .child('profileImage')
          .set(profileImageUri);
        await database()
          .ref()
          .child('Users')
          .child(`${authUserId}`)
          .child('name')
          .set(name);
        await database()
          .ref()
          .child('Users')
          .child(`${authUserId}`)
          .child('username')
          .set(username);
        await database()
          .ref()
          .child('Users')
          .child(`${authUserId}`)
          .child('password')
          .set(password);
        await database()
          .ref()
          .child('Users')
          .child(`${authUserId}`)
          .child('dateOfBirth')
          .set(dateOfBirth);
        await database()
          .ref()
          .child('Users')
          .child(`${authUserId}`)
          .child('gender')
          .set(gender);
        await database()
          .ref()
          .child('Users')
          .child(`${authUserId}`)
          .child('profession')
          .set(profession);
        await database()
          .ref()
          .child('Users')
          .child(`${authUserId}`)
          .child('companyOrSchool')
          .set(companyOrSchool);
        await database()
          .ref()
          .child('Users')
          .child(`${authUserId}`)
          .child('location')
          .set(Location);
        await database()
          .ref()
          .child('Users')
          .child(`${authUserId}`)
          .child('language')
          .set(Language);
        await database()
          .ref()
          .child('Users')
          .child(`${authUserId}`)
          .child('interest')
          .set(Interest);
        await database()
          .ref()
          .child('Users')
          .child(`${authUserId}`)
          .child('about')
          .set(about);
        setCreatingProfile(false);
        setAccountCreatedSuccessfully(true);
      });
    } catch (error) {
      Alert.alert(error)
      setCreatingProfile(false);
      setAccountCreatedSuccessfully(false);
      console.log(error);
    }
  };

  return (
    <View style={styles.Interest}>
      <StatusBar backgroundColor={'#FFFFFF'} barStyle={'dark-content'} />
      <Text style={styles.Heading}>Interest</Text>
      <Text style={styles.Discription}>Select your Interest and Skill ⚒️ </Text>
      <Modal transparent={true} visible={modalVisibility}>
        <StatusBar
          backgroundColor={'rgba(0,0,0,0.5)'}
          barStyle={'light-content'}
        />
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              height: 400,
              width: 300,
              borderRadius: 24,
              backgroundColor: '#FFFFFF',
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 4,
            }}>
            {creatingProfile ? (
              <View>
                <Text
                  style={{
                    color: '#121212',

                    textAlign: 'center',
                    alignSelf: 'center',
                    fontWeight: 'bold',
                  }}>
                  Creating your profile, please wait..
                </Text>
                <ActivityIndicator
                  size={30}
                  color={'#35374B'}
                  style={{alignSelf: 'center', marginTop: 20}}
                />
              </View>
            ) : (
              <View>
                {accountCreatedSuccessfully ? (
                  <View
                    style={{
                      height: 400,
                      width: 300,
                      borderRadius: 24,
                      backgroundColor: '#FFFFFF',

                      alignItems: 'center',
                      elevation: 4,
                      paddingTop: 50,
                    }}>
                    <Text
                      style={{
                        color: '#121212',

                        textAlign: 'center',
                        alignSelf: 'center',
                        fontWeight: 'bold',
                      }}>
                      Profile created Successfully!
                    </Text>
                    <Image
                      source={require('../images/ProfileCreatedSuccessfullyIcon.jpg')}
                      style={styles.UpdateProfileLogo}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        navigation.replace('SplashScreen');
                      }}>
                      <Text
                        style={{
                          color: '#FFFFFF',

                          textAlign: 'center',
                          //alignSelf: 'flex-end',
                          fontWeight: 'bold',
                          // marginEnd: 20,
                          backgroundColor: '#429BEE',
                          padding: 10,
                          borderRadius: 30,
                          paddingHorizontal: 20,
                        }}>
                        Next
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    style={{
                      height: 400,
                      width: 300,
                      borderRadius: 24,
                      backgroundColor: '#FFFFFF',

                      alignItems: 'center',
                      elevation: 4,
                      paddingTop: 50,
                    }}>
                    <Text
                      style={{
                        color: '#121212',

                        textAlign: 'center',
                        alignSelf: 'center',
                        fontWeight: 'bold',
                      }}>
                      Oops..! Failed to create profile..
                    </Text>
                    <Image
                      source={require('../images/ProfileCreatedUnSuccessfullyIcon.jpg')}
                      style={styles.UpdateProfileLogo}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisibility(false);
                        setAccountCreatedSuccessfully(false);
                        setCreatingProfile(false);
                      }}>
                      <Text
                        style={{
                          color: '#FFFFFF',

                          textAlign: 'center',
                          //alignSelf: 'flex-end',
                          fontWeight: 'bold',
                          // marginEnd: 20,
                          backgroundColor: '#429BEE',
                          padding: 10,
                          borderRadius: 30,
                          paddingHorizontal: 20,
                        }}>
                        Retry
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
      <View style={styles.CenterContainer}>
        <Text
          style={{
            color: '#121212',
            fontSize: 16,
            fontWeight: 'bold',
            marginLeft: 10,
          }}>
          Interest
        </Text>
        <TextInput
          style={styles.TextInput}
          value={Interest}
          placeholderTextColor={'#B0B0B0'}
          onChangeText={e => {
            setInterest(e);
          }}></TextInput>

        <Text
          style={{
            color: '#121212',
            fontSize: 16,
            fontWeight: 'bold',
            marginLeft: 10,
          }}>
          About yourself
        </Text>
        <TextInput
          style={styles.TextInputLight}
          placeholder="Please introduce yourself here"
          placeholderTextColor={'#B0B0B0'}
          value={about}
          onChangeText={e => {
            setAbout(String(e));
          }}
          multiline={true}
          numberOfLines={4}></TextInput>
        <TouchableOpacity
          onPress={() => {
            if (about && Interest) {
              createProfile();
            }
          }}
          style={styles.StartButton}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#FFFFFF',
              alignSelf: 'center',
            }}>
            Start
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  Interest: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  Heading: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#000000',
    marginStart: 10,
    marginTop: 10,
    shadowColor: '#000000',
    shadowOpacity: 10,
    elevation: 10,
  },
  Discription: {
    color: '#B0B0B0',
    fontWeight: 'bold',
    fontSize: 22,
    marginStart: 10,
    shadowColor: '#000000',
    shadowOpacity: 10,
    elevation: 10,
  },
  CenterContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    // alignItems: 'center',
    marginTop: 50,
    marginLeft: 20,
  },
  InterestSelectionView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: 30,
  },

  InterestButton: {
    borderRadius: 30,
    backgroundColor: '#D9D9D9',
    height: 45,
    width: 300,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 10,
    elevation: 10,
    alignSelf: 'center',
  },
  SelectedInterestButton: {
    margin: 10,
    borderRadius: 30,
    backgroundColor: '#429BEE',
    height: 45,
    width: 300,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 10,
    elevation: 50,
  },
  InterestLogo: {
    height: 300,
    width: Dimensions.get('screen').width,
  },
  TextInput: {
    fontWeight: 'bold',
    fontSize: 15,
    borderWidth: 1,
    height: 40,
    marginTop: 10,
    marginBottom: 10,
    elevation: 2,
    width: 300,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderColor: '#B0B0B0',
    shadowColor: '#000000',
    shadowOpacity: 10,
    textAlign: 'left',
    color: '#000000',
  },
  StartButton: {
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
    alignSelf: 'center',
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
  TextInputLight: {
    fontWeight: 'bold',
    fontSize: 15,
    borderWidth: 1,
    height: 200,
    marginTop: 10,
    marginBottom: 10,
    width: Dimensions.get('screen').width - 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderColor: '#B0B0B0',
    textAlign: 'left',
    textAlignVertical: 'top',
    color: '#000000',
    padding: 10,
  },
  UpdateProfileLogo: {
    height: 250,
    width: 250,
    resizeMode: 'contain',
  },
});

export default Interest;
