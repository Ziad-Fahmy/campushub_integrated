import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

let API_URL;

if (__DEV__) {
  API_URL = 'http://10.0.2.2:5000/api';
} else {
  API_URL = 'https://your-production-backend.com/api';
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Initialize token on app start
(async () => {
  const storedToken = await AsyncStorage.getItem('token');
  if (storedToken) {
    setAuthToken(storedToken);
  }
})();

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("apiClient Interceptor: Setting Authorization header to", config.headers["Authorization"]);
    } else {
      console.log("apiClient Interceptor: No token found in AsyncStorage.");
      delete config.headers["Authorization"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setAuthToken(null); // Clear token from memory and default headers
    }

    return Promise.reject(error);
  }
);

export default apiClient;


