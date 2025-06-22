import { createSlice } from '@reduxjs/toolkit';

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    facilities: [],
    selectedFacility: null,
    userBookings: [],
    loading: false,
    error: null,
  },
  reducers: {
    setFacilities: (state, action) => {
      state.facilities = action.payload;
    },
    selectFacility: (state, action) => {
      state.selectedFacility = action.payload;
    },
    setUserBookings: (state, action) => {
      state.userBookings = action.payload;
    },
    addBooking: (state, action) => {
      state.userBookings.push(action.payload);
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
  setFacilities, 
  selectFacility, 
  setUserBookings, 
  addBooking,
  setLoading,
  setError
} = bookingSlice.actions;

export default bookingSlice.reducer;
