import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import {PropTypes} from 'prop-types';
import {perfectSize, colors} from '../configs';

class Net extends Component {
  render() {
    return (
      <View
        style={[
          styles.netContainer,
          {
            left: this.props.x,
            bottom: this.props.y,
            height: this.props.height,
            width: this.props.width,
          },
        ]}
      />
    );
  }
}

const styles = StyleSheet.create({
  netContainer: {
    position: 'absolute',
    backgroundColor: colors.veryRed,
    borderRadius: perfectSize(3),
  },
});

Net.defaultProps = {
  x: 0,
  y: 0,
  height: perfectSize(50),
  width: perfectSize(50),
};

Net.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  height: PropTypes.number,
  width: PropTypes.number,
};

export default Net;
