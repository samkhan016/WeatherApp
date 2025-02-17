import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../assets/colors';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';

export default function Favourites({backgroundColor}: any) {
  const [favourites, setFavorites] = useState([]);
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      fetchFavourites();
    }, []),
  );
  const fetchFavourites = async () => {
    const result = await AsyncStorage.getItem('favourites');
    setFavorites(result ? JSON.parse(result) : []);
  };

  const removeFromFavourites = (item: any) => {
    Alert.alert(
      'Remove from Favourites',
      `are you sure you want to remove ${item?.name}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {text: 'OK', onPress: () => remove(item), style: 'destructive'},
      ],
      {cancelable: false},
    );
  };

  const remove = async (item: any) => {
    const updatedFavorites = favourites.filter(
      (fav: any) => fav.name !== item.name,
    );
    await AsyncStorage.setItem('favourites', JSON.stringify(updatedFavorites));
    setFavorites(updatedFavorites);
  };

  const renderitems = ({item}: any) => {
    return (
      <TouchableOpacity
        style={styles().itemCont}
        onLongPress={() => removeFromFavourites(item)}
        onPress={() =>
          navigation.navigate('WeatherDetails', {city: item.name})
        }>
        <View style={styles().itemTopCont}>
          <Text style={styles().name}>{item.name}</Text>
          <Text style={styles().temp}>
            {item.main.temp}°{item?.unit}
          </Text>
        </View>

        <View style={styles().itemTopCont}>
          <Text style={styles().description}>
            {item.weather[0].description.charAt(0).toUpperCase() +
              item.weather[0].description.slice(1)}
          </Text>
          <Image
            width={50}
            height={50}
            source={{
              uri: `https://openweathermap.org/img/wn/${item?.weather[0]?.icon}@4x.png`,
            }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles().mainCont}>
      <Text style={styles(backgroundColor).heading}>Favourites</Text>
      {favourites?.length > 0 ? (
        <FlatList
          data={favourites}
          renderItem={renderitems}
          style={styles().flatlistStyle}
        />
      ) : (
        <View style={styles().noItemCont}>
          <Text style={styles(backgroundColor).noItemTxt}>
            No favourites found
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = (props?: string) =>
  StyleSheet.create({
    mainCont: {
      flex: 1,
      padding: 20,
      paddingTop: hp(8),
    },
    noItemCont: {alignItems: 'center', justifyContent: 'center', flex: 1},
    noItemTxt: {
      fontSize: 18,
      color: props == Colors.white ? Colors.text_input : Colors.white,
    },
    heading: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: hp(2),
      color: props == Colors.white ? Colors.text_input : Colors.white,
    },
    flatlistStyle: {
      padding: 5,
      paddingTop: 10,
    },
    itemCont: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      marginBottom: 10,
      padding: 10,
      backgroundColor: Colors.white,
      borderRadius: 10,
    },
    itemTopCont: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    name: {fontSize: 18, color: Colors.black},
    temp: {fontSize: 16, color: Colors.black},
    description: {fontSize: 14, color: Colors.black},
  });
