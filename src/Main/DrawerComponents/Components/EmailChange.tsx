import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import auth, {firebase} from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {reauthenticateWithCredential} from 'firebase/auth';
import {Auth} from 'firebase/auth';
import {RootStackParamList} from '../../../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type EmailChangeProps = NativeStackScreenProps<
  RootStackParamList,
  'EmailChange'
>;

const EmailChange = ({navigation, route}: EmailChangeProps) => {
  const light = useColorScheme() === 'light';

  const [newEmail, setNewEmail] = useState<string>();
  const reAuthenticate = async () => {
    const user = firebase.auth().currentUser;
    if (user) {
      const authUserId = user.uid;
      const snapshot = await database()
        .ref(`Users/${authUserId}/password`)
        .once('value');
      const currentPassword = snapshot.val();

      try {
        const credential = firebase.auth.EmailAuthProvider.credential(
          String(user.email),
          String(currentPassword),
        );
        return user.reauthenticateWithCredential(credential);
      } catch (error) {
        Alert.alert('Error,please try again..!');
        console.log(error);
      }
    }
  };

  const updateEmail = async () => {
    Alert.alert('Please wait');
    const user = auth().currentUser;
    if (user) {
      const verfified = user.emailVerified;
      if (verfified) {
        reAuthenticate()?.then(() => {
          user
            .verifyBeforeUpdateEmail(String(newEmail))
            .then(async () => {
              await database().ref('Users').child(user.uid).child('newEmail').set(String(newEmail));
              Alert.alert('Please check your mail to verify...');
              navigation.pop();
            })
            .catch((error: any) => {
              if (error.code === 'auth/email-already-in-use') {
                Alert.alert(
                  'This email is already in use!\nplease try another email',
                );
              }
              if (error.code === 'auth/invalid-email') {
                Alert.alert('This email is invalid');
              } else {
                Alert.alert('Error,please try again..!');
              }
            });
        });
      } else {
        Alert.alert('You are not verified to change email..!');
      }
    }
  };

  return (
    <View
      style={
        light
          ? styles.EmailChangeContainerLight
          : styles.EmailChangeContainerDark
      }>
      <StatusBar
        barStyle={light ? 'dark-content' : 'light-content'}
        backgroundColor={light ? '#FFFFFF' : '#000000'}
      />
      <View style={styles.headerContainer}>
        <Text
          style={[light ? styles.textLight : styles.textDark, {marginTop: 30}]}>
          Change your email
        </Text>
      </View>
      <Text style={styles.DescriptionLight}>Update your email address</Text>
      <Text style={styles.DescriptionLight}>
        for improved communication and security
      </Text>
      <View style={styles.CenterContainer}>
        <Image
          source={require('../../../images/EmailChangeLogo.png')}
          style={styles.EmailChangeLogo}
        />
        <TextInput
          style={light ? styles.TextInputLight : styles.TextInputDark}
          placeholder="New email"
          placeholderTextColor={'#B0B0B0'}
          onChangeText={e => {
            setNewEmail(e);
          }}></TextInput>
        <TouchableOpacity
          onPress={async () => {
            if (newEmail) {
              if (
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(newEmail)
              ) {
                updateEmail();
              } else {
                Alert.alert('Please eneter valid email address');
              }
            } else {
              Alert.alert('Please fill email...\nto verify ');
            }
          }}
          style={styles.SignInButton}>
          <Text style={{fontSize: 16, fontWeight: 'bold', color: '#FFFFFF'}}>
            Verify
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EmailChange;

const styles = StyleSheet.create({
  EmailChangeContainerLight: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  EmailChangeContainerDark: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
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
  DescriptionLight: {
    color: '#B0B0B0',
    fontWeight: 'bold',
    fontSize: 22,
    marginStart: 10,
    shadowColor: '#000000',
    shadowOpacity: 10,
    elevation: 10,
  },
  DescriptionDark: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 22,
    marginStart: 10,
    shadowColor: '#000000',
    shadowOpacity: 10,
    elevation: 10,
  },
  CenterContainer: {
    flex: 1,

    alignItems: 'center',
  },
  TextInputLight: {
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
  TextInputDark: {
    fontWeight: 'bold',
    fontSize: 15,
    borderWidth: 1,
    height: 40,
    marginTop: 10,
    marginBottom: 10,
    elevation: 2,
    width: 300,
    borderRadius: 15,
    backgroundColor: '#121212',
    borderColor: '#B0B0B0',
    shadowColor: '#000000',
    shadowOpacity: 10,
    textAlign: 'left',
    color: '#FFFFFF',
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
  EmailChangeLogo: {
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
});
