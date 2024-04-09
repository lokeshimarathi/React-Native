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
  Modal,
  ActivityIndicator,
} from 'react-native';
import React, {useState} from 'react';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import * as Animatable from 'react-native-animatable';
const Help = () => {
  const light = useColorScheme() === 'light';
  const [problem, setProblem] = useState<string>('');
  const [modalVisibility, setModalVisibility] = useState<boolean>(false);
  const [updateConditionSuccessfull, setUpdateConditionSuccessfull] =
    useState<boolean>(false);
  const uploadProblem = async (problem: string) => {
    setModalVisibility(true);

    const dateFormat = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeFormat = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const currentDate = dateFormat.format(new Date());
    const currentTime = timeFormat.format(new Date());
    const currentTimestamp = Math.floor(new Date().getTime() / 1000);
    const user = auth().currentUser;
    if (user) {
      const authUserId = user.uid;
      await database()
        .ref()
        .child('UsersProblems')
        .child(`${currentTimestamp}`)
        .child('authUserId')
        .set(authUserId);
      await database()
        .ref()
        .child('UsersProblems')
        .child(`${currentTimestamp}`)
        .child('problem')
        .set(problem);
      await database()
        .ref()
        .child('UsersProblems')
        .child(`${currentTimestamp}`)
        .child('date')
        .set(currentDate);
      await database()
        .ref()
        .child('UsersProblems')
        .child(`${currentTimestamp}`)
        .child('time')
        .set(currentTime);
      setUpdateConditionSuccessfull(true);
      setProblem('');
    }
  };

  return (
    <View style={light ? styles.HelpContainerLight : styles.HelpContainerDark}>
      <StatusBar
        barStyle={light ? 'dark-content' : 'light-content'}
        backgroundColor={light ? '#FFFFFF' : '#000000'}
      />
      <Modal
        transparent={true}
        visible={modalVisibility}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <StatusBar
            backgroundColor={'rgba(0,0,0,0.5)'}
            barStyle={'light-content'}
          />
          {updateConditionSuccessfull ? (
            <View
              style={
                light
                  ? styles.ProfileUpdateCardLight
                  : styles.ProfileUpdateCardDark
              }>
              <Animatable.Image
                animation={'pulse'}
                iterationCount={'infinite'}
                source={require('../../images/CheckMark.png')}
                style={[styles.UpdateProfileLogo, {height: 100, width: 100}]}
              />
              <Text
                style={[
                  light
                    ? styles.DescriptionTextLight
                    : styles.DescriptionTextDark,
                  {color: '#59CE8F'},
                ]}>
                Problem posted successfully! wait for team review
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisibility(false);
                  setUpdateConditionSuccessfull(false);
                }}>
                <Text
                  style={[
                    light
                      ? styles.DescriptionTextLight
                      : styles.DescriptionTextDark,
                    {alignSelf: 'flex-end'},
                  ]}>
                  Ok
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={
                light
                  ? styles.ProfileUpdateCardLight
                  : styles.ProfileUpdateCardDark
              }>
              <Image
                source={require('../../images/UploadLogo.png')}
                style={styles.UpdateProfileLogo}
              />
              <Text
                style={
                  light
                    ? styles.DescriptionTextLight
                    : styles.DescriptionTextDark
                }>
                Please wait posting your problem to team..
              </Text>
              <ActivityIndicator
                size={25}
                color={light ? '#35374B' : '#FFFFFF'}
                style={{alignSelf: 'center', marginTop: 20}}
              />
            </View>
          )}
        </View>
      </Modal>
      <View style={styles.headerContainer}>
        <Text style={light ? styles.textLight : styles.textDark}>
          Need help
        </Text>
      </View>
      <Text style={styles.Discription}>
        Please define your problem below so that we can get in touch with you.
      </Text>
      <View style={styles.CenterContainer}>
        <Image
          source={require('../../images/HelpLogo.png')}
          style={styles.HelpLogo}
        />
        <TextInput
          style={light ? styles.TextInputLight : styles.TextInputDark}
          placeholder="Please define your problem here"
          placeholderTextColor={'#B0B0B0'}
          value={problem}
          onChangeText={e => {
            setProblem(e);
          }}
          multiline={true}
          numberOfLines={4}></TextInput>
        <TouchableOpacity
          onPress={() => {
            if (problem !== '') {
              uploadProblem(problem);
            } else {
              Alert.alert('Please define your problem...');
            }
          }}
          style={styles.SendButton}>
          <Text style={{fontSize: 16, fontWeight: 'bold', color: '#FFFFFF'}}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  HelpContainerLight: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  HelpContainerDark: {
    flex: 1,
    backgroundColor: '#000000',
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
    fontSize: 20,
    marginEnd: 'auto',
    paddingHorizontal: 20,
  },
  CenterContainer: {
    flex: 1,
    alignItems: 'center',
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
  TextInputDark: {
    fontWeight: 'bold',
    fontSize: 15,
    borderWidth: 1,
    height: 200,
    marginTop: 10,
    marginBottom: 10,
    width: Dimensions.get('screen').width - 40,
    borderRadius: 10,
    backgroundColor: '#000000',
    borderColor: '#B0B0B0',
    textAlign: 'left',
    textAlignVertical: 'top',
    color: '#FFFFFF',
    padding: 10,
  },
  SendButton: {
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
  HelpLogo: {
    height: 250,
    width: 250,
    paddingTop: 20,
    marginTop: 20,
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
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
  DescriptionTextLight: {
    color: '#121212',

    textAlign: 'center',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  DescriptionTextDark: {
    color: '#DADBDD',
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
  },
  ProfileUpdateCardLight: {
    height: 300,
    width: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: 10,
    shadowColor: '#000000',
    shadowRadius: 20,
    elevation: 14,
    shadowOpacity: 0.5,
  },
  ProfileUpdateCardDark: {
    height: 300,
    width: 300,
    backgroundColor: '#31363F',
    borderRadius: 14,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowRadius: 20,
    elevation: 14,
    shadowOpacity: 0.5,
  },
  UpdateProfileLogo: {
    height: 150,
    width: 150,
  },
});

export default Help;
