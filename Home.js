import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  AsyncStorage,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Video from 'react-native-video';
import {BlurView} from '@react-native-community/blur';
import Sound from 'react-native-sound';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {useIsFocused} from '@react-navigation/native';

const HomeScreen = ({navigation}) => {
  const [state, setState] = useState({
    highScore: 0,
  });
  const FeedBackOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };

  const swishSound = new Sound(
    require('./assets/sounds/8bit-Video-Game-Startup-Short-01.m4a'),
    (error) => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
    },
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      getHighScore();
    });

    return unsubscribe;
  }, [navigation]);

  const getHighScore = async () => {
    try {
      setState({highScore: await AsyncStorage.getItem('highScore')});
    } catch (e) {
      console.log(e);
    }
  };

  const isFocused = useIsFocused();
  return (
    <>
      {Platform.OS === 'ios' && <StatusBar barStyle={'light-content'} />}
      <SafeAreaView
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <BlurView
          style={styles.videoContainer}
          blurType="dark"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        />
        <Video
          source={require('./assets/video/backgroundvideo.mov')}
          style={styles.backgroundVideo}
          muted={true}
          repeat={true}
          resizeMode={'cover'}
          rate={1.0}
          ignoreSilentSwitch={'obey'}
        />

        <View style={[styles.topContainer]}>
          {!!state.highScore && isFocused && (
            <Text
              style={{
                color: '#f2f2f2',
                fontWeight: '600',
                fontSize: 40,
                textAlign: 'center',
              }}>
              {`BEST: ${state.highScore}`}
            </Text>
          )}
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.stripeContainer}>
            <View style={[styles.stripes, {backgroundColor: '#4DB03D'}]} />
            <View style={[styles.stripes, {backgroundColor: '#F8A925'}]} />
            <View style={[styles.stripes, {backgroundColor: '#F3701E'}]} />
            <View style={[styles.stripes, {backgroundColor: '#DC2835'}]} />
            <View style={[styles.stripes, {backgroundColor: '#8A2F88'}]} />
            <View style={[styles.stripes, {backgroundColor: '#008FD1'}]} />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              ReactNativeHapticFeedback.trigger('impactHeavy', FeedBackOptions);
              swishSound.play();
              navigation.navigate('Game', {highScore: state.highScore});
            }}>
            <Image
              source={require('./assets/ballbasket.png')}
              style={{width: 200, height: 200}}
              resizeMode={'contain'}
            />
            <Text style={{color: '#f2f2f2', fontWeight: '600', fontSize: 34}}>
              PLAY
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    marginTop: 100,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  bottomContainer: {
    flex: 1,
    flexGrow: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  stripeContainer: {
    position: 'absolute',
    flex: 1,
    width: '150%',
    top: '15%',
  },
  stripes: {
    width: '150%',
    height: 40,
    transform: [{rotate: '20deg'}],
  },
  button: {
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: -2,
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: -1,
  },
});

export default HomeScreen;
