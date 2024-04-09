import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

//Screens
import SplashScreen from './src/SplashScreen';
import SignIn from './src/Authentication/SignIn';
import SignUp from './src/Authentication/SignUp';
import SignUpCredentials from './src/Authentication/SignUpCredentials';
import ProfileCreating from './src/Authentication/ProfileCreating';
import Location from './src/Authentication/Location';
import Language from './src/Authentication/Language';
import Interest from './src/Authentication/Interest';
import Home from './src/Main/Home';
import Drawer from './src/Main/HomeComponents/Drawer';
import Public from './src/Main/HomeComponents/Public';
import Search from './src/Main/HomeComponents/Search';
import Ask from './src/Main/HomeComponents/Ask';
import ForMe from './src/Main/HomeComponents/Messages';
import Profile from './src/Main/DrawerComponents/Profile';
import Notifications from './src/Main/DrawerComponents/Notifications';
import Help from './src/Main/DrawerComponents/Help';
import Information from './src/Main/DrawerComponents/Information';
import LanguageChange from './src/Main/DrawerComponents/Components/LanguageChange';
import LocationChange from './src/Main/DrawerComponents/Components/LocationChange';
import YourActivity from './src/Main/DrawerComponents/YourActivity';
import EmailChange from './src/Main/DrawerComponents/Components/EmailChange';
import MediaView from './src/Main/HomeComponents/Components/MediaView';
import UsersProfile from './src/Main/HomeComponents/Components/UsersProfile';
import MessageComponent from './src/Main/HomeComponents/Components/MessageComponent';
import AppCamera from './src/Main/HomeComponents/Components/AppCamera';
import Messages from './src/Main/HomeComponents/Messages';
import PostView from './src/Main/DrawerComponents/Components/PostView';
export type RootStackParamList = {
  SplashScreen: undefined;
  SignIn: undefined;
  SignUp: undefined;
  SignUpCredentials: {email: string; password: string};
  ProfileCreating: {
    email: string;
    name: string;
    username: string;
    password: string;
  };
  Location: {
    profileImage: string;
    email: string;
    name: string;
    username: string;
    password: string;
    dateOfBirth: string;
    gender: string;
    profession: string;
    companyOrSchool: string;
  };
  Language: {
    profileImage: string;
    email: string;
    name: string;
    username: string;
    password: string;
    dateOfBirth: string;
    gender: string;
    profession: string;
    companyOrSchool: string;
    Location: {
      latitude: number;
      longitude: number;
    };
  };

  Interest: {
    profileImage: string;
    email: string;
    name: string;
    username: string;
    password: string;
    dateOfBirth: string;
    gender: string;
    profession: string;
    companyOrSchool: string;
    Location: {
      latitude: number;
      longitude: number;
    };
    language: string;
  };
  Home: undefined;
  Drawer: undefined;
  Public: undefined;
  Ask: undefined;
  Search: undefined;
  Messages: undefined;
  Help: undefined;
  Information: undefined;
  Notifications: undefined;
  Profile: undefined;
  LanguageChange: undefined;
  LocationChange: undefined;
  YourActivity: undefined;
  EmailChange: undefined;
  MediaView: {
    media: string;
    mediaType: 'image' | 'video';
  };
  UsersProfile: {
    usersAuthUserId: string;
  };
  MessageComponent: {
    recieverAuthUserId: string;
  };
  AppCamera: {
    opponentAuthUserId: string;
    myMedia?: string;
    myMediaType?: 'image' | 'video';
  };
  PostView: {
    postId: string;
  };
};
const Stack = createNativeStackNavigator<RootStackParamList>();
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen">
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SignIn"
          component={SignIn}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SignUpCredentials"
          component={SignUpCredentials}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ProfileCreating"
          component={ProfileCreating}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Location"
          component={Location}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Language"
          component={Language}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Interest"
          component={Interest}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Drawer"
          component={Drawer}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Public"
          component={Public}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Search"
          component={Search}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Ask"
          component={Ask}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Messages"
          component={Messages}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Notifications"
          component={Notifications}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Help"
          component={Help}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Information"
          component={Information}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="LanguageChange"
          component={LanguageChange}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="LocationChange"
          component={LocationChange}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="YourActivity"
          component={YourActivity}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="EmailChange"
          component={EmailChange}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="MediaView"
          component={MediaView}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="UsersProfile"
          component={UsersProfile}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MessageComponent"
          component={MessageComponent}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AppCamera"
          component={AppCamera}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PostView"
          component={PostView}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
