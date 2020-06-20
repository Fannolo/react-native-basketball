import Sound from 'react-native-sound';

export const startSound = new Sound(
  require('../assets/sounds/8bit-Video-Game-Startup-Short-01.m4a'),
  (error) => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
  },
);

export const swishSound = new Sound(
  require('../assets/sounds/Synth-Whoosh-Big-01.m4a'),
  (error) => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
  },
);

export const backBoard = new Sound(
  require('../assets/sounds/Synth-Speedbump-Fast-01.m4a'),
  (error) => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
  },
);

export const failure = new Sound(
  require('../assets/sounds/Synth-Pop-Big-01.m4a'),
  (error) => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
  },
);

export const failedAfter20Times = new Sound(
  require('../assets/sounds/losingAfter20times.mp3'),
  (error) => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
  },
);
