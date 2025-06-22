import apiClient, { setAuthToken } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export const loginUser = async (email, password) => {
  try {
    console.log('Attempting login with backend API...');
    
    // Real API call to your backend
    const response = await apiClient.post('/auth/login', { email, password });
    console.log('Backend login response:', response.data);
    
    const { token } = response.data;
    
    // Store auth token in AsyncStorage
    await AsyncStorage.setItem('token', token);
    
    // Set token in apiClient headers immediately
    setAuthToken(token);
    
    // Get user profile after login
    const profileResponse = await apiClient.get('/auth/profile');
    console.log('Profile response:', profileResponse.data);
    
    // Store user data
    await AsyncStorage.setItem('user', JSON.stringify(profileResponse.data));
    
    // Return in the format your Redux expects
    return {
      token,
      user: profileResponse.data,
    };
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    // IMPORTANT: Re-throw the error so the Redux slice can handle it as a rejected promise
    throw error.response ? error.response.data : error.message;
  }
};

// ... (rest of your auth.js file remains unchanged)
// Keep your existing functions unchanged
export const registerUser = async (registerData) => {
  try {
    console.log('Attempting registration with backend API...');
    console.log('Registration data:', registerData);
    
    // Real API call to your backend
    const response = await apiClient.post('/auth/register', registerData);
    console.log('Backend registration response:', response.data);
    
    const { token, user } = response.data;
    
    // Store auth token
    await AsyncStorage.setItem('token', token);
    
    // Store user data
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    // Return in the format your Redux expects
    return {
      token,
      user: user,
    };
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    // IMPORTANT: Re-throw the error so the Redux slice can handle it as a rejected promise
    throw error.response ? error.response.data : error.message;
  }
};

export const forgotPassword = async (email) => {
  try {
    return true;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
}; 

export const checkAuthStatus = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userData = await AsyncStorage.getItem('user');
    
    if (!token || !userData) {
      return null;
    }
    
    let parsedUserData = null;
    try {
      parsedUserData = JSON.parse(userData);
    } catch (parseError) {
      console.error("Error parsing user data from AsyncStorage:", parseError);
      await AsyncStorage.removeItem("user"); // Clear corrupted data
      return null;
    }

    // Verify token with backend
    const response = await apiClient.get("/auth/check-auth-status");
    console.log("Auth status check response:", response.data);
    
    return {
      token,
      user: parsedUserData,
    };
  } catch (error) {
    console.error('Auth status check error:', error.response?.data || error.message);
    // Clear invalid tokens
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    throw error.response ? error.response.data : error.message;
  }
};
export const logout = async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    return true;
  } catch (error) {
    throw error;
  }
};

