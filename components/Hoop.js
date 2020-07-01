import React, {Component} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {PropTypes} from 'prop-types';
import {perfectSize} from '../configs';

class Hoop extends Component {
  p
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
    backgroundColor: '#000',
    position: 'absolute',
    // left: ,
    width: perfectSize(200),
    height: perfectSize(112),
    alignItems: 'center',
    borderWidth: 5,
    //borderColor: '#b7b7b7',
    borderColor: '#fff',
    borderRadius: 4,
  },
  hoopContained: {
    //backgroundColor: '#F4F4F4',
    backgroundColor: '#000',
    width: perfectSize(80),
    height: perfectSize(54),
    marginTop:  perfectSize(38),
    borderWidth: 5,
    //borderColor: '#b7b7b7',
    borderColor: '#fff',
  },
});

Hoop.defaultProps = {
  y: 0,
};

Hoop.propTypes = {
  y: PropTypes.number,
};

export default Hoop;
