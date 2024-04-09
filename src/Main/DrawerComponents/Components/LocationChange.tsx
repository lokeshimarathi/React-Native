import React, {useEffect, useState} from 'react';
import {
  Button,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Dimensions,
  PermissionsAndroid,
  useColorScheme,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import Geolocation from '@react-native-community/geolocation';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';

import {RootStackParamList} from '../../../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
type LocationChangeProps = NativeStackScreenProps<
  RootStackParamList,
  'LocationChange'
>;

const LocationChange = ({navigation, route}: LocationChangeProps) => {
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({latitude: null, longitude: null});

  const [Location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({latitude: 0, longitude: 0});
  const [foundLocation, setFoundLocation] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>('Location');
  const getCurrentLocation = () => {
    Alert.alert('Please wait...\nYourcurrent Location is fetching');
    const requestLocationPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message: 'Cool Discover App needs access to your location ',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
          Geolocation.getCurrentPosition(
            position => {
              const {latitude, longitude} = position.coords;
              setCurrentLocation({latitude, longitude});
              setLocation({latitude, longitude});
              setFoundLocation(true);
              setButtonText('Update');
              Alert.alert('Your current Location updated');
            },
            error => {
              Alert.alert('Error,Please try again...!');
            },
          );
        } else {
          Alert.alert('Permission denied...!');
        }
      } catch (err) {
        console.warn(err);
      }
    };
    requestLocationPermission();
  };
  const light = useColorScheme() === 'light';
  const updateLocation = async () => {
    Alert.alert('Please wait...');
    const user = auth().currentUser;
    if (user) {
      const authUserId = user.uid;
      try {
        await database()
          .ref(`Users/${authUserId}/`)
          .update({
            location: {
              latitude: String(Location.latitude),
              longitude: String(Location.longitude),
            },
          })
          .then(() => {
            Alert.alert('Location updated...');
            navigation.pop();
          });
      } catch {
        Alert.alert('Error... please try again..');
      }
    }
  };

  return (
    <View style={light ? styles.locationLight : styles.locationDark}>
      <StatusBar
        backgroundColor={light ? '#FFFFFF' : '#000000'}
        barStyle={light ? 'dark-content' : 'light-content'}
      />
      <Text style={light ? styles.headingLight : styles.headingDark}>
        Location
      </Text>
      <Text style={styles.description}>Select your current location 📌</Text>

      <View style={styles.centerContainer}>
        <View style={styles.mapContainer}>
          {foundLocation ? (
            <MapView
              provider={PROVIDER_GOOGLE}
              toolbarEnabled={true}
              followsUserLocation={true}
              moveOnMarkerPress={true}
              style={styles.map}
              region={{
                latitude: currentLocation.latitude || 37.78825,
                longitude: currentLocation.longitude || 37.78825,
                latitudeDelta: 0.15,
                longitudeDelta: 0.0121,
              }}
              onRegionChange={newRegion => {
                const {latitude, longitude} = newRegion;
                setLocation({latitude, longitude});
              }}
              showsMyLocationButton={true}>
              <Marker
                draggable={true}
                key={1}
                coordinate={{
                  latitude: Location.latitude || 64.165329,
                  longitude: Location.longitude || 48.844287,
                }}
                title="Your Location"
              />
            </MapView>
          ) : (
            <Image
              source={
                light
                  ? require('../../../images/LocationLogo.png')
                  : require('../../../images/LocationLogoDark.png')
              }
              style={light ? styles.locationLight : styles.locationDark}
            />
          )}
        </View>

        <TouchableOpacity
          onPress={() => {
            getCurrentLocation();
            if (foundLocation) {
              updateLocation();
            }
          }}
          style={styles.nextButton}>
          <Text style={styles.buttonText}>{buttonText} </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  locationLight: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  locationDark: {
    backgroundColor: '#000000',
    flex: 1,
  },
  headingLight: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#000000',
    marginStart: 10,
    marginTop: 30,
    elevation: 10,
  },
  headingDark: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginStart: 10,
    marginTop: 30,
    elevation: 10,
  },
  description: {
    color: '#B0B0B0',
    fontWeight: 'bold',
    fontSize: 22,
    marginStart: 10,
    elevation: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 50,
  },
  mapContainer: {
    height: '75%',
    width: Dimensions.get('screen').width - 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
    alignSelf: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  addressContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  addressLabel: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  addressText: {
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 5,
  },
  nextButton: {
    margin: 10,
    borderRadius: 30,
    backgroundColor: '#429BEE',
    height: 45,
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    marginBottom: 30,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default LocationChange;
