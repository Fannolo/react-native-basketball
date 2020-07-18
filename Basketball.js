/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  BackHandler,
} from 'react-native';
import Ball from './components/Ball';
import Hoop from './components/Hoop';
import Net from './components/Net';
import Floor from './components/Floor';
import Emoji from './components/Emoji';
import Score from './components/Score';

import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import Vector from './utils/Vector';
import Continue from './components/Continue';
import {BlurView} from '@react-native-community/blur';
import {useNavigation, useRoute, CommonActions} from '@react-navigation/native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from '@react-native-firebase/admob';
import {AdMob, failure, backBoard, swishSound, perfectSize} from './configs';
import AsyncStorage from '@react-native-community/async-storage';

// physical variables
const gravity = 0.6; // gravity
const radius = perfectSize(48); // ball radius
const rotationFactor = 10; // ball rotation factor

// components sizes and positions
const FLOOR_HEIGHT = perfectSize(60);
const FLOOR_Y = perfectSize(11);
const HOOP_Y = Dimensions.get('window').height - perfectSize(227);
const NET_HEIGHT = perfectSize(6);
const NET_WIDTH = perfectSize(83);
const NET_Y = Dimensions.get('window').height - perfectSize(216);
const NET_X = Dimensions.get('window').width / 2 - NET_WIDTH / 2;
const EMOJI_X = Dimensions.get('window').width / 2 - perfectSize(50);
const NET_LEFT_BORDER_X = NET_X + NET_HEIGHT / 2;
const NET_LEFT_BORDER_Y = NET_Y;
const NET_RIGHT_BORDER_X = NET_X + NET_WIDTH - NET_HEIGHT / 2;
const NET_RIGHT_BORDER_Y = NET_LEFT_BORDER_Y;

// ball lifecycle
const LC_WAITING = 0;
const LC_STARTING = 1;
const LC_FALLING = 2;
const LC_BOUNCING = 3;
const LC_RESTARTING = 4;
const LC_RESTARTING_FALLING = 5;

const FeedBackOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};
const adUnit = __DEV__
  ? TestIds.REWARDED
  : Platform.OS === 'ios'
  ? AdMob.IOS.GAMEPLAY_REWARD_ID
  : AdMob.ANDROID.GAMEPLAY_REWARD_ID;

class Basketball extends Component {
  constructor(props) {
    super(props);
    this.rewarded = RewardedAd.createForAdRequest(adUnit, {
      requestNonPersonalizedAdsOnly: this.props.route.params
        ?.requestNonPersonalizedAdsOnly,
      keywords: ['game'],
    });
    this.interval = null;
    // initialize ball states
    this.state = {
      x: Dimensions.get('window').width / 2 - radius,
      y: FLOOR_Y,
      vx: 0,
      vy: 0,
      rotate: 0,
      scale: perfectSize(1),
      lifecycle: LC_WAITING,
      scored: null,
      score: 0,
      randomNetYPosition: 0,
      randomNetXPosition: 0,
      dead: false,
      adLoaded: false,
      ad_played: false,
      streak: 0,
    };
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true,
    );
    this.interval = setInterval(this.update.bind(this), 1000 / 60);
    this.eventListener = this.rewarded.onAdEvent((type, error, reward) => {
      if (error) {
        this.setState({adMobError: true});
      }
      if (type === RewardedAdEventType.LOADED) {
        this.setState({adLoaded: true});
      }

      if (type === RewardedAdEventType.EARNED_REWARD) {
        this.setState({rewarded: true});
      }
    });

    // Start loading the rewarded ad straight away
    this.rewarded.load();
    console.disableYellowBox = true;
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    //  if (this.eventListener) this.eventListener.remove();
  }

  onStart(angle) {
    if (this.state.lifecycle === LC_WAITING) {
      this.setState({
        vx: angle * 0.2,
        vy: perfectSize(-16),
        lifecycle: LC_STARTING,
      });
    }
  }

  randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  circlesColliding(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy); // basically is RADIX((x2-x1)^2 - (y2-y1)^2)

    if (distance < circle1.radius + circle2.radius) {
      return true;
    }
    return false;
  }

  updateCollisionVelocity(nextState, ball, netBorder) {
    const xDistance = netBorder.x - ball.x;
    const yDistance = netBorder.y - ball.y;
    let normalVector = new Vector(xDistance, yDistance);
    normalVector = normalVector.normalise();

    const tangentVector = new Vector(
      normalVector.getY() * -1,
      normalVector.getX(),
    );

    // create ball scalar normal direction.
    const ballScalarNormal = normalVector.dot(ball.velocity);
    const netScalarNormal = normalVector.dot(netBorder.velocity);

    // create scalar velocity in the tagential direction.
    const ballScalarTangential = tangentVector.dot(ball.velocity);

    const ballScalarNormalAfter =
      (ballScalarNormal * (ball.mass - netBorder.mass) +
        10 * netBorder.mass * netScalarNormal) /
      (ball.mass + netBorder.mass);

    const ballScalarNormalAfterVector = normalVector.multiply(
      ballScalarNormalAfter,
    );
    const ballScalarNormalVector = tangentVector.multiply(ballScalarTangential);

    const nextVelocity = ballScalarNormalVector.add(
      ballScalarNormalAfterVector,
    );

    //Se l'altezza della palla è minore rispetto alla posizione in cui si trova il canestro allora sposta la palla a destra altrimenti a sinistra

    if (
      // (ball.x / 2 > NET_LEFT_BORDER_X + this.state.randomNetXPosition &&
      //   ball.x / 2 < NET_RIGHT_BORDER_X + this.state.randomNetXPosition) ||
      ball.y <
      NET_Y + this.state.randomNetYPosition + NET_HEIGHT / 2
    ) {
      nextState.vx = nextVelocity.x;
    } else {
      nextState.vx = -nextVelocity.x;
    }
    // if (ball.y < NET_Y + NET_HEIGHT / 2) {
    //   nextState.vx = nextVelocity.x;
    // } else {
    //   nextState.vx = -nextVelocity.x;
    // }

    nextState.vy = nextVelocity.y;
    nextState.x = this.state.x + nextState.vx;
    nextState.y = this.state.y - nextState.vy;
  }

  handleCollision(nextState) {
    if (
      nextState.lifecycle !== LC_FALLING &&
      nextState.lifecycle !== LC_BOUNCING
    ) {
      return;
    }

    // eslint-disable-next-line consistent-this
    const _self = this;

    const ball = {
      x: nextState.x + radius,
      y: nextState.y + radius,
      radius: radius * nextState.scale,
      velocity: {
        getX() {
          return _self.state.vx;
        },
        getY() {
          return _self.state.vy;
        },
      },
      mass: 2,
    };
    const netLeftBorder = {
      x: NET_LEFT_BORDER_X + this.state.randomNetXPosition - 10,
      y: NET_LEFT_BORDER_Y + this.state.randomNetYPosition,
      radius: NET_HEIGHT / 2,
      velocity: {
        getX() {
          return 0;
        },
        getY() {
          return 0;
        },
      },
      mass: 10,
    };
    const netRightBorder = {
      x: NET_RIGHT_BORDER_X + this.state.randomNetXPosition,
      y: NET_RIGHT_BORDER_Y + this.state.randomNetYPosition,
      radius: NET_HEIGHT / 2,
      velocity: {
        getX() {
          return 0;
        },
        getY() {
          return 0;
        },
      },
      mass: 10,
    };

    const isLeftCollision = this.circlesColliding(ball, netLeftBorder);
    if (isLeftCollision) {
      nextState.colliding = true;
      //this.setState({colliding: true});
      backBoard.play();
      ReactNativeHapticFeedback.trigger('impactMedium', FeedBackOptions);
      nextState.lifecycle = LC_BOUNCING;
      this.updateCollisionVelocity(nextState, ball, netLeftBorder);
    } else {
      const isRightCollision = this.circlesColliding(ball, netRightBorder);
      if (isRightCollision) {
        nextState.colliding = true;
        //this.setState({colliding: true});
        backBoard.play();
        ReactNativeHapticFeedback.trigger('impactMedium', FeedBackOptions);
        nextState.lifecycle = LC_BOUNCING;
        this.updateCollisionVelocity(nextState, ball, netRightBorder);
      }
    }
  }

  updateVelocity(nextState) {
    nextState.vx = this.state.vx;
    if (
      nextState.lifecycle === LC_STARTING &&
      nextState.y < NET_Y + this.state.randomNetYPosition - perfectSize(200)
    ) {
      nextState.vy = this.state.vy;
    } else {
      nextState.vy = this.state.vy + gravity;
    }
  }

  updatePosition(nextState) {
    nextState.x = this.state.x + nextState.vx;
    nextState.y = this.state.y - nextState.vy;

    if (nextState.lifecycle === LC_STARTING && nextState.y < this.state.y) {
      nextState.lifecycle = LC_FALLING;
    }
    if (nextState.lifecycle === LC_RESTARTING && nextState.y < this.state.y) {
      nextState.lifecycle = LC_RESTARTING_FALLING;
    }

    if (this.state.scored === null) {
      if (
        this.state.y + radius >=
          NET_Y + this.state.randomNetYPosition + NET_HEIGHT &&
        nextState.y + radius <=
          NET_Y + this.state.randomNetYPosition + NET_HEIGHT
      ) {
        if (
          nextState.x + radius >
            NET_LEFT_BORDER_X + this.state.randomNetXPosition &&
          nextState.x + radius <
            NET_RIGHT_BORDER_X + this.state.randomNetXPosition
        ) {
          swishSound.play();
          ReactNativeHapticFeedback.trigger('impactHeavy', FeedBackOptions);
          nextState.scored = true;
          if (!nextState.colliding) {
            nextState.streak += 1;
            nextState.score += 1 * nextState.streak;
            //this.setState({colliding: false});
            nextState.colliding = false;
          } else {
            nextState.score += 1;
            nextState.streak = 0;
            //this.setState({colliding: false});
            nextState.colliding = false;
          }
        } else {
          nextState.streak = 0;
          nextState.scored = false;
          //this.setState({colliding: false});
          nextState.colliding = false;
        }
      }
    }
  }

  updateScale(nextState) {
    if (
      nextState.lifecycle === LC_BOUNCING ||
      nextState.lifecycle === LC_RESTARTING ||
      nextState.lifecycle === LC_RESTARTING_FALLING
    ) {
      return;
    }

    let scale = this.state.scale;
    if (scale > perfectSize(0.4) && this.state.y > FLOOR_HEIGHT) {
      scale -= perfectSize(0.01);
    }

    nextState.scale = scale;
  }

  updateRotate(nextState) {
    nextState.rotate = this.state.rotate + nextState.vx * rotationFactor;
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  handleRestart(nextState) {
    if (
      nextState.lifecycle === LC_RESTARTING_FALLING &&
      nextState.y <= FLOOR_Y
    ) {
      // in front of the Floor
      // will restart to 'Waiting' lifecycle step
      nextState.y = FLOOR_Y;
      nextState.vx = 0;
      nextState.vy = 0;
      nextState.rotate = 0;
      nextState.scale = perfectSize(1);
      nextState.lifecycle = LC_WAITING;

      nextState.scored = null;
    }

    const outOfScreen =
      nextState.x > Dimensions.get('window').width + perfectSize(100) ||
      nextState.x < 0 - radius * 2 - perfectSize(100);

    if (
      outOfScreen === true ||
      ((nextState.lifecycle === LC_FALLING ||
        nextState.lifecycle === LC_BOUNCING) &&
        nextState.y + radius * nextState.scale * 2 < FLOOR_Y + radius * -2)
    ) {
      if (outOfScreen && nextState.scored === null) {
        nextState.scored = false;
      }

      // behind the Floor
      // will be thrown to the front of the floor
      nextState.y = FLOOR_Y;

      if (nextState.scored === true) {
        nextState.x = this.randomIntFromInterval(
          4,
          Dimensions.get('window').width - radius * 2 - 4,
        );
        //nextState.x = Dimensions.get('window').width / 2 - radius;

        if (this.state.score >= 10) {
          nextState.randomNetXPosition = this.getRandomInt(
            perfectSize(-100),
            perfectSize(100),
          );
          nextState.randomNetYPosition = this.getRandomInt(
            perfectSize(-150),
            perfectSize(20),
          );
        }
      } else {
        failure.play();
        nextState.x = Dimensions.get('window').width / 2 - radius;
        if (nextState.ad_played) {
          this.props.navigation.dispatch(CommonActions.goBack());
          //nextState.dead = true
        } else {
          nextState.dead = true;
          nextState.randomNetXPosition = 0;
          nextState.randomNetYPosition = 0;
          //nextState.score = 0;
        }
      }
      // nextState.x = Dimensions.get('window').width / 2 - radius;
      nextState.vy = perfectSize(-8);
      nextState.vx = 0;
      nextState.scale = perfectSize(1);
      nextState.rotate = 0;
      nextState.lifecycle = LC_RESTARTING;
    }
  }

  async updateHighScore(nextState) {
    if (nextState.scored === false) {
      let highScore = await AsyncStorage.getItem('highScore');
      // eslint-disable-next-line radix
      if (this.state.score > parseInt(highScore) || !highScore) {
        await AsyncStorage.setItem(
          'highScore',
          JSON.stringify(this.state.score),
        );
      }
    }
  }

  update() {
    if (this.state.lifecycle === LC_WAITING) {
      return;
    }

    let nextState = null;
    nextState = Object.assign({}, this.state);
    this.updateVelocity(nextState);
    this.updatePosition(nextState);
    this.updateScale(nextState);
    this.updateRotate(nextState);

    this.handleCollision(nextState);
    this.handleRestart(nextState);
    this.updateHighScore(nextState);

    this.setState(nextState);
  }

  renderNet(render) {
    if (render === true) {
      return (
        <Net
          y={NET_Y + this.state.randomNetYPosition}
          x={NET_X + this.state.randomNetXPosition}
          height={NET_HEIGHT}
          width={NET_WIDTH}
        />
      );
    }
    return null;
  }

  renderFloor(render) {
    if (
      this.state.lifecycle === LC_RESTARTING ||
      this.state.lifecycle === LC_RESTARTING_FALLING
    ) {
      render = !render;
    }

    if (render === true) {
      return <Floor height={FLOOR_HEIGHT} />;
    }
    return null;
  }

  render() {
    return (
      <>
        {Platform.OS === 'ios' && (
          <StatusBar hidden barStyle={'light-content'} />
        )}
        <View
          style={{
            backgroundColor: '#000',
            flex: 1,
          }}>
          <SafeAreaView style={styles.container} forceInset={{bottom: 0}}>
            <View style={styles.container}>
              <Score
                y={FLOOR_HEIGHT * 4}
                score={this.state.score}
                scored={this.state.scored}
                streak={this.state.streak}
              />
              <Hoop
                y={HOOP_Y + this.state.randomNetYPosition}
                x={
                  Dimensions.get('window').width / 2 -
                  perfectSize(200) / 2 +
                  this.state.randomNetXPosition
                }
              />
              {this.renderNet(this.state.lifecycle === LC_STARTING)}
              {this.renderFloor(this.state.vy <= 0)}
              <Ball
                onStart={this.onStart.bind(this)}
                x={this.state.x}
                y={this.state.y}
                radius={radius}
                rotate={this.state.rotate}
                scale={this.state.scale}
              />
              {this.renderNet(this.state.lifecycle !== LC_STARTING)}
              {this.renderFloor(this.state.vy > 0)}
              <Emoji
                y={NET_Y + this.state.randomNetYPosition}
                x={EMOJI_X + this.state.randomNetXPosition}
                scored={this.state.scored}
              />
            </View>
          </SafeAreaView>
          <View>
            <BannerAd
              size={BannerAdSize.SMART_BANNER}
              unitId={
                __DEV__
                  ? TestIds.BANNER
                  : Platform.OS === 'ios'
                  ? AdMob.IOS.GAMEPLAY_BANNER_ID
                  : AdMob.ANDROID.GAMEPLAY_BANNER_ID
              }
              requestOptions={{
                requestNonPersonalizedAdsOnly: this.props.route.params
                  ?.requestNonPersonalizedAdsOnly,
              }}
            />
          </View>
        </View>
        {this.state.dead ? (
          <View style={styles.overlayContainer}>
            <BlurView
              style={styles.overlay}
              blurType="dark"
              blurAmount={32}
              reducedTransparencyFallbackColor="rgba(0,0,0,0.6)"
            />
            <Continue
              highScore={this.props.route.params?.highScore}
              score={this.state.score}
              rewarded={this.state.rewarded}
              openedAd={this.state.adOpened}
              onPressDeny={() => {
                this.props.navigation.dispatch(CommonActions.goBack());
                this.setState({
                  dead: false,
                  ad_played: false,
                  randomNetXPosition: 0,
                  randomNetYPosition: 0,
                  x: Dimensions.get('window').width / 2 - radius,
                  score: 0,
                });
              }}
              onPressSuccess={async () => {
                this.rewarded.show();
                this.rewarded.onAdEvent((type, error, reward) => {
                  if (type === AdEventType.OPENED) {
                    this.setState({adOpened: true});
                  }
                  if (type === RewardedAdEventType.EARNED_REWARD) {
                    this.setState({
                      dead: false,
                      rewarded: true,
                      ad_played: true,
                      x: Dimensions.get('window').width / 2 - radius,
                    });
                  }
                  if (type === AdEventType.CLOSED && !this.state.rewarded) {
                    this.props.navigation.dispatch(CommonActions.goBack());
                  }
                });
              }}
            />
          </View>
        ) : null}
      </>
    );
  }
}

const styles = StyleSheet.create({
  interstitialAdContainer: {
    width: perfectSize(200),
    zIndex: 2,
    flex: 1,
    height: perfectSize(200),
    borderRadius: perfectSize(50),
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  overlayContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  overlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 1,
  },
  container: {
    flex: 1,
  },
});

export default function (props) {
  const navigation = useNavigation();
  const route = useRoute();

  return <Basketball {...props} navigation={navigation} route={route} />;
}
