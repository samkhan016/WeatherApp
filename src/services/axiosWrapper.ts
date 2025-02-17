import {Base_Url} from '@env';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: Base_Url,
  timeout: 10000,
});

export default axiosInstance;
