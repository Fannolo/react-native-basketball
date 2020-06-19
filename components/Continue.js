import React, {Component} from 'react';
import {Text, View, Image} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

export default class Continue extends Component {
  componentDidMount() {}
  render() {
    return (
      <View style={styles.dialog}>
        <View>
          <Text
            allowFontScaling={false}
            style={styles.continueText}>{`Continue from where you left?`}</Text>
          <Text
            allowFontScaling={false}
            style={[
              styles.descriptionText,
              {marginTop: 10},
            ]}>{`If you press yes an ad will be displayed then you will resume from where you left`}</Text>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 20,
              marginBottom: 20,
            }}>
            <Image
              source={require('../assets/ballbasket.png')}
              style={{width: 100, height: 100}}
              resizeMode={'contain'}
            />
            {this.props.score > parseInt(this.props.highScore) ? (
              <Text allowFontScaling={false} style={styles.continueText}>
                {`Your new best score! ${this.props.score}`}
              </Text>
            ) : (
              <Text
                allowFontScaling={false}
                style={
                  styles.continueText
                }>{`You scored ${this.props.score}`}</Text>
            )}
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: 30,
              marginVertical: 30,
            }}>
            <TouchableOpacity
              onPress={() => {
                this.props.onPressSuccess();
              }}>
              <Text allowFontScaling={false} style={styles.confirmText}>
                Okay.
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.props.onPressDeny();
              }}>
              <Text allowFontScaling={false} style={styles.confirmText}>
                Nope.
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* <TouchableOpacity
              onPress={() => {
                rewarded.show();
              }}>
              <View style={[styles.interstitialAdContainer]}>
                <Text >View ad to revive</Text>
              </View>
            </TouchableOpacity> */}
      </View>
    );
  }
}

const styles = {
  dialog: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    borderRadius: 25,
    width: 380,
    height: 600,
    borderWidth: 10,
    borderColor: '#000',
    zIndex: 2,
    backgroundColor: '#f2f2f2',
  },
  continueText: {
    textAlign: 'center',
    fontSize: 40,
    fontWeight: '600',
  },
  confirmText: {
    fontSize: 35,
    fontWeight: '600',
  },
  descriptionText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '400',
  },
};
