import React, {useState} from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  FlatList,
} from 'react-native';
import {RootStackParamList} from '../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  ImageLibraryOptions,
  MediaType,
  launchImageLibrary,
} from 'react-native-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
type ProfileCreating = NativeStackScreenProps<
  RootStackParamList,
  'ProfileCreating'
>;
type ProfileCreatingProps = NativeStackScreenProps<
  RootStackParamList,
  'ProfileCreating'
>;
const ProfileCreating = ({navigation, route}: ProfileCreatingProps) => {
  const email = route.params.email;
  const name = route.params.name;
  const username = route.params.username;
  const password = route.params.password;
  const [profileImage, setProfileImage] = useState<string>(
    'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg',
  );

  const [gender, setGender] = useState<string>('');
  const [profession, setProfession] = useState<string>('');
  const [companyOrSchool, setCompanyOrSchool] = useState<string>('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isGenderSelectionMenu, setIsGenderSelectionMenu] = useState(false);
  const genderMenu = [
    {id: 1, label: 'Male'},
    {id: 2, label: 'Female'},
    {id: 3, label: 'Other'},
    {id: 4, label: 'Custom'},
  ];

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    const today = new Date();
    if (date > today) {
      Alert.alert('Cannot select date..!');
      hideDatePicker();
    } else {
      const adjustedDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000,
      );
      setDateOfBirth(adjustedDate.toISOString().substring(0, 10));
      hideDatePicker();
    }
  };

  const openImageLibrary = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType, // Specify the media type (photo, video, or mixed) with the correct type
      maxWidth: 300, // Maximum width of the image
      maxHeight: 300, // Maximum height of the image
      quality: 0.8, // Image quality (0 to 1)
    };

    const result = await launchImageLibrary(options); // Call launchImageLibrary with options
    if (!result?.didCancel && !result?.errorCode) {
      const firstAsset = result?.assets?.[0];
      if (firstAsset?.uri) {
        setProfileImage(firstAsset.uri);
      } else {
        // Handle the case where the uri is missing
        console.error('Image uri is missing in the response:', result);
      }
    } else {
      // Handle the case where the user cancelled or an error occurred
      console.error(
        'Image picking cancelled or error occurred:',
        result?.errorMessage,
      );
    }
  };
  const genderSelection = () => {
    setIsGenderSelectionMenu(true);
  };

  return (
    <View style={styles.ProfileCreating}>
      <StatusBar backgroundColor={'#FFFFFF'} barStyle={'dark-content'} />
      <Text style={styles.Heading}>Profile Creating</Text>
      <Text style={styles.Discription}>Your journey begins with a </Text>
      <Text style={styles.Discription}>single sign up.</Text>

      <View style={styles.CenterContainer}>
        <TouchableOpacity
          onPress={() => {
            openImageLibrary();
          }}>
          <Image
            source={{uri: profileImage}}
            style={styles.ProfileCreatingLogo}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={showDatePicker}>
          {dateOfBirth !== '' ? (
            <Text
              style={[
                styles.TextInput,
                {textAlignVertical: 'center', paddingLeft: 5},
              ]}>
              {dateOfBirth}
            </Text>
          ) : (
            <Text
              style={[
                styles.TextInput,
                {color: '#B0B0B0', textAlignVertical: 'center', paddingLeft: 5},
              ]}>
              select date of birth
            </Text>
          )}
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />

        <TouchableOpacity onPress={genderSelection}>
          {gender !== '' ? (
            <Text
              style={[
                styles.TextInput,
                {textAlignVertical: 'center', paddingLeft: 5},
              ]}>
              {gender}
            </Text>
          ) : (
            <Text
              style={[
                styles.TextInput,
                {
                  color: '#B0B0B0',
                  textAlignVertical: 'center',
                  paddingLeft: 5,
                },
              ]}>
              select Gender
            </Text>
          )}
        </TouchableOpacity>
        {isGenderSelectionMenu ? (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              height: 150,
              width: 300,
              alignSelf: 'center',
              elevation: 2,
              borderRadius: 5,
            }}>
            <FlatList
              data={genderMenu}
              keyExtractor={item => item.id.toFixed()}
              renderItem={({item}) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setGender(item.label);
                      setIsGenderSelectionMenu(false);
                    }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 18,
                        color: '#c0c0c0',
                        textAlign: 'left',
                        marginVertical: 5,
                        marginHorizontal: 10,
                        borderBottomColor: '#d3d3d3',
                        borderTopWidth: 0,
                        borderWidth: 1,
                        borderStartWidth: 0,
                        borderEndWidth: 0,
                        borderLeftWidth: 0,
                        borderRightWidth: 0,
                      }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        ) : (
          <View></View>
        )}
        <TextInput
          style={styles.TextInput}
          placeholder="profession"
          placeholderTextColor={'#B0B0B0'}
          onChangeText={e => {
            setProfession(e);
          }}></TextInput>
        <TextInput
          style={styles.TextInput}
          placeholder="company/school"
          placeholderTextColor={'#B0B0B0'}
          onChangeText={e => {
            setCompanyOrSchool(e);
          }}></TextInput>
        <TouchableOpacity
          onPress={() => {
            if (
              profileImage !==
                'https://i.pinimg.com/736x/fe/f3/95/fef3956baa6a5c13f6d47fc98f696faf.jpg' &&
              dateOfBirth !== '' &&
              gender !== '' &&
              profession !== '' &&
              companyOrSchool !== ''
            ) {
              navigation.replace('Location', {
                profileImage,
                email,
                name,
                username,
                password,
                dateOfBirth,
                gender,
                profession,
                companyOrSchool,
              });
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
  ProfileCreating: {
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
    marginBottom: 100,
  },
  ProfileCreatingLogo: {
    borderRadius: 50,
    height: 100,
    width: 100,
    marginBottom: 20,
  },
  TextViewBox: {
    fontWeight: 'bold',
    fontSize: 15,

    height: 40,
    marginTop: 10,
    marginLeft: 10,
    width: 300,
    textAlign: 'left',
    color: '#B0B0B0',
  },
  TextInput: {
    marginLeft: 10,
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

export default ProfileCreating;
