import React, {useEffect, useRef} from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Animated,
  Alert,
} from 'react-native';
import logo from './images/logo.png';
import {RootStackParamList} from '../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import auth, {firebase} from '@react-native-firebase/auth';
type SplashScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SplashScreen'
>;

//Splash Screen
const SplashScreen = ({navigation}: SplashScreenProps): JSX.Element => {
  //fade in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  //Navigate to Introduction Screen
  useEffect(() => {
    const time = setTimeout(() => {
      const user = firebase.auth().currentUser;

      if (user) {
        navigation.replace('Home');
      } else {
        navigation.replace('SignIn');
      }
    }, 4000);

    return () => clearTimeout(time);
  }, [navigation]);

  return (
    //Logo and App Name
    <View style={styles.splashScreen}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#FFFFFF'} />
      <Animated.View style={[styles.introLogo, {opacity: fadeAnim}]}>
        <Image source={logo} style={styles.logoStyle} />
        <Text style={styles.textStyle}>Discover</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  splashScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  introLogo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  logoStyle: {
    height: 35,
    width: 35,
    margin: 5,
  },
  textStyle: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    margin: 5,
    fontStyle: 'normal',
  },
});

export default SplashScreen;
