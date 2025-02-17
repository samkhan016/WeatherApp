import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Switch,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import {getWeatherBySearch} from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {temp} from '../helpers';
import Colors from '../assets/colors';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';

const WeatherDetailsScreen = (props: any) => {
  const {city, unit} = props?.route.params;
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unitValue, setUnitValue] = useState(unit ? unit : 'C');
  const [favourites, setFavourites] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const loadUnit = async () => {
      const savedUnit = await AsyncStorage.getItem('unit');
      if (savedUnit) {
        setUnitValue(savedUnit);
      }
    };
    loadUnit();
    fetchWeather();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={addToFavorites}>
          <Image
            source={
              isFav
                ? require('../assets/images/fav.png')
                : require('../assets/images/notFav.png')
            }
            resizeMode="contain"
            style={styles.favouriteIcon}
          />
        </TouchableOpacity>
      ),
    });
  }, [isFav]);

  const fetchWeather = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      const storedFavorites = await AsyncStorage.getItem('favourites');
      const favList = storedFavorites ? JSON.parse(storedFavorites) : [];
      setFavourites(favList);

      const favIndex = favList.findIndex((item: any) => item?.name === city);

      if (!netInfo.isConnected && favIndex !== -1) {
        setWeather(favList[favIndex]);
        setIsFav(true);
        return;
      }

      setLoading(true);
      const response = await getWeatherBySearch(city, unitValue);
      setWeather(response);

      // If city exists in favourites, update it
      if (favIndex !== -1) {
        setIsFav(true);
        favList[favIndex] = {...response, unitValue};
        await AsyncStorage.setItem('favourites', JSON.stringify(favList));
        setFavourites(favList);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async () => {
    if (!weather) {
      console.log('Weather data is missing');
      return;
    }

    try {
      // Check if the city is already in favorites
      const isAlreadyFavorite = favourites.some(
        (item: any) => item.name === weather.name,
      );

      if (!isAlreadyFavorite) {
        // Add new city to favorites
        const updatedFavorites = [...favourites, {...weather, unitValue}];
        setFavourites(updatedFavorites);
        setIsFav(true);

        // Save updated favorites to AsyncStorage
        await AsyncStorage.setItem(
          'favourites',
          JSON.stringify(updatedFavorites),
        );
        console.log('Added to favorites:', weather.name);
      } else {
        // Remove city from favorites
        const updatedFavorites = favourites.filter(
          (item: any) => item.name !== weather.name,
        );
        setFavourites(updatedFavorites);
        setIsFav(false);

        // Save updated favorites to AsyncStorage
        await AsyncStorage.setItem(
          'favourites',
          JSON.stringify(updatedFavorites),
        );
        console.log('Removed from favorites:', weather.name);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const toggleUnit = async () => {
    const newUnit = unitValue === 'C' ? 'F' : 'C';
    setUnitValue(newUnit);
    await AsyncStorage.setItem('unit', newUnit);
  };

  return (
    <ImageBackground
      style={styles.weatherCont}
      source={
        weather?.weather[0]?.main?.includes('Rain')
          ? require('../assets/images/rain.jpeg')
          : weather?.weather[0]?.main?.includes('Cloud')
          ? require('../assets/images/cloudy.jpeg')
          : weather?.weather[0]?.main?.includes('Fog')
          ? require('../assets/images/fog.jpeg')
          : weather?.weather[0]?.main?.includes('Haze')
          ? require('../assets/images/haze.jpeg')
          : weather?.weather[0]?.main?.includes('Snow')
          ? require('../assets/images/snow.jpeg')
          : require('../assets/images/sunny.jpeg')
      }>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.white} />
      ) : (
        <>
          <Text style={styles.cityName}>{weather?.name}</Text>
          <Text style={styles.temp}>
            {temp(weather?.main?.temp, unitValue)}°{unitValue}
          </Text>
          <View style={styles.conditionCont}>
            <Text style={styles.condition}>{weather?.weather[0]?.main}</Text>
            <Image
              width={50}
              height={50}
              source={{
                uri: `https://openweathermap.org/img/wn/${weather?.weather[0]?.icon}@4x.png`,
              }}
            />
          </View>
          <Text style={styles.windSpeed}>
            Wind Speed: {weather?.wind?.speed} m/s
          </Text>
          <Text style={styles.humidity}>
            Humidity: {weather?.main?.humidity}%
          </Text>
          <View style={styles.unitCont}>
            <Text style={styles.unitTxt}>Temperature Unit</Text>
            <View style={styles.unitRightCont}>
              <Text style={styles.unitTxt}>°F</Text>
              <Switch value={unitValue === 'C'} onValueChange={toggleUnit} />
              <Text style={styles.unitTxt}>°C</Text>
            </View>
          </View>
        </>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  weatherCont: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.blue,
    justifyContent: 'center',
  },
  favouriteIcon: {
    tintColor: Colors.white,
    width: 30,
    height: 30,
    resizeMode: 'contain',
    right: wp(2),
  },
  cityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: hp(1),
  },
  temp: {
    fontSize: 60,
    color: Colors.white,
    marginVertical: hp(1),
  },
  conditionCont: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  condition: {
    fontSize: 16,
    color: Colors.white,
  },
  windSpeed: {
    marginBottom: hp(2),
    fontSize: 16,
    color: Colors.white,
  },
  humidity: {
    marginBottom: hp(2),
    fontSize: 16,
    color: Colors.white,
  },
  unitCont: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: wp(90),
  },
  unitTxt: {
    fontSize: 16,
    color: Colors.white,
  },
  unitRightCont: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: wp(30),
  },
});

export default WeatherDetailsScreen;
