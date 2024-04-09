import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Image} from 'react-native-animatable';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icons from 'react-native-vector-icons/MaterialIcons';
import {RootStackParamList} from '../../../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import database from '@react-native-firebase/database';
import MessageComponent from './MessageComponent';
type UsersProfileProps = NativeStackScreenProps<
  RootStackParamList,
  'UsersProfile'
>;
const UsersProfile = ({navigation, route}: UsersProfileProps) => {
  const usersAuthUserId: string = route.params.usersAuthUserId;
  const light = useColorScheme() === 'light';
  const [cloudBackgroundImage, setCloudBackgroundImage] = useState<string>('');
  const [usersData, setUsersData] = useState<{
    backgroundImage: string;
    profileImage: string;
    name: string;
    username: string;
    profession: string;
    companyOrSchool: string;
    interest: string;
    gender: string;
    dateOfBirth: string;
    language: string;
    about: string;
    email: string;
  }>();
  const [activityIndicatorVisibility, setActivityIndicatorVisibility] =
    useState<boolean>(false);
  useEffect(() => {
    const fetchBackgroundImage = async () => {
      const image = (
        await database().ref('Contents').child('backgroundImage').once('value')
      ).val();
      setCloudBackgroundImage(image);
    };
    fetchBackgroundImage();
  }, []);
  useEffect(() => {
    const fetchUsersData = async () => {
      setActivityIndicatorVisibility(true);
      try {
        const databaseReference = await database()
          .ref(`Users/${usersAuthUserId}/`)
          .once('value');
        if (databaseReference.exists()) {
          const usersData: {
            backgroundImage: string;
            profileImage: string;
            name: string;
            username: string;
            profession: string;
            companyOrSchool: string;
            interest: string;
            gender: string;
            dateOfBirth: string;
            language: string;
            about: string;
            email: string;
          } = await databaseReference.val();
          if (usersData) {
            setActivityIndicatorVisibility(false);
            setUsersData(usersData);
          } else {
            Alert.alert('Error, please try again...');
            setActivityIndicatorVisibility(false);
            return null;
          }
        }
      } catch (error) {
        Alert.alert('Error, please try again...');
      } finally {
        setActivityIndicatorVisibility(false);
      }
    };
    fetchUsersData();
  }, []);

  const handleEmail = () => {
    const emailUrl = `mailto:${usersData?.email}?subject=help&body=Hi,this is ${usersData?.name} `;
    Linking.openURL(emailUrl)
      .then((result: any) => {
        console.log(result);
      })
      .catch(error => {
        Alert.alert('Error,please try again...');
        console.error(error);
      });
  };

  return (
    <View style={light ? styles.UsersProfileLight : styles.UsersProfileDark}>
      <StatusBar
        backgroundColor="transparent"
        barStyle={'light-content'}
        translucent={true}
      />
      {activityIndicatorVisibility ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ActivityIndicator
            size={50}
            style={{alignSelf: 'center'}}
            color="#40A2E3"
          />
        </View>
      ) : (
        <View>
          <View style={styles.UsersImagesContainer}>
            <TouchableOpacity
              onPress={() => {
                if (usersData?.backgroundImage) {
                  navigation.push('MediaView', {
                    media: usersData.backgroundImage,
                    mediaType: 'image',
                  });
                } else {
                  navigation.push('MediaView', {
                    media:
                      'https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2020/07/Featured-Image-1.jpg?resize=750,469',
                    mediaType: 'image',
                  });
                }
              }}>
              <Image
                source={{
                  uri: usersData?.backgroundImage
                    ? usersData.backgroundImage
                    : cloudBackgroundImage,
                }}
                style={styles.BackgroundImage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={light ? styles.profileImageLight : styles.profileImageDark}
              onPress={() => {
                if (usersData?.profileImage) {
                  navigation.push('MediaView', {
                    media: usersData.profileImage,
                    mediaType: 'image',
                  });
                } else {
                  navigation.push('MediaView', {
                    media:
                      'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg',
                    mediaType: 'image',
                  });
                }
              }}>
              <Image
                source={{
                  uri: usersData?.profileImage
                    ? usersData.profileImage
                    : 'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg',
                }}
                style={
                  light ? styles.profileImageLight : styles.profileImageDark
                }
              />
            </TouchableOpacity>
          </View>

          <View style={styles.MainContainer}>
            <View>
              <Text
                style={light ? styles.HeaderTextLight : styles.HeaderTextDark}>
                {usersData?.name}
              </Text>
              <Text
                style={
                  light
                    ? styles.DescriptionTextLight
                    : styles.DescriptionTextDark
                }>
                {`@${usersData?.username}`}
              </Text>
              <Text
                style={
                  light
                    ? styles.DescriptionTextLight
                    : styles.DescriptionTextDark
                }>
                {usersData?.profession}, {usersData?.companyOrSchool}
              </Text>
              <Text
                style={
                  light
                    ? styles.DescriptionTextLight
                    : styles.DescriptionTextDark
                }>
                🧑🏻‍💻 Interested in {usersData?.interest}
              </Text>
              <Text
                style={
                  light
                    ? styles.DescriptionTextLight
                    : styles.DescriptionTextDark
                }>
                👤{usersData?.gender} 📆 {usersData?.dateOfBirth}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignSelf: 'center',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <Image
                  source={require('../../../images/LanguageIcon.png')}
                  style={styles.LanguageIcon}
                />
                <Text
                  style={
                    light
                      ? styles.DescriptionTextLight
                      : styles.DescriptionTextDark
                  }>
                  {usersData?.language}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',

                  marginTop: 20,
                  alignSelf: 'flex-start',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.push('MessageComponent', {
                      recieverAuthUserId: usersAuthUserId,
                    });
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignSelf: 'flex-start',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 20,
                      height: 60,
                      width: 300,
                      backgroundColor: light ? '#F5F7F8' : '#31363F',
                      borderRadius: 40,
                    }}>
                    <Icon
                      style={{opacity: 0.8}}
                      name="comments-o"
                      size={25}
                      color={light ? '#000000' : '#FFFFFF'}
                    />
                    <Text
                      style={[
                        light
                          ? styles.DescriptionTextLight
                          : styles.DescriptionTextDark,
                        {
                          fontSize: 20,
                          fontWeight: 'bold',
                          marginHorizontal: 10,
                          opacity: 0.8,
                        },
                      ]}>
                      Message
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEmail}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignSelf: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 60,
                      width: 60,
                      backgroundColor: light ? '#F5F7F8' : '#31363F',
                      borderRadius: 30,
                      marginRight: 10,
                    }}>
                    <Icons
                      style={{opacity: 0.8}}
                      name="email"
                      size={25}
                      color={light ? '#000000' : '#FFFFFF'}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={
                light
                  ? styles.InterestContainerLight
                  : styles.InterestContainerDark
              }>
              <Text
                style={[
                  light ? styles.HeaderTextLight : styles.HeaderTextDark,
                  {fontSize: 16, alignSelf: 'flex-start', marginHorizontal: 10},
                ]}>
                About
              </Text>
              <Text
                style={[
                  light
                    ? styles.DescriptionTextLight
                    : styles.DescriptionTextDark,
                  {textAlign: 'left'},
                ]}>
                {usersData?.about}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default UsersProfile;

const styles = StyleSheet.create({
  UsersProfileLight: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  UsersProfileDark: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  UsersImagesContainer: {
    height: 260,
    width: Dimensions.get('screen').width,
    alignItems: 'center',
  },
  BackgroundImage: {
    resizeMode: 'cover',
    height: 200,
    width: Dimensions.get('screen').width,
  },

  profileImageLight: {
    borderRadius: 50,
    height: 100,
    width: 100,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    resizeMode: 'cover',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 150,
  },
  profileImageDark: {
    borderRadius: 50,
    height: 100,
    width: 100,
    borderWidth: 3,
    borderColor: '#000000',
    resizeMode: 'cover',
    backgroundColor: '#000000',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 150,
  },
  MainContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    flexDirection: 'column',
    marginBottom: 'auto',

    alignItems: 'center',
  },

  HeaderTextLight: {
    color: '#121212',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    alignSelf: 'center',
  },

  HeaderTextDark: {
    color: '#DADBDD',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    alignSelf: 'center',
  },
  DescriptionTextLight: {
    color: '#121212',

    textAlign: 'center',
    alignSelf: 'center',
  },
  DescriptionTextDark: {
    color: '#DADBDD',

    textAlign: 'center',
    alignSelf: 'center',
  },
  LanguageIcon: {
    height: 25,
    width: 35,
    resizeMode: 'stretch',
    alignSelf: 'center',
    marginHorizontal: 10,
  },
  InterestContainerLight: {
    paddingVertical: 10,
    width: Dimensions.get('screen').width - 30,
    alignSelf: 'center',
    backgroundColor: '#F5F7F8',
    marginTop: 20,
    borderRadius: 8,
    opacity: 0.8,
  },
  InterestContainerDark: {
    paddingVertical: 10,
    width: Dimensions.get('screen').width - 30,
    alignSelf: 'center',
    backgroundColor: '#31363F',
    marginTop: 20,
    borderRadius: 8,
    opacity: 0.8,
  },
});
