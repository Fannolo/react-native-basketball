import React, {Component} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {PropTypes} from 'prop-types';

class Hoop extends Component {
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
    width: 200,
    height: 112,
    alignItems: 'center',
    borderWidth: 5,
    //borderColor: '#b7b7b7',
    borderColor: '#fff',
    borderRadius: 4,
  },
  hoopContained: {
    //backgroundColor: '#F4F4F4',
    backgroundColor: '#000',
    width: 80,
    height: 54,
    marginTop: 38,
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
