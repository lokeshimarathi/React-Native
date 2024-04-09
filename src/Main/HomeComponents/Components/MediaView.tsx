import {
  Alert,
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {RootStackParamList} from '../../../../App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Image} from 'react-native-animatable';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ActivityIndicator} from 'react-native-paper';
type MediaViewProps = NativeStackScreenProps<RootStackParamList, 'MediaView'>;
const MediaView = ({navigation, route}: MediaViewProps) => {
  const media: string = route.params.media;
  const mediaType: string = route.params.mediaType;
  const light = useColorScheme() === 'light';
  const [mediaVideoPaused, setMediaVidePaused] = useState<boolean>(false);
  const [mediaVideoPressed, setMediaVideoPressed] = useState<Boolean>(false);
  const [activityIndicatorVisibility, setActivityIndicatorVisibility] =
    useState<boolean>(false);
  const [data, setData] = useState();
  useEffect(() => {
    const fetchData = async () => {
      setActivityIndicatorVisibility(true);
      const data = await fetch(media);

      if (!data) {
        Alert.alert('Error, please try again...');
        setActivityIndicatorVisibility(false);
      } else {
        setActivityIndicatorVisibility(false);
      }
    };
    fetchData();
  }, [media]);

  return (
    <View style={light ? styles.MediViewLight : styles.MediViewDark}>
      <StatusBar
        backgroundColor={'#000000'}
        barStyle={'light-content'}
        translucent={false}
      />

      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {activityIndicatorVisibility ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ActivityIndicator
              size={'large'}
              color="#40A2E3"
              style={{alignSelf: 'center'}}
            />
          </View>
        ) : (
          <>
            {mediaType === 'image' ? (
              <View
                style={{
                  borderRadius: 24,
                  overflow: 'hidden',
                }}>
                <Image source={{uri: media}} style={styles.MediaImage} />
              </View>
            ) : (
              <View
                style={{
                  borderRadius: 24,
                  overflow: 'hidden',
                }}>
                <Pressable
                  onPress={() => {
                    setMediaVideoPressed(!mediaVideoPressed);
                  }}>
                  <Video
                    source={{uri: media}}
                    style={styles.MediaVideo}
                    resizeMode="contain"
                    paused={mediaVideoPaused}
                    onEnd={() => {
                      setMediaVidePaused(true);
                      setMediaVideoPressed(true);
                    }}
                    onProgress={() => {
                      setActivityIndicatorVisibility(false);
                    }}
                  />
                </Pressable>

                {mediaVideoPressed && (
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      height: 500,
                      width: 500,
                      borderRadius: 14,
                      marginBottom: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <View>
                      <TouchableOpacity
                        onPress={() => {
                          if (mediaVideoPaused) {
                            setMediaVideoPressed(false);
                          } else {
                            setMediaVideoPressed(true);
                          }
                          setMediaVidePaused(!mediaVideoPaused);
                        }}
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <View
                          style={{
                            borderRadius: 50,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            padding: 10,
                            alignSelf: 'center',
                            transform: [{translateX: 15}, {translateY: -15}],
                          }}>
                          <Icon
                            color={'#FFFFFF'}
                            name={mediaVideoPaused ? 'play-arrow' : 'pause'}
                            size={30}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default MediaView;

const styles = StyleSheet.create({
  MediViewLight: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  MediViewDark: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  MediaImage: {
    resizeMode: 'contain',
    height: 500,
    width: 500,
    // padding: 20,
    borderRadius: 14,
    paddingHorizontal: 10,
    backgroundColor: '#31363F',
  },
  MediaVideo: {
    height: 500,
    width: 500,
    padding: 20,
    borderRadius: 14,
    marginHorizontal: 20,
    backgroundColor: 'transparent',
  },
});
