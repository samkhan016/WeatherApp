import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/homeScreen';
import Favourites from '../screens/favourites';
import Colors from '../assets/colors';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {Image, StyleSheet} from 'react-native';

export function MyTabs({backgroundColor}: any) {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: backgroundColor,
          height: hp(8),
        },
        tabBarHideOnKeyboard: true,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={require('../assets/images/location.png')}
              style={styles(backgroundColor, focused).icon}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Favourite"
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={require('../assets/images/fav.png')}
              style={styles(backgroundColor, focused).icon}
            />
          ),
        }}>
        {() => <Favourites backgroundColor={backgroundColor} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = (backgroundColor: string, focused?: boolean) =>
  StyleSheet.create({
    icon: {
      width: 25,
      height: 25,
      tintColor:
        backgroundColor == Colors.white && focused
          ? Colors.text_input
          : backgroundColor == Colors.text_input && focused
          ? Colors.white
          : Colors.placeholder,
    },
  });
