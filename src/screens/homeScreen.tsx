import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Keyboard,
  StyleSheet,
  Switch,
  ImageBackground,
  Platform,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getCurrentLocationWeather} from '../services/api';
import Geolocation from '@react-native-community/geolocation';
import {temp} from '../helpers';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../assets/colors';

const HomeScreen = () => {
  const [city, setCity] = useState('');
  const navigation = useNavigation();
  const [weather, setWeather] = useState<any>(null);
  const [filteredSearches, setFilteredSearches] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [unit, setUnit] = useState('C');

  useFocusEffect(
    useCallback(() => {
      fetchCurrentLocationWeather();
      fetchRecentSearches();
    }, []),
  );

  const fetchCurrentLocationWeather = async () => {
    Geolocation.getCurrentPosition(async position => {
      const data = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        unit,
      };
      const resp = await getCurrentLocationWeather(data);
      setWeather(resp);
    });
  };

  const fetchRecentSearches = async () => {
    const recents = await AsyncStorage.getItem('recentSearches');
    if (recents) {
      setRecentSearches(JSON.parse(recents));
    }
  };

  const handleCityChange = (text: string) => {
    if (text === '') {
      setCity('');
      setFilteredSearches([]);
      return;
    }
    setCity(text);
    setFilteredSearches(
      recentSearches.filter(item =>
        item?.toLowerCase()?.includes(text?.toLowerCase()),
      ),
    );
  };

  const clearRecent = () => {
    AsyncStorage.removeItem('recentSearches');
    setRecentSearches([]);
    setFilteredSearches([]);
  };

  const handleCityPress = async (text: string) => {
    let updatedSearches = [...recentSearches];

    // Check if item is not already in recent searches
    if (!updatedSearches.includes(text)) {
      updatedSearches.push(text);
      setRecentSearches(updatedSearches);

      await AsyncStorage.setItem(
        'recentSearches',
        JSON.stringify(updatedSearches),
      );
    }
    setCity('');
    setFilteredSearches([]);
    Keyboard.dismiss();
    navigation.navigate('WeatherDetails', {city: text});
  };

  const toggleUnit = () => setUnit(unit === 'C' ? 'F' : 'C');

  return (
    <ImageBackground
      style={styles().mainCont}
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
      <View style={styles().searchCont}>
        <View style={styles().searchBarCont}>
          <TextInput
            placeholder="Search city"
            placeholderTextColor={'grey'}
            value={city}
            onChangeText={handleCityChange}
            style={styles().textBox}
            returnKeyType="search"
            onSubmitEditing={() => handleCityPress(city)}
          />
          {city && (
            <TouchableOpacity
              hitSlop={20}
              onPress={() => {
                setFilteredSearches([]);
                Keyboard.dismiss();
                setCity('');
              }}>
              <Image
                source={require('../assets/images/cancel.png')}
                style={styles().crossImg}
              />
            </TouchableOpacity>
          )}
        </View>

        {filteredSearches.length > 0 && (
          <FlatList
            data={filteredSearches}
            keyExtractor={index => index.toString()}
            ListHeaderComponent={() => (
              <View style={styles().filterHeaderCont}>
                <Text style={styles().recentTxt}>Recent Search</Text>
                <Text style={styles().cancelTxt} onPress={clearRecent}>
                  Clear
                </Text>
              </View>
            )}
            renderItem={({item, index}) => (
              <Text
                onPress={() => handleCityPress(item)}
                style={
                  styles(index === filteredSearches.length - 1).filterItem
                }>
                {item}
              </Text>
            )}
            style={styles().filterStyle}
            scrollEnabled={false}
          />
        )}
      </View>

      <View style={styles().weatherCont}>
        <Text style={styles().cityName}>{weather?.name}</Text>
        <Text style={styles().temp}>
          {temp(weather?.main?.temp, unit)}°{unit}
        </Text>

        <View style={styles().conditionCont}>
          <Text style={styles().condition}>{weather?.weather[0]?.main}</Text>
          <Image
            width={50}
            height={50}
            source={{
              uri: `https://openweathermap.org/img/wn/${weather?.weather[0]?.icon}@4x.png`,
            }}
          />
        </View>

        <Text style={styles().windSpeed}>
          Wind Speed: {weather?.wind?.speed} m/s
        </Text>
        <Text style={styles().humidity}>
          Humidity: {weather?.main?.humidity}%
        </Text>

        <View style={styles().unitCont}>
          <Text style={styles().unitTxt}>Temperature Unit</Text>
          <View style={styles().unitRightCont}>
            <Text style={styles().unitTxt}>°F</Text>
            <Switch value={unit === 'C'} onValueChange={toggleUnit} />
            <Text style={styles().unitTxt}>°C</Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = (props?: boolean) =>
  StyleSheet.create({
    mainCont: {
      flex: 1,
      backgroundColor: Colors.text_input,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchCont: {
      position: 'absolute',
      alignSelf: 'center',
      top: Platform.OS == 'android' ? hp(5) : hp(8),
      zIndex: 1,
    },
    searchBarCont: {
      paddingHorizontal: 10,
      backgroundColor: 'white',
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      height: hp(5),
      width: wp(90),
    },
    textBox: {flex: 1},
    crossImg: {width: wp(5), height: wp(5)},
    filterHeaderCont: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    recentTxt: {
      fontSize: 16,
      color: Colors.black,
    },
    cancelTxt: {fontSize: 16, color: Colors.darkRed},
    filterStyle: {
      width: wp(90),
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      padding: wp(2),
      overflow: 'visible',
      borderBottomRightRadius: 10,
      borderBottomLeftRadius: 10,
    },
    filterItem: {
      padding: 10,
      borderBottomWidth: props ? 0 : 1,
      fontSize: 14,
      color: Colors.black,
    },
    cityName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: Colors.white,
      marginBottom: hp(1),
    },
    weatherCont: {
      alignItems: 'center',
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

export default HomeScreen;
