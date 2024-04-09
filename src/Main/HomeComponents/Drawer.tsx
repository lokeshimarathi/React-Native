import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import logo from '../../images/logo.png';
import {RootStackParamList} from '../../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import database from '@react-native-firebase/database';
import auth, {firebase} from '@react-native-firebase/auth';
import {Share} from 'react-native';
type DrawerProps = NativeStackScreenProps<RootStackParamList, 'Drawer'>;
const Drawer = ({navigation, route}: DrawerProps) => {
  const light = useColorScheme() === 'light';
  const [username, setUsername] = useState<string>();
  const [profileImage, setProfileImage] = useState<string>();

  useEffect(() => {
    const user = firebase.auth().currentUser;

    const authUserId = user?.uid;

    const databaseRef = database().ref(`Users/${authUserId}/`);
    databaseRef.on('value', async snapshot => {
      const getUsername = await snapshot.child('username').val();
      setUsername(getUsername);
      const getProfileImage = await snapshot.child('profileImage').val();
      if (getProfileImage) {
        setProfileImage(getProfileImage);
      } else {
        setProfileImage(
          'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg',
        );
      }
    });
    return () => databaseRef.off();
  }, []);
  const handleShare = async () => {
    try {
      const result = await Share.share({
        title: 'Discover',
        message:
          'Check out this awesome app!\n' +
          'https://play.google.com/store/apps/details?id=com.Discover',
        url: 'https://play.google.com/store/apps/details?id=com.Discover',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          Alert.alert(`Shared via ${result.activityType}`);
        } else {
          Alert.alert('Shared successfully!');
        }
      } else if (result.action === Share.dismissedAction) {
        Alert.alert('Dismissed');
      }
    } catch (error: any) {
      Alert.alert('Error, please try again...');
    }
  };

  const logout = async () => {
    const user = auth().currentUser;
    if (user) {
      const myAuthUserId = user.uid;
      await database()
        .ref('Users')
        .child(myAuthUserId)
        .child('token')
        .set(null);

      firebase
        .auth()
        .signOut()
        .then(() => {
          Alert.alert('Signed out successfully!');
          navigation.pop();
        })
        .catch((error: any) => {
          console.log(error);
          Alert.alert('Error, please try again..!');
        });
    }
  };

  return (
    <View
      style={light ? styles.DrawerContainerLight : styles.DrawerContainerDark}>
      <StatusBar
        barStyle={light ? 'dark-content' : 'light-content'}
        backgroundColor={light ? '#FFFFFF' : '#000000'}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={light ? styles.textLight : styles.textDark}>
            Settings
          </Text>
        </View>
        <View style={styles.MainContainer}>
          <View
            style={
              light
                ? styles.SettingsInformationContainerLight
                : styles.SettingsInformationContainerDark
            }>
            <Text
              style={light ? styles.HeaderTextLight : styles.HeaderTextDark}>
              Profile
            </Text>
            <View style={styles.AccounSectionView}>
              <View style={styles.AccountLogo}>
                <Image
                  source={
                    profileImage
                      ? {uri: profileImage}
                      : require('../../images/PersonLogo.png')
                  }
                  style={styles.profileImage}
                />
              </View>
              <View style={styles.AccountName}>
                <Text
                  style={
                    light
                      ? styles.AccountUserNameLight
                      : styles.AccountUserNameDark
                  }>
                  {username ? username.substring(0, 14) : 'Username'}
                </Text>
                <Text
                  style={
                    light
                      ? styles.AccountPersonalInfoLight
                      : styles.AccountPersonalInfoDark
                  }>
                  Personal Info
                </Text>
              </View>
              <View
                style={
                  light ? styles.AccountNextLight : styles.AccountNextDark
                }>
                <TouchableOpacity
                  onPress={() => {
                    navigation.push('Profile');
                  }}>
                  <View
                    style={
                      light ? styles.AccountNextLight : styles.AccountNextDark
                    }>
                    <Image
                      source={require('../../images/ForwardArrow.png')}
                      style={styles.ForwardArrow}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View
            style={
              light
                ? styles.SettingsInformationContainerLight
                : styles.SettingsInformationContainerDark
            }>
            <Text
              style={light ? styles.HeaderTextLight : styles.HeaderTextDark}>
              Settings
            </Text>
            <View style={styles.SettingsSections}>
              <Image
                source={require('../../images/NotificationsIcon.png')}
                style={styles.IconView}></Image>
              <Text
                style={
                  light ? styles.SettingsTitleLight : styles.SettingsTitleDark
                }>
                Notifications
              </Text>

              <TouchableOpacity
                onPress={() => {
                  navigation.push('Notifications');
                }}>
                <View
                  style={
                    light ? styles.SettingsNextLight : styles.SettingsNextDark
                  }>
                  <Image
                    source={require('../../images/ForwardArrow.png')}
                    style={styles.ForwardArrow}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={light ? styles.DividerLight : styles.DividerDark}></View>
            <View style={styles.SettingsSections}>
              <Image
                source={require('../../images/HelpIcon.png')}
                style={styles.IconView}></Image>
              <Text
                style={
                  light ? styles.SettingsTitleLight : styles.SettingsTitleDark
                }>
                Need help
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.push('Help');
                }}>
                <View
                  style={
                    light ? styles.SettingsNextLight : styles.SettingsNextDark
                  }>
                  <Image
                    source={require('../../images/ForwardArrow.png')}
                    style={styles.ForwardArrow}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={light ? styles.DividerLight : styles.DividerDark}></View>
            <View style={styles.SettingsSections}>
              <Image
                source={require('../../images/InformationIcon.png')}
                style={styles.IconView}></Image>
              <Text
                style={
                  light ? styles.SettingsTitleLight : styles.SettingsTitleDark
                }>
                Information
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.push('Information');
                }}>
                <View
                  style={
                    light ? styles.SettingsNextLight : styles.SettingsNextDark
                  }>
                  <Image
                    source={require('../../images/ForwardArrow.png')}
                    style={styles.ForwardArrow}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={light ? styles.DividerLight : styles.DividerDark}></View>
            <View style={styles.SettingsSections}>
              <Image
                source={require('../../images/ShareAppIcon.png')}
                style={styles.IconView}></Image>
              <Text
                style={
                  light ? styles.SettingsTitleLight : styles.SettingsTitleDark
                }>
                Share app
              </Text>
              <TouchableOpacity
                onPress={() => {
                  handleShare();
                }}>
                <View
                  style={
                    light ? styles.SettingsNextLight : styles.SettingsNextDark
                  }>
                  <Image
                    source={require('../../images/ForwardArrow.png')}
                    style={styles.ForwardArrow}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={
              light
                ? styles.SettingsInformationContainerLight
                : styles.SettingsInformationContainerDark
            }>
            <Text
              style={light ? styles.HeaderTextLight : styles.HeaderTextDark}>
              Account
            </Text>
            <View style={styles.SettingsSections}>
              <Image
                source={require('../../images/ActivityIcon.png')}
                style={styles.IconView}></Image>
              <Text
                style={
                  light ? styles.SettingsTitleLight : styles.SettingsTitleDark
                }>
                Your activity
              </Text>

              <TouchableOpacity
                onPress={() => {
                  navigation.push('YourActivity');
                }}>
                <View
                  style={
                    light ? styles.SettingsNextLight : styles.SettingsNextDark
                  }>
                  <Image
                    source={require('../../images/ForwardArrow.png')}
                    style={styles.ForwardArrow}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={light ? styles.DividerLight : styles.DividerDark}></View>
            <View style={styles.SettingsSections}>
              <Image
                source={require('../../images/LogoutIcon.png')}
                style={styles.IconView}></Image>
              <Text
                style={
                  light ? styles.SettingsTitleLight : styles.SettingsTitleDark
                }>
                Sign out
              </Text>

              <TouchableOpacity
                onPress={() => {
                  logout();
                }}>
                <View
                  style={
                    light ? styles.SettingsNextLight : styles.SettingsNextDark
                  }>
                  <Image
                    source={require('../../images/ForwardArrow.png')}
                    style={styles.ForwardArrow}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Drawer;

const styles = StyleSheet.create({
  DrawerContainerLight: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  DrawerContainerDark: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    width: Dimensions.get('window').width,
  },
  ScrollViewStyle: {
    marginBottom: 20,
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
  profileImage: {
    resizeMode: 'cover',
    height: 60,
    width: 60,
    borderRadius: 30,
  },
  MainContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    flexDirection: 'column',
    marginTop: 'auto',
    marginBottom: 20,
    paddingTop: 30,
    paddingLeft: 10,
    paddingRight: 20,
  },
  HeaderTextLight: {
    color: '#121212',
    fontSize: 20,
    fontWeight: 'bold',
    marginEnd: 'auto',
    marginBottom: 20,
  },

  HeaderTextDark: {
    color: '#DADBDD',
    fontSize: 20,
    fontWeight: 'bold',
    marginEnd: 'auto',
    marginBottom: 20,
  },
  AccounSectionView: {
    flexDirection: 'row',
    marginTop: 20,
    height: 100,
    width: Dimensions.get('screen').width,
    marginBottom: 20,
  },
  AccountLogo: {
    borderRadius: 30,
    height: 60,
    width: 60,
    alignItems: 'center',
    backgroundColor: '#edf2f4',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  AccountName: {
    paddingStart: 30,
    justifyContent: 'center',
    marginEnd: 'auto',
  },
  AccountUserNameLight: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
  },
  AccountUserNameDark: {
    color: '#DADBDD',
    fontSize: 18,
    fontWeight: 'bold',
  },
  AccountPersonalInfoLight: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: 'bold',
  },
  AccountPersonalInfoDark: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: 'bold',
  },
  AccountNextLight: {
    height: 50,
    width: 50,
    backgroundColor: '#FFFFFF',
    marginEnd: 'auto',
    marginLeft: 'auto',
    borderRadius: 14,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  AccountNextDark: {
    height: 50,
    width: 50,
    backgroundColor: '#28282b',
    marginEnd: 'auto',
    marginLeft: 'auto',
    borderRadius: 14,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ForwardArrow: {
    height: 20,
    width: 20,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  SettingsSections: {
    marginTop: 10,
    flexDirection: 'row',
    height: 50,
    width: Dimensions.get('screen').width,
  },
  IconView: {
    borderRadius: 25,
    height: 50,
    width: 50,
    alignItems: 'center',
    backgroundColor: '#edf2f4',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  SettingsTitleLight: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
    marginEnd: 'auto',
    textAlignVertical: 'center',
    paddingLeft: 20,
  },
  SettingsTitleDark: {
    color: '#DADBDD',
    fontSize: 18,
    fontWeight: 'bold',
    marginEnd: 'auto',
    textAlignVertical: 'center',
    paddingLeft: 20,
  },
  SettingsNextLight: {
    height: 40,
    width: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 60,
  },
  SettingsNextDark: {
    height: 40,
    width: 40,

    backgroundColor: '#28282b',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 60,
  },
  SettingsInformationContainerLight: {
    marginBottom: 30,
    paddingTop: 10,
    borderRadius: 14,
    backgroundColor: '#EEF5FF',

    opacity: 0.8,
    paddingLeft: 10,
    paddingBottom: 20,
  },
  SettingsInformationContainerDark: {
    marginBottom: 30,
    paddingTop: 10,

    borderRadius: 14,
    backgroundColor: '#191919',

    opacity: 0.8,

    paddingLeft: 10,
    paddingBottom: 20,
  },
  DividerLight: {
    height: 3,
    width: 380,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    opacity: 0.4,
  },
  DividerDark: {
    height: 3,
    width: 380,
    backgroundColor: '#000000',
    marginTop: 10,
    opacity: 0.4,
  },
});
