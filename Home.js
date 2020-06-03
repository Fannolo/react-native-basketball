import {Button, SafeAreaView, Text, View, StyleSheet} from 'react-native';
import React from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Video from 'react-native-video';
import {BlurView} from '@react-native-community/blur';

const HomeScreen = ({navigation}) => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <BlurView
        style={styles.videoContainer}
        blurType="regular"
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
      <View>
        <Text>Your HighScore is 100</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Game')}>
          <Text>Play</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
