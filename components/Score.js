import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {PropTypes} from 'prop-types';
import {perfectSize, colors} from '../configs';

class Score extends Component {
  render() {
    return (
      <>
        <View
          style={[
            styles.scoreContainer,
            {
              bottom: this.props.y,
              width: Dimensions.get('window').width,
            },
          ]}>
          <Text
            allowFontScaling={false}
            style={[
              {
                flex: 1,
                fontSize: perfectSize(130),
                fontWeight: '500',
                color: colors.transparentWhite,
                zIndex: 2,
              },
            ]}>
            {this.props.score}
          </Text>
        </View>
        <View
          style={[
            styles.scoreContainer,
            {
              bottom: this.props.y - perfectSize(40),
              width: Dimensions.get('window').width,
            },
          ]}>
          {this.props.streak > 0 ? (
            <Text
              allowFontScaling={false}
              style={[
                {
                  flex: 1,
                  fontSize: perfectSize(50),
                  fontWeight: '500',
                  //color: 'rgba(0,0,0,0.1)',
                  color: colors.transparentWhite,
                  zIndex: 2,
                },
              ]}>
              {`x${this.props.streak}`}
            </Text>
          ) : null}
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  scoreContainer: {
    position: 'absolute',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

Score.defaultProps = {
  y: 0,
  scored: null,
  score: 0,
};

Score.propTypes = {
  y: PropTypes.number,
  scored: PropTypes.bool,
  score: PropTypes.number,
};

export default Score;
