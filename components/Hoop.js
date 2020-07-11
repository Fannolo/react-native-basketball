import React, {Component} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {PropTypes} from 'prop-types';
import {perfectSize, colors} from '../configs';

class Hoop extends Component {
  p;
  render() {
    return (
      <View
        style={[
          styles.hoopContainer,
          {
            bottom: this.props.y,
            left: this.props.x,
          },
        ]}>
        <View style={styles.hoopContained} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  hoopContainer: {
    //backgroundColor: '#F4F4F4',
    backgroundColor: colors.black,
    position: 'absolute',
    // left: ,
    width: perfectSize(200),
    height: perfectSize(112),
    alignItems: 'center',
    borderWidth: perfectSize(5),
    //borderColor: '#b7b7b7',
    borderColor: colors.white,
    borderRadius: perfectSize(4),
  },
  hoopContained: {
    //backgroundColor: '#F4F4F4',
    backgroundColor: colors.black,
    width: perfectSize(80),
    height: perfectSize(54),
    marginTop: perfectSize(38),
    borderWidth: perfectSize(5),
    //borderColor: '#b7b7b7',
    borderColor: colors.white,
  },
});

Hoop.defaultProps = {
  y: 0,
};

Hoop.propTypes = {
  y: PropTypes.number,
};

export default Hoop;
