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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {enabled: false};
  }
  componentDidMount() {
    // This handler fires whenever bgGeo receives a location update.
    BackgroundGeolocation.onLocation(
      location => {
        console.log(location, 'location');
      },
      err => {
        console.log(err, 'err');
      },
    );

    // This handler fires when movement states changes (stationary->moving; moving->stationary)
    BackgroundGeolocation.onMotionChange(location => {
      console.log(location, 'motion');
    });

    // This event fires when a change in motion activity is detected
    BackgroundGeolocation.onActivityChange(location => {
      console.log(location, 'activity');
    });

    // This event fires when the user toggles location-services authorization
    BackgroundGeolocation.onProviderChange(location => {
      console.log(location, 'provider');
    });

    BackgroundGeolocation.ready(
      {
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
        startOnBoot: true,
        forceReloadOnBoot: true,
        foregroundService: true,
      },
      state => {
        console.log(
          '- BackgroundGeolocation is configured and ready: ',
          state.enabled,
        );

        if (!state.enabled) {
          ////
          // 3. Start tracking!
          //
          BackgroundGeolocation.start(function() {
            console.log('- Start success');
          });
        }
      },
    );
  }
  onLocation = location => {
    console.log(location, 'location');
  };
  startLocation = () => {
    console.log('start');
    this.setState({enabled: false});
    BackgroundGeolocation.start(() => {
      BackgroundGeolocation.resetOdometer().then((location: any) => {
        console.log('BackgroundGeolocation reset odometr success: ', location);
      });
      console.log('BackgroundGeolocation start success');
    });
  };

  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <View style={styles.body}>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>43:13</Text>
                <Text style={styles.sectionDescription}>Время</Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle2}>5.05</Text>
                <Text style={styles.sectionDescription}>КИЛОМЕТР</Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.wrapper}>
                <View>
                  <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 1}}>
                      <Text style={styles.sectionTitle}>9:15</Text>
                      <Text style={styles.sectionDescription}>
                        Currenct pace
                      </Text>
                    </View>
                    <View style={styles.rightBlock}>
                      <Text style={styles.sectionTitle}>8:32</Text>
                      <Text style={styles.sectionDescription}>avg pace</Text>
                    </View>
                  </View>
                </View>
              </View>
              <Divider style={styles.divider} />
              <View style={{flexDirection: 'row', marginTop: 30}}>
                <View style={{flex: 1}}>
                  <Button
                    title="Start"
                    style={styles.button}
                    type="outline"
                    onPress={this.startLocation}
                  />
                </View>
                <View style={{flex: 1}}>
                  <Button title="Reset" style={styles.button} type="outline" />
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
    maxWidth: 150,
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 15,
  },
});

export default App;
