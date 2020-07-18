import I18n, {getLanguages} from 'react-native-i18n';

export const translate = (key) => {
  getLanguages().then((languages) => {
    //console.log('languages: ', languages, I18n.locale); // ['en-US', 'en']
  });
  return I18n.t(key);
};

I18n.fallbacks = true;

I18n.translations = {
  en: {
    play: 'PLAY',
    highScore: 'BEST:',
    newHighScore: 'NEW BEST SCORE',
    score: 'SCORE',
    watchAd: 'TAP THE BALL AND\nWATCH AD TO REVIVE',
    pressOutside: 'OR\nTAP HERE\nTO GO BACK',
  },
  it: {
    highScore: 'MIGLIORE:',
    play: 'GIOCA',
    newHighScore: 'NUOVO PUNTEGGIO MIGLIORE',
    score: 'PUNTEGGIO',
    watchAd: 'PREMI LA PALLA\nE GUARDA UNA PUBBLICITÀ\nPER CONTINUARE',
    pressOutside: 'OPPURE\nPREMI QUI',
  },
  'zh-Hans-US': {
    highScore: '高分:',
    play: '开始',
    newHighScore: '新高分数',
    score: '分数',
    watchAd: '点击球并\n观看广告以重生',
    pressOutside: '或\n点击这里返回',
  },
  'zh-CN': {
    highScore: '高分:',
    play: '开始',
    newHighScore: '新高分数',
    score: '分数',
    watchAd: '点击球并\n观看广告以重生',
    pressOutside: '或\n点击这里返回',
  },
};
