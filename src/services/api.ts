import {OpenWeatherKey} from '@env';
import axiosInstance from './axiosWrapper';

export const getCurrentLocationWeather = async ({
  latitude,
  longitude,
  unit,
}: any) => {
  try {
    const params = new URLSearchParams();
    params.append('lat', latitude);
    params.append('lon', longitude);
    params.append('units', unit === 'C' ? 'metric' : 'imperial');
    params.append('appid', OpenWeatherKey);
    const response = await axiosInstance.get('/weather?' + params.toString());
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const getWeatherBySearch = async (city: string, unit: string) => {
  try {
    const params = new URLSearchParams();
    params.append('q', city);
    params.append('units', unit === 'C' ? 'metric' : 'imperial');
    params.append('appid', OpenWeatherKey);
    const response = await axiosInstance.get('/weather?' + params.toString());
    return response.data;
  } catch (err) {
    console.log(err);
  }
};
