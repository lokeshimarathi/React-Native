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
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import axios from 'axios';
import {RootStackParamList} from '../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
type LocationProps = NativeStackScreenProps<RootStackParamList, 'Location'>;
const Location = ({navigation, route}: LocationProps) => {
  const email: string = route.params.email;
  const profileImage: string = route.params.profileImage;
  const name: string = route.params.name;
  const username: string = route.params.username;
  const password: string = route.params.password;
  const dateOfBirth: string = route.params.dateOfBirth;
  const gender: string = route.params.gender;
  const profession: string = route.params.profession;
  const companyOrSchool: string = route.params.companyOrSchool;

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({latitude: null, longitude: null});

  const [Location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({latitude: 0, longitude: 0});

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [foundLocation, setFoundLocation] = useState(false);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message: 'Discover App needs access to your location ',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
        setPermissionGranted(true);
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            setCurrentLocation({latitude, longitude});
            setLocation({latitude, longitude});
            setFoundLocation(true);
          },
          error => {
            console.log(error);
            setFoundLocation(false);
          },
        );
      } else {
        console.log('Location permission denied');
        setPermissionGranted(false);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <View style={styles.location}>
      <StatusBar backgroundColor={'#FFFFFF'} barStyle={'dark-content'} />
      <Text style={styles.heading}>Location</Text>
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
              source={require('../images/LocationLogo.png')}
              style={styles.location}
            />
          )}
        </View>
        {/*  <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Location:</Text>
          <Text style={styles.addressText}>{adress ? adress : ''}</Text>
          </View> */}
        <TouchableOpacity
          onPress={async () => {
            await requestLocationPermission();
            if (foundLocation) {
              navigation.replace('Language', {
                profileImage,
                email,
                name,
                username,
                password,
                dateOfBirth,
                gender,
                profession,
                companyOrSchool,
                Location,
              });
            }
          }}
          style={styles.nextButton}>
          <Text style={styles.buttonText}>Next </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  location: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#000000',
    marginStart: 10,
    marginTop: 10,
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

export default Location;
