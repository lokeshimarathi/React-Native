import AppIntroSlider from '@unbogify/react-native-app-intro-slider';
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
  Modal,
  ActivityIndicator,
} from 'react-native';
import {COLORS, Sizes} from '../IntroductionTheme';
import {RootStackParamList} from '../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import database from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
const slides = [
  {
    id: 1,
    title: 'Ask',
    image: require('../images/IntroductionImageOne.jpg'),
    description: '"Ask your questions and doubts to receive solutions."',
  },
  {
    id: 2,
    title: 'Recieve',
    image: require('../images/IntroductionImageTwo.jpg'),
    description:
      '"Receive solutions in various formats such as text, images, videos, or through engaging chats."',
  },
  {
    id: 3,
    title: 'Solve',
    image: require('../images/IntroductionImageThree.jpg'),
    description:
      '"Instantly forge a close connection with each other for a better solution."',
  },
];
type SignInProps = NativeStackScreenProps<RootStackParamList, 'SignIn'>;
const SignIn = ({navigation, route}: SignInProps) => {
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const [showSignInPage, setSignInPage] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [modalVisibility, setModalVisibility] = useState<boolean>(false);
  const [SignedInSucessfull, setSignedInSuccessfull] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  async function onGoogleButtonPress() {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      // Get the users ID token
      const {idToken} = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      return auth().signInWithCredential(googleCredential);
    } catch (error) {
      console.log(error);
      setModalVisibility(true);
      setVerifying(false);
      setSignedInSuccessfull(false);
    }
  }
  const buttonLabel = (label: string): JSX.Element => {
    return (
      <View style={{padding: 12}}>
        <Text
          style={{color: COLORS.title, fontWeight: '600', fontSize: Sizes.h4}}>
          {label}
        </Text>
      </View>
    );
  };
  if (!showSignInPage) {
    return (
      <AppIntroSlider
        style={{backgroundColor: '#FFFFFF'}}
        data={slides}
        renderItem={({item}) => {
          return (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                margin: 10,
                alignSelf: 'center',
                justifyContent: 'center',
              }}>
              <StatusBar
                backgroundColor={'#FFFFFF'}
                barStyle={'dark-content'}
              />

              <Image
                source={item?.image}
                style={{
                  width: 300,
                  height: 300,
                  resizeMode: 'contain',
                }}
              />

              <Text
                style={{
                  fontWeight: 'bold',
                  color: COLORS.title,
                  fontSize: Sizes.h2,
                  textAlign: 'left',
                  marginTop: 20,
                }}>
                {item?.description}
              </Text>
            </View>
          );
        }}
        activeDotStyle={{backgroundColor: '#000000', width: 30}}
        renderNextButton={() => buttonLabel('Next')}
        renderSkipButton={() => buttonLabel('Skip')}
        renderDoneButton={() => buttonLabel('Done')}
        onDone={() => {
          setSignInPage(true);
        }}
      />
    );
  }

  const SignIn = (e: string, p: string) => {
    setModalVisibility(true);
    setVerifying(true);
    auth()
      .signInWithEmailAndPassword(e, p)
      .then(async () => {
        const user = auth().currentUser;
        if (user) {
          const myAuthUserId = user.uid;
          const token = await messaging().getToken();
          await database()
            .ref('Users')
            .child(myAuthUserId)
            .child('token')
            .set(token);
          await database()
            .ref('Users')
            .child(myAuthUserId)
            .child('password')
            .set(password);
          setVerifying(false);
          setSignedInSuccessfull(true);
        }
      })
      .catch((error: any) => {
        if (error.code === 'auth/invalid-email') {
          setVerifying(false);
          setSignedInSuccessfull(false);
        } else {
          setVerifying(false);
          setSignedInSuccessfull(false);
        }
        console.log(String(error));
        setVerifying(false);
        setSignedInSuccessfull(false);
      });
  };
  const passwordResetEmail = (e: string) => {
    Alert.alert('Please Wait...');
    auth()
      .sendPasswordResetEmail(e)
      .then(() => {
        Alert.alert('Please Check your email');
      })
      .catch((error: any) => {
        if (error.code === 'auth/inavlid-email') {
          Alert.alert('Invalid Email');
        } else {
          Alert.alert('Email is not registered!');
        }
        console.log(error);
      });
  };

  return (
    <View style={styles.SignIn}>
      <StatusBar backgroundColor={'#FFFFFF'} barStyle={'dark-content'} />
      <Text style={styles.Heading}>Sign In</Text>
      <Text style={styles.Discription}>Welcome back</Text>
      <Text style={styles.Discription}>You have been missed! 👋🏻</Text>
      <View style={styles.CenterContainer}>
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
              {verifying ? (
                <View>
                  <Text
                    style={{
                      color: '#121212',

                      textAlign: 'center',
                      alignSelf: 'center',
                      fontWeight: 'bold',
                    }}>
                    {'Verifying your email and password\nplease wait..'}
                  </Text>
                  <ActivityIndicator
                    size={30}
                    color={'#35374B'}
                    style={{alignSelf: 'center', marginTop: 20}}
                  />
                </View>
              ) : (
                <View>
                  {SignedInSucessfull ? (
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
                        SignedIn successful..
                      </Text>
                      <Image
                        source={require('../images/SignedInSuccessfulIcon.jpg')}
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
                        Oops..! Sign In failed..
                      </Text>
                      <Image
                        source={require('../images/FailedToCreateAccountIcon.jpg')}
                        style={styles.UpdateProfileLogo}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          setModalVisibility(false);
                          setVerifying(false);
                          setSignedInSuccessfull(false);
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

        <Image
          source={require('../images/SignInLogo.jpg')}
          style={styles.SignInLogo}
        />
        <TextInput
          style={styles.TextInput}
          placeholder="email"
          placeholderTextColor={'#B0B0B0'}
          onChangeText={e => {
            setEmail(e);
          }}></TextInput>
        <View style={styles.TextInput}>
          <TextInput
            style={{
              fontWeight: 'bold',
              fontSize: 15,

              height: 40,

              width: 250,

              textAlign: 'left',
              color: '#000000',
            }}
            secureTextEntry={hidePassword}
            placeholder="password"
            placeholderTextColor={'#B0B0B0'}
            onChangeText={e => {
              setPassword(e);
            }}></TextInput>
          <TouchableOpacity
            onPress={() => {
              setHidePassword(!hidePassword);
            }}>
            <Ionicons
              name={hidePassword ? 'eye' : 'eye-off'}
              size={25}
              color={'#121212'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.ForgotPassword}>
          <Text style={styles.ForgotPasswordText}>Forgot password?</Text>
          <Pressable
            onPress={() => {
              if (email) {
                if (
                  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
                ) {
                  setEmail(email.toLowerCase());
                  passwordResetEmail(email);
                } else {
                  Alert.alert(
                    'Invalid Email',
                    'Please enter a valid email address.',
                  );
                }
              } else {
                Alert.alert('Please select or enter email id!');
              }
            }}>
            <Text style={styles.ForgotPasswordLinkText}>Reset</Text>
          </Pressable>
        </View>
        <TouchableOpacity
          onPress={async () => {
            if (email !== '' || password !== '') {
              if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                setEmail(email.toLowerCase());
                SignIn(email, password);
              } else {
                Alert.alert(
                  'Invalid Email',
                  'Please enter a valid email address.',
                );
              }
            } else {
              Alert.alert('Please select or enter email id and Password!');
            }
          }}
          style={styles.SignInButton}>
          <Text style={{fontSize: 16, fontWeight: 'bold', color: '#FFFFFF'}}>
            Sign In
          </Text>
        </TouchableOpacity>
        <View style={styles.SubOption}>
          <View
            style={{
              backgroundColor: '#B0B0B0',
              width: 50,
              height: 1,
              marginHorizontal: 10,
              elevation: 2,
              shadowColor: '#000000',
            }}></View>
          <Text
            style={{
              color: '#000000',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            or continue with
          </Text>
          <View
            style={{
              backgroundColor: '#B0B0B0',
              width: 50,
              height: 1,
              marginHorizontal: 10,
              elevation: 2,
              shadowColor: '#000000',
            }}></View>
        </View>
        <View style={styles.SignInOption}>
          <TouchableOpacity
            onPress={() => {
              onGoogleButtonPress();
            }}>
            <View
              style={{
                width: 300,
                height: 50,
                borderWidth: 0.8,
                borderColor: '#dedede',
                borderRadius: 24,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                paddingHorizontal: 50,
              }}>
              <Image
                source={require('../images/GoogleLogo.png')}
                style={styles.OptionLogo}
              />
              <Text
                style={{
                  fontSize: 16,
                  color: '#000000',
                }}>
                Continue with Google
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.NotHavingAccount}>
          <Text style={styles.NotHavingAccountText}>
            Don't have an account?
          </Text>
          <Pressable
            onPress={() => {
              navigation.replace('SignUp');
            }}>
            <Text style={styles.NotHavingAccountRegisterText}>Register</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  SignIn: {
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  TextInput: {
    flexDirection: 'row',
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

    alignItems: 'center',
  },
  SignInButton: {
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
    height: 25,
    width: 25,
    marginBottom: 20,
  },
  NotHavingAccount: {
    flexDirection: 'row',
    marginTop: 10,
  },
  NotHavingAccountText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000000',
    marginHorizontal: 2,
  },
  NotHavingAccountRegisterText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0094FF',
    marginHorizontal: 2,
    marginBottom: 20,
  },
  SignInLogo: {
    height: 250,
    width: 250,
    paddingTop: 20,
    marginTop: 20,
    alignSelf: 'center',
  },
  ForgotPassword: {
    flexDirection: 'row',
    marginTop: 5,
  },
  ForgotPasswordText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000000',
    marginHorizontal: 2,
  },
  ForgotPasswordLinkText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#d2691e',
    marginHorizontal: 2,
    marginBottom: 20,
  },
  UpdateProfileLogo: {
    height: 250,
    width: 250,
    resizeMode: 'contain',
  },
});
export default SignIn;
