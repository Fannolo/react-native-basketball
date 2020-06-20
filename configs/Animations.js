import {Animated} from 'react-native';

const DURATION = 100;
const SHRINK = 100;
const ENLARGE = 200;

export const increaseSize = (object) => {
  // Will change fadeAnim value to 0 in 5 seconds
  Animated.timing(object, {
    toValue: SHRINK,
    duration: DURATION,
    delay: 1000,
  }).start();
};

export const decreaseSize = (object) => {
  Animated.timing(object, {
    toValue: ENLARGE,
    duration: DURATION,
  });
};
