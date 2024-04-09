import React, {useEffect, useState} from 'react';
import {
  Alert,
  PermissionsAndroid,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {useColorScheme} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Public from './HomeComponents/Public';
import Search from './HomeComponents/Search';
import Ask from './HomeComponents/Ask';
import Messages from './HomeComponents/Messages';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {RootStackParamList} from '../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
type bottomTabNavigatorProps = {
  Public: undefined;
  Search: undefined;
  Ask: undefined;
  Messages: undefined;
};

const Home = ({route, navigation}: HomeProps) => {
  const light = useColorScheme() === 'light';
  const Tab = createBottomTabNavigator<bottomTabNavigatorProps>();
  const [hasUser, setHasUser] = useState<string>('');
  const [myAuthUserId, setMyAuthUserId] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [email, setEmail] = useState<string>();
  useEffect(() => {
    const interval = setInterval(() => {
      const user = auth().currentUser;
      if (!user) {
        setHasUser('noUser');
      } else {
        setHasUser('user');
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);
  useEffect(() => {
    const signIn = async () => {
      if (hasUser === 'noUser') {
        try {
          const snapshot = await database()
            .ref('Users')
            .child(String(myAuthUserId))
            .child('newEmail')
            .once('value');
          const newEmail = await snapshot.val();
          const passwordSnapshot = await database()
            .ref('Users')
            .child(String(myAuthUserId))
            .child('newPassword')
            .once('value');
          const newPassword = await passwordSnapshot.val();
          const signoutSnapshot = await database()
            .ref('Users')
            .child(String(myAuthUserId))
            .child('signoutRequest')
            .once('value');
          const signoutRequest = await passwordSnapshot.val();
          if (newEmail) {
            auth()
              .signInWithEmailAndPassword(newEmail, String(password))
              .then(async () => {
                const user = auth().currentUser;
                await database()
                  .ref('Users')
                  .child(String(myAuthUserId))
                  .child('newEmail')
                  .set(null);
                await database()
                  .ref('Users')
                  .child(String(myAuthUserId))
                  .child('email')
                  .set(user?.email);
                setHasUser('user');
                Alert.alert('Your email has been updated successfully!');
              });
          }
          if (newPassword) {
            auth()
              .signInWithEmailAndPassword(String(email), String(newPassword))
              .then(async () => {
                await database()
                  .ref('Users')
                  .child(String(myAuthUserId))
                  .child('newPassword')
                  .set(null);
                await database()
                  .ref('Users')
                  .child(String(myAuthUserId))
                  .child('password')
                  .set(newPassword);
                setHasUser('user');
                Alert.alert('Your password has been updated successfully!');
              });
          } else {
            Alert.alert('Please wait...');
            setTimeout(() => {
              const user = auth().currentUser;
              if (!user) {
                navigation.replace('SignIn');
              }
            }, 3000);
          }
        } catch (error) {
          console.log(error);
          navigation.replace('SignIn');
        }
      }
    };
    signIn();
  }, [hasUser === 'noUser']);

  useEffect(() => {
    const timeInterval = setInterval(async () => {
      const user = auth().currentUser;

      if (user) {
        await user.reload();
        await database()
          .ref('Users')
          .child(String(user.uid))
          .child('email')
          .set(String(user.email));
        setEmail(String(user.email));
      }
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);
  useEffect(() => {
    const user = auth().currentUser;
    (async function reload() {
      await user?.reload();
    })();

    const myAuthUserId = user?.uid;
    setMyAuthUserId(myAuthUserId);
    const databaseRef = database().ref('Users').child(String(myAuthUserId));
    databaseRef.on('value', async snapshot => {
      const Password = await snapshot.child('password').val();
      setPassword(Password);

      const username = await snapshot.child('username').val();
      if (username === null || !user?.emailVerified) {
        user?.delete();
      }
    });
    return () => databaseRef.off();
  }, []);

  useEffect(() => {
    const requests = async () => {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission Required',
          message: 'Cool Discover App needs send notifications ',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
    };
    requests();
  }, []);

  return (
    <View style={light ? styles.HomeContainerLight : styles.HomeContainerDark}>
      <StatusBar
        backgroundColor={light ? '#FFFFFF' : '#000000'}
        barStyle={light ? 'dark-content' : 'light-content'}
      />
      <Tab.Navigator
        id="HomeTab"
        initialRouteName="Public"
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            let iconName = 'home';

            if (route.name === 'Public') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Search') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'Ask') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Messages') {
              iconName = focused ? 'mail' : 'mail-outline';
            }
            return <Ionicons name={iconName} color={color} size={size} />;
          },
          tabBarActiveTintColor: light ? '#000000' : '#FFFFFF',
          tabBarStyle: {
            backgroundColor: light ? '#f5f5f5' : '#121212',
            borderColor: light ? '#f5f5f5' : '#121212',
          },
        })}>
        <Tab.Screen
          name="Public"
          component={Public}
          options={{
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Search"
          component={Search}
          options={{
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Ask"
          component={Ask}
          options={{
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Messages"
          component={Messages}
          options={{
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  HomeContainerLight: {
    flex: 1,
  },
  HomeContainerDark: {
    flex: 1,
  },
});

export default Home;
