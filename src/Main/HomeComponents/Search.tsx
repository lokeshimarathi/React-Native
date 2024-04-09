import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  StatusBar,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ActivityIndicator} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import UsersProfile from './Components/UsersProfile';
import {RootStackParamList} from '../../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
type SearchProps = NativeStackScreenProps<RootStackParamList, 'Search'>;
const Search = ({navigation, route}: SearchProps) => {
  const light = useColorScheme() === 'light';
  const [myAuthUserId, setMyAuthUserId] = useState<string>();
  const [searchContext, setSearchContext] = useState<string>();

  const [profiles, setProfiles] = useState<any[]>();
  const [activityIndicatorVisibility, setActivityIndicatorVisibility] =
    useState<boolean>(false);
  const [foundProfile, setFoundProfile] = useState<boolean>(false);
  const [searchIconPressed, setSearchIconPressed] = useState<boolean>(false);
  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      const myAuthUserId = user.uid;
      setMyAuthUserId(myAuthUserId);
    }
  }, []);
  useEffect(() => {
    setActivityIndicatorVisibility(true);
    const fetchUsers = async (search: string) => {
      const user = auth().currentUser;
      if (user) {
        const myAuthUserId = user.uid;
        const snapshot = await database().ref('Users').once('value');
        const users: {
          [key: string]: {
            name: string;
            username: string;
            profession: string;
            profileImage: string;
          };
        } = await snapshot.val();
        if (users) {
          const usersArray = await Promise.all(
            Object.entries(users).map(([key, value]) => {
              if (key !== myAuthUserId) {
                if (
                  typeof value === 'object' &&
                  value !== null &&
                  searchContext
                ) {
                  if (
                    String(value.name).includes(search) ||
                    String(value.username).includes(search) ||
                    String(value.profession).includes(search)
                  ) {
                    setActivityIndicatorVisibility(false);
                    setFoundProfile(true);
                    console.log(value.name);
                    return {
                      authUserId: key,
                      ...value,
                    };
                  } else {
                    setFoundProfile(false);
                    setActivityIndicatorVisibility(false);
                    return null;
                  }
                } else {
                  setFoundProfile(false);
                  setActivityIndicatorVisibility(false);
                  return null;
                }
              } else {
                return null;
              }
            }),
          );
          setProfiles(usersArray.filter(users => users !== null));
        } else {
          setFoundProfile(false);
          setActivityIndicatorVisibility(false);
          Alert.alert('No Users found..');
        }
      }
    };
    fetchUsers(String(searchContext));
  }, [searchContext, searchIconPressed]);
  return (
    <View style={light ? styles.SearchLight : styles.SearchDark}>
      <StatusBar
        backgroundColor={light ? '#FFFFFF' : '#000000'}
        barStyle={light ? 'dark-content' : 'light-content'}
      />

      <View style={styles.MainContainer}>
        <View
          style={
            light ? styles.SearchContainerLight : styles.SearchContainerDark
          }>
          <Image
            source={require('../../images/logo.png')}
            style={styles.logo}
          />
          <TextInput
            onChangeText={e => {
              setSearchContext(e.trim());
            }}
            placeholderTextColor={light ? '#191919' : '#F6F1F1'}
            placeholder="Search by name or profession..."
            style={light ? styles.TextInputLight : styles.TextInputDark}
            inputMode="search"
          />
          <TouchableOpacity
            onPress={() => {
              if (searchContext) {
                setSearchIconPressed(!searchIconPressed);
              }
            }}>
            <Icon
              style={{
                paddingRight: 20,
              }}
              name="search"
              size={30}
              color={light ? '#191919' : '#F6F1F1'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.SearchView}>
          {searchContext ? (
            <View>
              {activityIndicatorVisibility ? (
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                  }}>
                  <ActivityIndicator
                    size={'large'}
                    color="#40A2E3"
                    style={{alignSelf: 'center'}}
                  />
                </View>
              ) : (
                <View>
                  {foundProfile ? (
                    <FlatList
                      data={profiles}
                      keyExtractor={item => item.authUserId}
                      renderItem={({item}) => (
                        <TouchableOpacity
                          onPress={() => {
                            if (item.authUserId === myAuthUserId) {
                              navigation.push('Profile');
                            } else {
                              navigation.push('UsersProfile', {
                                usersAuthUserId: item.authUserId,
                              });
                            }
                          }}
                          style={
                            light ? styles.UserCardLight : styles.UserCardDark
                          }>
                          <View style={styles.UserDetails}>
                            <Image
                              source={{
                                uri: item.profileImage
                                  ? item.profileImage
                                  : 'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg',
                              }}
                              style={styles.UserProfileImage}
                            />
                            <View style={styles.NameProfessionBlock}>
                              <Text
                                style={
                                  light
                                    ? styles.UserNameLight
                                    : styles.UserNameDark
                                }>
                                {item.name}
                              </Text>

                              <Text
                                style={
                                  light
                                    ? styles.UserProfessionLight
                                    : styles.UserProfessionDark
                                }>
                                {item.profession}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}
                    />
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Image
                        source={require('../../images/NoDataIcon.png')}
                        style={{height: 150, width: 150}}
                      />
                      <Text
                        style={[
                          light
                            ? styles.HeaderTextLight
                            : styles.HeaderTextDark,
                          {fontSize: 12},
                        ]}>
                        No users found for your requirement!
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ) : (
            <View
              style={[
                styles.SearchView,
                {justifyContent: 'center', marginBottom: 30},
              ]}>
              <View>
                <Image
                  source={require('../../images/SearchLogo.png')}
                  style={styles.SearchLogo}
                />
                <Text
                  style={
                    light ? styles.HeaderTextLight : styles.HeaderTextDark
                  }>
                  Discover and connect with anyone
                </Text>
                <Text
                  style={
                    light
                      ? styles.DescriptionTextLight
                      : styles.DescriptionTextDark
                  }>
                  Resolve your issue by connecting
                </Text>
                <Text
                  style={
                    light
                      ? styles.DescriptionTextLight
                      : styles.DescriptionTextDark
                  }>
                  with someone directly on a personal level.
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  SearchLight: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    height: 30,
    width: 30,
    marginEnd: 10,
    marginLeft: 10,
  },
  SearchDark: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  MainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  SearchContainerLight: {
    height: 50,
    width: Dimensions.get('screen').width - 20,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 0.8,
    borderColor: '#191919',
    marginTop: 30,
    paddingEnd: 'auto',
  },
  SearchContainerDark: {
    height: 50,
    width: Dimensions.get('screen').width - 20,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#191919',
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 0.8,
    borderColor: '#F6F1F1',
    marginTop: 30,
    paddingEnd: 'auto',
  },
  TextInputLight: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#191919',
    width: Dimensions.get('screen').width - 120,
    height: 50,
    paddingRight: 10,
  },
  TextInputDark: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#F6F1F1',
    width: Dimensions.get('screen').width - 120,
    height: 50,
    paddingRight: 10,
  },
  SearchView: {
    flex: 1,
    alignItems: 'center',
  },
  SearchLogo: {
    alignSelf: 'center',
    height: 250,
    width: 250,
  },
  HeaderTextLight: {
    marginTop: 20,
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    alignSelf: 'center',
  },

  HeaderTextDark: {
    marginTop: 20,
    color: '#DADBDD',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
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
  UserCardLight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7F8',
    height: 80,
    width: 380,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    marginTop: 10,
    borderRadius: 14,
  },
  UserCardDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#35374B',
    height: 80,
    width: 380,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    marginTop: 10,
    borderRadius: 14,
  },
  UserDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: Dimensions.get('window').width,
  },
  UserProfileImage: {
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  NameProfessionBlock: {
    flexDirection: 'column',
    paddingHorizontal: 10,
  },
  UserNameLight: {
    color: '#121212',
    fontSize: 14,
    fontWeight: 'bold',
    marginEnd: 'auto',
  },
  UserNameDark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginEnd: 'auto',
  },
  UserProfessionLight: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: 'bold',
    marginEnd: 'auto',
  },
  UserProfessionDark: {
    color: '#E5E1DA',
    fontSize: 14,
    fontWeight: 'bold',

    marginEnd: 'auto',
  },
  ProblemDescriptionLight: {
    paddingHorizontal: 10,
    color: '#121212',
  },
  ProblemDescriptionDark: {
    paddingHorizontal: 10,
    color: '#DADBDD',
  },
  MediaContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});

export default Search;
