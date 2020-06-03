import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  SafeAreaView,
  AsyncStorage,
} from 'react-native';

import Ball from './components/Ball';
import Hoop from './components/Hoop';
import Net from './components/Net';
import Floor from './components/Floor';
import Emoji from './components/Emoji';
import Score from './components/Score';

import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import Vector from './utils/Vector';
const Sound = require('react-native-sound');

// physical variables
const gravity = 1; // gravity
const radius = 50; // ball radius
const rotationFactor = 10; // ball rotation factor

// components sizes and positions
const FLOOR_HEIGHT = 60;
const FLOOR_Y = 11;
const HOOP_Y = Dimensions.get('window').height - 227;
const NET_HEIGHT = 6;
const NET_WIDTH = 83;
const NET_Y = Dimensions.get('window').height - 216;
const NET_X = Dimensions.get('window').width / 2 - NET_WIDTH / 2;
const EMOJI_X = Dimensions.get('window').width / 2 - 50;
const NET_LEFT_BORDER_X = NET_X + NET_HEIGHT / 2;
const NET_LEFT_BORDER_Y = NET_Y;
const NET_RIGHT_BORDER_X = NET_X + NET_WIDTH + NET_HEIGHT / 2;
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

class Basketball extends Component {
  constructor(props) {
    super(props);

    this.backBoard = new Sound(
      require('./assets/sounds/backboard.mp3'),
      (error) => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }
      },
    );

    this.swishSound = new Sound(
      require('./assets/sounds/swoosh1.mp3'),
      (error) => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }
      },
    );

    this.failure = new Sound(
      require('./assets/sounds/failure1.mp3'),
      (error) => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }
      },
    );

    this.failedAfter20Times = new Sound(
      require('./assets/sounds/losingAfter20times.mp3'),
      (error) => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }
      },
    );

    this.interval = null;

    // initialize ball states
    this.state = {
      x: Dimensions.get('window').width / 2 - radius,
      y: FLOOR_Y,
      vx: 0,
      vy: 0,
      rotate: 0,
      scale: 1,
      lifecycle: LC_WAITING,
      scored: null,
      score: 0,
      randomNetYPosition: 0,
      randomNetXPosition: 0,
    };
  }

  componentDidMount() {
    this.interval = setInterval(this.update.bind(this), 1000 / 120);
    console.disableYellowBox = true;
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  onStart(angle) {
    if (this.state.lifecycle === LC_WAITING) {
      this.setState({
        vx: angle * 0.2,
        vy: -16,
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
    const distance = Math.sqrt(dx * dx + dy * dy);

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
      normalVector.getY() * 2,
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
      (ball.x > NET_LEFT_BORDER_X + this.state.randomNetXPosition &&
        ball.x < NET_RIGHT_BORDER_X + this.state.randomNetXPosition) ||
      ball.y < NET_Y + this.state.randomNetYPosition + NET_HEIGHT / 2
    ) {
      nextState.vx = nextVelocity.x;
    } else {
      nextState.vx = -nextVelocity.x;
    }
    // if (ball.y < NET_Y + this.state.randomNetYPosition + NET_HEIGHT / 2) {
    //   nextState.vx = nextVelocity.x + 10;
    // } else {
    //   nextState.vx = -nextVelocity.x - 10;
    // }

    nextState.vy = nextVelocity.y;
    nextState.x = this.state.x + nextState.vx;
    nextState.y = this.state.y - nextState.vy;
  }

  handleCollision(nextState) {
    if (
      nextState.lifecycle !== LC_FALLING &&
      nextState.lifecycle !== LC_BOUNCING
    )
      return;

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
      mass: 5,
    };
    const netLeftBorder = {
      x: NET_LEFT_BORDER_X + this.state.randomNetXPosition,
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
      this.backBoard.play();
      ReactNativeHapticFeedback.trigger('impactLight', FeedBackOptions);
      nextState.lifecycle = LC_BOUNCING;
      this.updateCollisionVelocity(nextState, ball, netLeftBorder);
    } else {
      const isRightCollision = this.circlesColliding(ball, netRightBorder);
      if (isRightCollision) {
        this.backBoard.play();
        ReactNativeHapticFeedback.trigger('impactLight', FeedBackOptions);
        nextState.lifecycle = LC_BOUNCING;
        this.updateCollisionVelocity(nextState, ball, netRightBorder);
      }
    }
  }

  updateVelocity(nextState) {
    nextState.vx = this.state.vx;
    if (nextState.lifecycle === LC_STARTING && nextState.y < NET_Y - 120) {
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
        this.state.y + radius >
          NET_Y + NET_HEIGHT / 2 + this.state.randomNetYPosition &&
        nextState.y + radius <
          NET_Y + NET_HEIGHT / 2 + this.state.randomNetYPosition
      ) {
        if (
          nextState.x + radius >
            NET_LEFT_BORDER_X + this.state.randomNetXPosition &&
          nextState.x + radius <
            NET_RIGHT_BORDER_X + this.state.randomNetXPosition
        ) {
          this.swishSound.play();
          ReactNativeHapticFeedback.trigger('impactMedium', FeedBackOptions);
          nextState.scored = true;
          nextState.score += 1;
        } else {
          nextState.scored = false;
        }
      }
    }
  }

  updateScale(nextState) {
    if (
      nextState.lifecycle === LC_BOUNCING ||
      nextState.lifecycle === LC_RESTARTING ||
      nextState.lifecycle === LC_RESTARTING_FALLING
    )
      return;

    let scale = this.state.scale;
    if (scale > 0.4 && this.state.y > FLOOR_HEIGHT) {
      scale -= 0.01;
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
      nextState.scale = 1;
      nextState.lifecycle = LC_WAITING;

      nextState.scored = null;
    }

    const outOfScreen =
      nextState.x > Dimensions.get('window').width + 100 ||
      nextState.x < 0 - radius * 2 - 100;

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
        nextState.randomNetXPosition = this.getRandomInt(-100, 100);
        nextState.randomNetYPosition = this.getRandomInt(-150, 20);
      } else {
        this.setState({ciao: true});
        this.failure.play();
        // nextState.x = Dimensions.get('window').width / 2 - radius;
        nextState.x = this.randomIntFromInterval(
          4,
          Dimensions.get('window').width - radius * 2 - 4,
        );
        nextState.score = 0;
      }
      this.setState({ciao: false});
      // nextState.x = Dimensions.get('window').width / 2 - radius;
      nextState.vy = -8;
      nextState.vx = 0;
      nextState.scale = 1;
      nextState.rotate = 0;
      nextState.lifecycle = LC_RESTARTING;
    }
  }

  async updateHighScore(nextState) {
    if (nextState.scored === false) {
      //   let totalLosing = await AsyncStorage.getItem('highScoreLosing');
      //   if (totalLosing !== undefined) {
      //     totalLosing = parseInt(totalLosing);
      //     if (totalLosing === 2) {
      //       this.failedAfter20Times.play();
      //     }
      //     totalLosing += 1;
      //     await AsyncStorage.setItem('highScoreLosing', String(0));
      //   } else {
      //     await AsyncStorage.setItem('highScoreLosing', String(0));
      //   }

      let highScore = await AsyncStorage.getItem('highScore');
      if (JSON.stringify(this.state.score) > highScore || !highScore) {
        await AsyncStorage.setItem(
          'highScore',
          JSON.stringify(this.state.score),
        );
      }
    }
  }

  update() {
    if (this.state.lifecycle === LC_WAITING) return;

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
      <View style={{backgroundColor: '#F4F4F4', flex: 1}}>
        <SafeAreaView style={styles.container} forceInset={{bottom: 0}}>
          <View style={styles.container}>
            <Score
              y={FLOOR_HEIGHT * 6}
              score={this.state.score}
              scored={this.state.scored}
            />
            <Hoop
              y={HOOP_Y + this.state.randomNetYPosition}
              x={
                Dimensions.get('window').width / 2 -
                200 / 2 +
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Basketball;
