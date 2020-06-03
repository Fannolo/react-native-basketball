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

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

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
          options={{title: 'Welcome'}}
        />
        <Stack.Screen
          name="Game"
          component={Basketball}
          options={{title: 'Welcome'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({});

export default App;
