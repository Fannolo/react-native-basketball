import React, {Component} from 'react';
import {Text, View, Animated} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {FeedBackOptions} from '../configs/FeedbackOptions';
import {startSound} from '../configs/SoundConfigs';
import {translate} from '../configs/i18n';
import {perfectSize} from '../configs';

const DEFAULT_TIME = 8;
export default class Continue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dimensions: new Animated.Value(perfectSize(200)),
      spinAnim: new Animated.Value(0),
      time: DEFAULT_TIME,
      pressed: false,
    };
  }
  componentDidMount() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.dimensions, {
          toValue: perfectSize(250),
          duration: 500,
          delay: 1000,
        }),
        Animated.timing(this.state.spinAnim, {
          toValue: 1,
          duration: 1500,
        }),
        Animated.timing(this.state.dimensions, {
          toValue: perfectSize(200),
          duration: 500,
        }),
      ]),
    ).start();

    setInterval(() => {
      if (this.state.time > 0) {
        this.setState({time: this.state.time - 1});
      }
      if (
        this.state.time === 0 &&
        !this.props.rewarded &&
        !this.props.openedAd
      ) {
        this.setState({time: DEFAULT_TIME});
        this.props.onPressDeny();
      }
    }, 1000);
  }

  render() {
    const spin = this.state.spinAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    return (
      <View style={styles.dialog}>
        <Text
          allowFontScaling={false}
          style={{
            color: 'rgb(62,63,67)',
            fontWeight: '600',
            fontSize: perfectSize(200),
            textAlign: 'center',
          }}>
          {this.state.time}
        </Text>
        {this.props.score > parseInt(this.props.highScore) ? (
          <Text allowFontScaling={false} style={styles.continueText}>
            {`${translate('newHighScore')} ${this.props.score}`}
          </Text>
        ) : (
          <Text
            allowFontScaling={false}
            style={styles.continueText}>{`${translate('score')} ${
            this.props.score
          }`}</Text>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            ReactNativeHapticFeedback.trigger('impactHeavy', FeedBackOptions);
            this.setState({pressed: true});
            this.props.onPressSuccess();
            startSound.play();
          }}>
          <Animated.Image
            source={require('../assets/ballbasket.png')}
            style={{
              width: this.state.dimensions,
              height: this.state.dimensions,
              transform: [{rotate: spin}],
            }}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
        <Text allowFontScaling={false} style={[styles.text]}>
          {`${translate('watchAd')}`}
        </Text>

        <TouchableOpacity onPress={() => this.props.onPressDeny()}>
          <Text
            allowFontScaling={false}
            style={[styles.text, {paddingTop: perfectSize(20)}]}>
            {`${translate('pressOutside')}`}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = {
  text: {
    color: '#f2f2f2',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: perfectSize(20),
  },
  dialog: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  button: {
    borderRadius: perfectSize(40),
    paddingVertical: perfectSize(10),
    paddingHorizontal: perfectSize(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    textAlign: 'center',
    fontSize: perfectSize(40),
    fontWeight: '600',
    color: '#fff',
  },
  confirmText: {
    fontSize: perfectSize(35),
    fontWeight: '600',
  },
  descriptionText: {
    textAlign: 'center',
    fontSize: perfectSize(20),
    fontWeight: '400',
  },
};
