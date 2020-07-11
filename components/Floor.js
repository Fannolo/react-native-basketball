import React, {Component} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {PropTypes} from 'prop-types';
import {perfectSize, colors} from '../configs';

class Floor extends Component {
  render() {
    return (
      <View style={[styles.floorContainer, {height: this.props.height}]} />
    );
  }
}

const styles = StyleSheet.create({
  floorContainer: {
    //backgroundColor: '#F4F4F4',
    //borderTopColor: '#000',
    borderTopColor: colors.white,
    backgroundColor: colors.black,
    borderTopWidth: perfectSize(20),
    position: 'absolute',
    width: Dimensions.get('window').width,
    paddingBottom: perfectSize(100),
    bottom: 0,
  },
});

Floor.defaultProps = {
  heght: perfectSize(10),
};

Floor.propTypes = {
  height: PropTypes.number,
};

export default Floor;
