import {create, PREDEF_RES} from 'react-native-pixel-perfect';

const designResolution = {
  width: 1125,
  height: 2436,
}; //this size is the size that your design is made for (screen size)
export const perfectSize = create(PREDEF_RES.iphoneX.dp);
