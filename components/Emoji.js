import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, Animated} from 'react-native';
import {PropTypes} from 'prop-types';

const happy = ['👋', '👌', '👍', '👏', '👐', '🎉', '⛹🏻‍♂️', '👾', '😟'];
const sad = ['😢', '😓', '😒', '😳', '😭', '🥵', '😡', '🤬', '🤢', '🤮', '☠️'];
const INITIAL_Y = 5;

class Emoji extends Component {
  constructor(props) {
    super(props);

    this.state = {
      relativeY: new Animated.Value(INITIAL_Y),
      fadeAnim: new Animated.Value(0),
      emoji: '',
    };
  }

  componentDidUpdate(nextProps) {
    if (nextProps.scored !== null && this.props.scored === null) {
      if (nextProps.scored === true) {
        this.setState({
          emoji: this.getEmoji(true),
        });
      } else {
        this.setState({
          emoji: this.getEmoji(false),
        });
      }

      this.state.relativeY.setValue(INITIAL_Y);

      Animated.timing(this.state.fadeAnim, {toValue: 1}).start();

      Animated.timing(this.state.relativeY, {toValue: 15}).start();
    } else if (nextProps.scored === null && this.props.scored !== null) {
      Animated.timing(this.state.fadeAnim, {toValue: 0}).start();

      Animated.timing(this.state.relativeY, {toValue: 40}).start();
    }
  }

  getEmoji(isHappy = true) {
    const min = 0;
    const max = 4;
    const random = Math.floor(Math.random() * (max - min + 1)) + min;

    if (isHappy === true) {
      return happy[random];
    }
    return sad[random];
  }

  render() {
    return (
      <View
        style={[
          styles.emojiContainer,
          {
            bottom: this.props.y,
            left: this.props.x,
          },
        ]}>
        <Animated.Text
          allowFontScaling={false}
          style={[
            styles.emojis,
            {
              opacity: this.state.fadeAnim,
              marginBottom: this.state.relativeY,
            },
          ]}>
          {this.state.emoji}
        </Animated.Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  emojiContainer: {
    position: 'absolute',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 100,
    height: 100,
  },
  emojis: {
    fontSize: 35,
    backgroundColor: 'transparent',
  },
});

Emoji.defaultProps = {
  y: 0,
  x: 0,
  scored: null,
};

Emoji.propTypes = {
  y: PropTypes.number,
  scored: PropTypes.bool,
};

export default Emoji;
