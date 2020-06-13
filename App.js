/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {StyleSheet, StatusBar, Button} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import Basketball from './Basketball';
import HomeScreen from './Home';
import admob, {
  MaxAdContentRating,
  AdsConsent,
  AdsConsentStatus,
} from '@react-native-firebase/admob';

const Stack = createStackNavigator();

const App = () => {
  useEffect(async () => {
    SplashScreen.hide();
    const consentInfo = await requestConsentInfo();
    console.log('pippo', consentInfo);
    if (
      consentInfo.isRequestLocationInEeaOrUnknown &&
      consentInfo.status === AdsConsentStatus.UNKNOWN
    ) {
      const formResult = await AdsConsent.showForm({
        //TODO: add a privacy policy page
        privacyPolicy: 'https://invertase.io/privacy-policy',
        withPersonalizedAds: true,
        withNonPersonalizedAds: true,
        withAdFree: true,
      });
    }
  }, []);

  const requestConsentInfo = async () => {
    try {
      return await AdsConsent.requestInfoUpdate(['pub-3162603114593392']);
    } catch (e) {
      console.error(e);
    }
  };

  // admob()
  //   .setRequestConfiguration({
  //     // Update all future requests suitable for parental guidance
  //     maxAdContentRating: MaxAdContentRating.PG,

  //     // Indicates that you want your content treated as child-directed for purposes of COPPA.
  //     tagForChildDirectedTreatment: false,

  //     // Indicates that you want the ad request to be handled in a
  //     // manner suitable for users under the age of consent.
  //     tagForUnderAgeOfConsent: false,
  //   })
  //   .then(() => {
  //     // Request config successfully set!
  //   });
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          gestureEnabled={false}
          options={{title: 'Welcome', gestureEnabled: false}}
        />
        <Stack.Screen
          name="Game"
          gestureEnabled={false}
          component={Basketball}
          options={{title: 'Game', gestureEnabled: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({});

export default App;
