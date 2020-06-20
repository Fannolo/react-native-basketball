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
import {BannerAdSize, BannerAd, TestIds} from '@react-native-firebase/admob';
import {AdMob, startSound, imageSizes} from './configs';
import {translate} from './configs/i18n';

const HomeScreen = ({navigation}) => {
  const [state, setState] = useState({
    highScore: 0,
  });
  const FeedBackOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };

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
          blurAmount={32}
          reducedTransparencyFallbackColor="rgba(0,0,0,0.6)"
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
        <View style={styles.containerOfAll}>
          <View style={[styles.bannerAdContainer]}>
            <BannerAd
              size={BannerAdSize.MEDIUM_RECTANGLE}
              unitId={
                __DEV__
                  ? TestIds.BANNER
                  : Platform.OS === 'ios'
                  ? AdMob.IOS.HOME_BANNER_ID
                  : AdMob.ANDROID.HOME_BANNER_ID
              }
            />
          </View>
          <View style={[styles.topContainer]}>
            {!!state.highScore && isFocused && (
              <Text
                allowFontScaling={false}
                style={{
                  color: '#f2f2f2',
                  fontWeight: '600',
                  fontSize: 40,
                  textAlign: 'center',
                }}>
                {`${translate('highScore')} ${state.highScore}`}
              </Text>
            )}
          </View>
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
              startSound.play();
              navigation.navigate('Game', {highScore: state.highScore});
            }}>
            <Image
              source={require('./assets/ballbasket.png')}
              style={imageSizes}
              resizeMode={'contain'}
            />
            <Text
              allowFontScaling={false}
              style={{color: '#f2f2f2', fontWeight: '600', fontSize: 34}}>
              {translate('play')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  containerOfAll: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topContainer: {
    flex: 1,
    marginTop: 200,
    //justifyContent: 'flex-start',
    flexGrow: 1,
  },
  bannerAdContainer: {
    flex: 1,
    //justifyContent: 'flex-start',
    //alignItems: 'center',
  },
  bottomContainer: {
    flex: 1,
    flexGrow: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
});

export default HomeScreen;
