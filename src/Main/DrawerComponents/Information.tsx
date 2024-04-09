import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  Share,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import database from '@react-native-firebase/database';
import Video from 'react-native-video';

const Information = () => {
  const informationAnimatable =
    Animatable.createAnimatableComponent(Information);
  const [highlightImage, setHighlightImage] = useState<string>();
  const light = useColorScheme() === 'light';
  const [highlightVideo, setHighLightVideo] = useState<string>('');
  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await database().ref('Contents/').once('value');
        const data = await snapshot.val();
        if (data) {
          setHighlightImage(data.highlightImage);
        }
      } catch (error: any) {
        console.log(error);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchHighlightVideo = async () => {
      const video = (
        await database().ref('Contents').child('highlightVideo').once('value')
      ).val();
      setHighLightVideo(video);
    };
    fetchHighlightVideo();
  }, []);

  return (
    <View
      style={
        light
          ? styles.InformationContainerLight
          : styles.InformationContainerDark
      }>
      <StatusBar
        barStyle={light ? 'dark-content' : 'light-content'}
        backgroundColor={light ? '#FFFFFF' : '#000000'}
      />
      <View style={styles.headerContainer}>
        <Text style={light ? styles.textLight : styles.textDark}>
          Information
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}>
        <Animatable.View
          animation="slideInUp"
          iterationCount={1}
          duration={1000}
          style={styles.MainContainer}>
          <Video
            source={{uri: highlightVideo}}
            resizeMode="cover"
            muted
            repeat={true}
            style={styles.HighlightImage}
          />
          <View style={styles.InformationContainerCard}>
            <View style={styles.InformationContainerCardText}>
              <Text
                style={light ? styles.HeaderTextLight : styles.HeaderTextDark}>
                Discover - Your Knowledge Hub
              </Text>
              <Text
                numberOfLines={13}
                style={
                  light
                    ? styles.DescriptionTextLight
                    : styles.DescriptionTextDark
                }>
                Discover is your go-to destination for finding answers to all
                your questions and doubts. With a diverse range of content
                formats and an engaged community, Discover makes learning and
                problem-solving easy and enjoyable.
              </Text>
            </View>
            <View style={styles.ImageContainer}>
              <Image
                source={require('../../images/LittleGirlLaptopUsing.jpg')}
                style={styles.InformationLogo}
              />
            </View>
          </View>
          <View style={styles.InformationContainerCard}>
            <View style={styles.ImageContainer}>
              <Image
                source={require('../../images/WomenSolutionGetting.jpg')}
                style={styles.InformationLogo}
              />
            </View>
            <View style={styles.InformationContainerCardText}>
              <Text
                style={light ? styles.HeaderTextLight : styles.HeaderTextDark}>
                Explore Varied Content Formats
              </Text>
              <Text
                numberOfLines={13}
                style={
                  light
                    ? styles.DescriptionTextLight
                    : styles.DescriptionTextDark
                }>
                Whether you prefer reading detailed explanations, watching
                informative videos, or engaging in interactive chats, Discover
                offers solutions in multiple formats to suit your learning style
                and preferences.
              </Text>
            </View>
          </View>
          <View style={styles.InformationContainerCard}>
            <View style={styles.InformationContainerCardText}>
              <Text
                style={light ? styles.HeaderTextLight : styles.HeaderTextDark}>
                Connect, Learn, and Grow
              </Text>
              <Text
                numberOfLines={13}
                style={
                  light
                    ? styles.DescriptionTextLight
                    : styles.DescriptionTextDark
                }>
                Join a vibrant community of learners and experts who are
                passionate about sharing knowledge and helping each other
                succeed. Forge meaningful connections, exchange ideas, and
                expand your horizons with Discover.
              </Text>
            </View>
            <View style={styles.ImageContainer}>
              <Image
                source={require('../../images/GroupCommunication.jpg')}
                style={styles.InformationLogo}
              />
            </View>
          </View>
          <View style={styles.InformationContainerCard}>
            <View style={styles.ImageContainer}>
              <Image
                source={require('../../images/NightWorkingGuy.jpg')}
                style={styles.InformationLogo}
              />
            </View>
            <View style={styles.InformationContainerCardText}>
              <Text
                style={light ? styles.HeaderTextLight : styles.HeaderTextDark}>
                Instant Solutions, Anytime, Anywhere
              </Text>
              <Text
                numberOfLines={13}
                style={
                  light
                    ? styles.DescriptionTextLight
                    : styles.DescriptionTextDark
                }>
                With Discover, you have instant access to a wealth of knowledge
                at your fingertips. No matter where you are or what you need to
                know, Discover empowers you to find the answers you seek quickly
                and effortlessly.
              </Text>
            </View>
          </View>
        </Animatable.View>
      </ScrollView>
    </View>
  );
};

export default Information;

const styles = StyleSheet.create({
  InformationContainerLight: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  InformationContainerDark: {
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
  textLight: {
    color: '#000000',
    fontSize: 26,
    fontWeight: 'bold',
  },
  textDark: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  MainContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 30,
    paddingLeft: 20,
    paddingRight: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  InformationLogo: {
    padding: 10,
    height: 200,
    width: 150,
    borderRadius: 14,
    marginBottom: 10,
  },
  HighlightImage: {
    padding: 10,
    height: 150,
    width: Dimensions.get('screen').width - 30,
    borderRadius: 14,
    marginBottom: 10,
    flex: 1,
    flexGrow: 1,
  },
  InformationContainerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 10,
  },
  InformationContainerCardText: {
    flex: 1,
    paddingLeft: 10,
  },
  HeaderTextLight: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  HeaderTextDark: {
    color: '#DADBDD',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  DescriptionTextLight: {
    color: '#121212',
  },
  DescriptionTextDark: {
    color: '#DADBDD',
  },
  ImageContainer: {
    height: 200,
    width: 150,
    borderRadius: 14,
    marginBottom: 10,
  },
});
