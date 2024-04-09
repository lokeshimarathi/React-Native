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
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {RootStackParamList} from '../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import database from '@react-native-firebase/database';
type SignUpScredentialsProps = NativeStackScreenProps<
  RootStackParamList,
  'SignUpCredentials'
>;
const SignUpCredentials = ({navigation, route}: SignUpScredentialsProps) => {
  const email = route.params.email;
  const password = route.params.password;
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean>(true);
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
  return (
    <View style={styles.SignUpCredentials}>
      <StatusBar backgroundColor={'#FFFFFF'} barStyle={'dark-content'} />
      <Text style={styles.Heading}>Sign Up</Text>
      <Text style={styles.Discription}>Embark on your journey with us </Text>
      <Text style={styles.Discription}>
        by creating a profile and unlocking{' '}
      </Text>
      <Text style={styles.Discription}>a world of possibilities. 😊</Text>

      <View style={styles.CenterContainer}>
        <Image
          source={require('../images/SignUpCredentials.jpg')}
          style={styles.SignUpCredentialsLogo}
        />
        <TextInput
          style={styles.TextInput}
          placeholder="name"
          placeholderTextColor={'#B0B0B0'}
          onChangeText={e => {
            setName(e.replace(/\s/g, ''));
          }}></TextInput>
        <TextInput
        value={username}
          style={[
            {
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
            },
            {color: isUsernameAvailable ? '#000000' : '#F57D1F'},
          ]}
          placeholder="username"
          placeholderTextColor={'#B0B0B0'}
          onChangeText={e => {
            setUsername(e.toLowerCase().replace(/\s/g, ''));
          }}></TextInput>

        <TouchableOpacity
          onPress={() => {
            if (name && username && isUsernameAvailable) {
              navigation.replace('ProfileCreating', {
                email,
                name,
                username,
                password,
              });
            } else if (password.length <= 8) {
              Alert.alert('Password length should be greater than 8');
            } else {
              Alert.alert('All fields are required!');
            }
          }}
          style={styles.NextButton}>
          <Text style={{fontSize: 16, fontWeight: 'bold', color: '#FFFFFF'}}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  SignUpCredentials: {
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
  SignUpCredentialsLogo: {
    height: 300,
    width: 300,
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
});

export default SignUpCredentials;
