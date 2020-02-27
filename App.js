/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';
import {Divider, Button} from 'react-native-elements';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import BackgroundGeolocation from 'react-native-background-geolocation';
import haversine from 'haversine-distance';

class App extends Component {
  constructor(props) {
    super(props);
    this.timeInterval = 0;
    this.state = {
      initialCoord: null,
      wholeDistance: 0,
      passedTime: 0,
      lastDistance: 0,
      currentPace: 0,
      avgPace: 0,
      saveTime: 0,
      startedRun: false,
    };
  }

  componentDidMount() {
    BackgroundGeolocation.onMotionChange(location => {
      console.log(location, 'motion');
    });

    // This event fires when the user toggles location-services authorization
    BackgroundGeolocation.onProviderChange(location => {
      console.log(location, 'provider');
    });

    BackgroundGeolocation.ready({
      reset: true,
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      locationAuthorizationRequest: 'WhenInUse',
      locationAuthorizationAlert: {
        titleWhenNotEnabled: 'Услуги определения местоположения не включены',
        titleWhenOff: 'Расположение-услуги OFF',
        instructions: 'Вы должны включить услуги локации',
        cancelButton: 'Отмена',
        settingsButton: 'Настройки',
      },
      distanceFilter: 1,
      stopTimeout: 1,
      logLevel: BackgroundGeolocation.LOG_LEVEL_INFO,
      stopOnTerminate: false,
      startOnBoot: false,
      forceReloadOnBoot: false,
      foregroundService: true,
    });

    BackgroundGeolocation.onLocation(
      location => {
        let {initialCoord, wholeDistance} = this.state;
        if (
          location &&
          location.coords &&
          location.coords.latitude &&
          initialCoord
        ) {
          const bCoord = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          const lastDistance = haversine(initialCoord, bCoord) / 1000;
          wholeDistance += lastDistance;
          this.setState({
            wholeDistance,
            initialCoord: bCoord,
            lastDistance,
          });
        }
      },
      err => {
        console(err, 'err');
      },
    );
  }

  calculatePaces = () => {
    const {wholeDistance, passedTime, lastDistance} = this.state;
    if (lastDistance) {
      const avgPace = Math.round(passedTime / wholeDistance);
      const currentPace = Math.round(1 / lastDistance);
      this.setState({
        ...this.state,
        avgPace,
        currentPace,
      });
    }
  };

  startPauseRun = () => {
    const {startedRun} = this.state;
    if (!startedRun) {
      this.startRunning();
    } else {
      this.pauseRunning();
    }
  };

  pauseRunning = () => {
    const {passedTime} = this.state;
    clearInterval(this.timeInterval);
    BackgroundGeolocation.stop();
    BackgroundGeolocation.removeListeners();
    this.setState({
      ...this.state,
      startedRun: false,
      saveTime: passedTime,
    });
  };

  startRunning = () => {
    const {saveTime} = this.state;
    const startTime = new Date().getTime();

    this.setState({
      ...this.state,
      startedRun: true,
    });

    BackgroundGeolocation.start(() => {
      BackgroundGeolocation.resetOdometer().then((location: any) => {
        const initialCoord = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        this.timeInterval = setInterval(() => {
          const now = new Date().getTime();
          const passedTime = now - startTime + saveTime;
          this.calculatePaces();
          this.setState({
            ...this.state,
            passedTime,
            saveTime: 0,
          });
        }, 1000);
        this.setState({
          ...this.state,
          initialCoord,
        });
        console.log('BackgroundGeolocation reset odometr success: ', location);
      });
      console.log('BackgroundGeolocation start success');
    });
  };

  resetRun = () => {
    clearInterval(this.timeInterval);
    BackgroundGeolocation.stop();
    BackgroundGeolocation.removeListeners();
    this.setState({
      ...this.state,
      initialCoord: null,
      wholeDistance: 0,
      passedTime: 0,
      lastDistance: 0,
      currentPace: 0,
      avgPace: 0,
      saveTime: 0,
      startedRun: false,
    });
  };

  render() {
    const {
      wholeDistance,
      passedTime,
      currentPace,
      avgPace,
      startedRun,
    } = this.state;
    const passedMinutes = Math.floor(
      (passedTime % (1000 * 60 * 60)) / (1000 * 60),
    );
    const passedSeconds = Math.floor((passedTime % (1000 * 60)) / 1000);
    const currentPaceMinutes = Math.floor(
      (currentPace % (1000 * 60 * 60)) / (1000 * 60),
    );
    const currentPaceSeconds = Math.floor((currentPace % (1000 * 60)) / 1000);
    const avgPaceMinutes = Math.floor(
      (avgPace % (1000 * 60 * 60)) / (1000 * 60),
    );
    const avgPaceSeconds = Math.floor((avgPace % (1000 * 60)) / 1000);
    const firstButtonText = startedRun ? 'ПАУЗА' : 'СТАРТ';
    const secondButtonText = 'СБРОС';
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <View style={styles.body}>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>
                  {passedMinutes}:{passedSeconds}
                </Text>
                <Text style={styles.sectionDescription}>Время</Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle2}>
                  {parseFloat(wholeDistance).toFixed(2)}
                </Text>
                <Text style={styles.sectionDescription}>КИЛОМЕТР</Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.wrapper}>
                <View>
                  <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 1}}>
                      <Text style={styles.sectionTitle}>
                        {currentPaceMinutes}:{currentPaceSeconds}
                      </Text>
                      <Text style={styles.sectionDescription}>
                        Currenct pace
                      </Text>
                    </View>
                    <View style={styles.rightBlock}>
                      <Text style={styles.sectionTitle}>
                        {avgPaceMinutes}:{avgPaceSeconds}
                      </Text>
                      <Text style={styles.sectionDescription}>avg pace</Text>
                    </View>
                  </View>
                </View>
              </View>
              <Divider style={styles.divider} />
              <View style={{flexDirection: 'row', marginTop: 30}}>
                <View style={styles.buttonWrapper}>
                  <Button
                    title={firstButtonText}
                    buttonStyle={styles.button}
                    type="outline"
                    onPress={this.startPauseRun}
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <Button
                    title={secondButtonText}
                    buttonStyle={styles.button}
                    type="outline"
                    onPress={this.resetRun}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 60,
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
  },
  sectionTitle2: {
    fontSize: 80,
    fontWeight: '800',
    color: Colors.black,
    textAlign: 'center',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
    textAlign: 'center',
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  divider: {
    marginTop: 30,
    backgroundColor: 'blue',
  },
  wrapper: {
    marginTop: 32,
  },
  rightBlock: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: 'black',
  },
  button: {
    margin: 0,
    maxWidth: 300,
    minWidth: 170,
    minHeight: 60,
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 50,
    marginBottom: 15,
  },
  buttonWrapper: {
    fontSize: 30,
    flex: 1,
    height: 200,
  },
});

export default App;
