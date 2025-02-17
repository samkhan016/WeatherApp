import React, {useEffect, useState} from 'react';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import WeatherDetailsScreen from './src/screens/weatherDetailsScreen';
import {MyTabs} from './src/routes';
import {Image, Platform, StatusBar, StyleSheet} from 'react-native';
import Colors from './src/assets/colors';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';

const App = () => {
  const [backgroundColor, setBackgroundColor] = useState(Colors.white); // Default to day mode

  useEffect(() => {
    const updateBackgroundColor = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 6 && currentHour < 18) {
        setBackgroundColor(Colors.white); // Light color for day mode
      } else {
        setBackgroundColor(Colors.text_input); // Dark color for night mode
      }
    };

    updateBackgroundColor(); // Update immediately on mount

    const interval = setInterval(updateBackgroundColor, 60000); // Update every minute

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const Stack = createStackNavigator();
  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: backgroundColor,
    },
  };
  return (
    <NavigationContainer theme={MyTheme}>
      <StatusBar
        barStyle={
          backgroundColor == Colors.white && Platform.OS == 'android'
            ? 'dark-content'
            : 'light-content'
        }
        backgroundColor={backgroundColor}
      />
      <Stack.Navigator>
        <Stack.Screen name="Tabs" options={{headerShown: false}}>
          {() => <MyTabs backgroundColor={backgroundColor} />}
        </Stack.Screen>
        <Stack.Screen
          name="WeatherDetails"
          component={WeatherDetailsScreen}
          options={{
            headerTransparent: true,
            headerTitle: '',
            headerBackTitle: '',

            headerBackImage: () => (
              <Image
                source={require('./src/assets/images/backIcon.png')}
                style={styles.backIcon}
              />
            ),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  backIcon: {
    left: Platform.OS == 'android' ? wp(0) : wp(2),
    width: 24,
    height: 24,
    tintColor: Colors.white,
    resizeMode: 'contain',
  },
});

export default App;
