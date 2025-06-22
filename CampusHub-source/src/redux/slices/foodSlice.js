import { createSlice } from '@reduxjs/toolkit';

const foodSlice = createSlice({
  name: 'food',
  initialState: {
    restaurants: [],
    selectedRestaurant: null,
    menuItems: [],
    loading: false,
    error: null,
  },
  reducers: {
    setRestaurants: (state, action) => {
      state.restaurants = action.payload;
    },
    selectRestaurant: (state, action) => {
      state.selectedRestaurant = action.payload;
    },
    setMenuItems: (state, action) => {
      state.menuItems = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setRestaurants, 
  selectRestaurant, 
  setMenuItems,
  setLoading,
  setError
} = foodSlice.actions;

export default foodSlice.reducer;
