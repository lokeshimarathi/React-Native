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
import auth, {firebase} from '@react-native-firebase/auth';
import {RootStackParamList} from '../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import SignIn from './SignIn';
import {sendEmailVerification} from 'firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
type SignUpProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const SignUp = ({navigation, route}: SignUpProps) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [state, setState] = useState({});
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const [modalVisibility, setModalVisibility] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [typeemail, setTypeEmail] = useState<string>('');
  const [signupSuccessfull, setSignupSuccessfull] = useState<boolean>(false);
  const signUp = async (e: string, p: string) => {
    setModalVisibility(true);
    setVerifying(true);
    try {
      await auth().createUserWithEmailAndPassword(e, p);
      const user = firebase.auth().currentUser;
      user?.sendEmailVerification().then(() => {
        setVerifying(false);
        setSignupSuccessfull(true);
      });
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setVerifying(false);
        setSignupSuccessfull(false);
      } else if (error.code === 'auth/invalid-email') {
        setVerifying(false);
        setSignupSuccessfull(false);
      } else {
        Alert.alert('Error', error.message);
        setVerifying(false);
        setSignupSuccessfull(false);
      }
      setVerifying(false);
      setSignupSuccessfull(false);
      console.error('Error creating user:', error);
    }
  };

  useEffect(() => {
    const timeInterval = setInterval(async () => {
      const user = auth().currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          setIsEmailVerified(true);
        } else {
          setIsEmailVerified(false);
        }
      }
    }, 1000);
    return () => clearInterval(timeInterval);
  }, [signupSuccessfull === true]);

  const continueWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      const {idToken} = await GoogleSignin.signIn();
      const googleUserCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleUserCredential);
    } catch (error) {
      console.log(error);
      setModalVisibility(true);
      setVerifying(false);
      setSignupSuccessfull(false);
    }
  };

  return (
    <View style={styles.SignUp}>
      <StatusBar backgroundColor={'#FFFFFF'} barStyle={'dark-content'} />

      <Text style={styles.Heading}>Sign Up</Text>
      <Text style={styles.Discription}>Your journey begins with a </Text>
      <Text style={styles.Discription}>single sign up. 🎉</Text>
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
                  {'Verifying your email\nplease wait..'}
                </Text>
                <ActivityIndicator
                  size={30}
                  color={'#35374B'}
                  style={{alignSelf: 'center', marginTop: 20}}
                />
              </View>
            ) : (
              <View>
                {signupSuccessfull ? (
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
                      {!isEmailVerified
                        ? 'Verification email has been sent\nto your mail (spam)\nPlease verify'
                        : 'Your email has been verified\nsuccessfully..'}
                    </Text>
                    <Image
                      source={
                        !isEmailVerified
                          ? require('../images/EmailVerificationIcon.jpg')
                          : require('../images/EmailVerificationSuccessfullIcon.jpg')
                      }
                      style={styles.UpdateProfileLogo}
                    />
                    {isEmailVerified ? (
                      <TouchableOpacity
                        onPress={() => {
                          navigation.replace('SignUpCredentials', {
                            email: email,
                            password: password,
                          });
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
                    ) : null}
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
                      Oops..! Failed to create account..
                    </Text>
                    <Image
                      source={require('../images/FailedToCreateAccountIcon.jpg')}
                      style={styles.UpdateProfileLogo}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisibility(false);
                        setEmail('');
                        setPassword('');
                        setHidePassword(true);
                        setVerifying(false);
                        setSignupSuccessfull(false);
                        setTypeEmail('');
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
        <Image
          source={require('../images/SignUpLogo.jpg')}
          style={styles.SignupLogo}
        />
        <TextInput
          value={typeemail}
          style={styles.TextInput}
          placeholder="email"
          placeholderTextColor={'#B0B0B0'}
          onChangeText={e => {
            setEmail(e.toLowerCase());
            setTypeEmail(e);
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
            value={password}
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
        <TouchableOpacity
          onPress={() => {
            if (email !== '' && password !== '' && password.length > 8) {
              if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                setEmail(email.toLowerCase());
                signUp(email, password);
              } else {
                Alert.alert(
                  'Invalid Email',
                  'Please enter a valid email address.',
                );
              }
            } else {
              Alert.alert(
                'Please select or enter email id or Password langth should be greater than or equal to 8!',
              );
            }
          }}
          style={styles.VerifyButton}>
          <Text style={{fontSize: 16, fontWeight: 'bold', color: '#FFFFFF'}}>
            Verify
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
              continueWithGoogle();
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
        <View style={styles.AlreadyHavingAccount}>
          <Text style={styles.AlreadyHavingAccountText}>
            Already have an account?
          </Text>
          <TouchableOpacity
            onPress={() => {
              navigation.replace('SignIn');
            }}>
            <Text style={styles.AlreadyHavingAccountSignInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  SignUp: {
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
  SignupLogo: {
    height: 300,
    width: 300,
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
  VerifyButton: {
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
  UpdateProfileLogo: {
    height: 250,
    width: 250,
    resizeMode: 'contain',
  },
});

export default SignUp;
