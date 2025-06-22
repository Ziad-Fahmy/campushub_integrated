import { createSlice } from '@reduxjs/toolkit';

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    selectedEvent: null,
    loading: false,
    error: null,
  },
  reducers: {
    setEvents: (state, action) => {
      state.events = action.payload;
    },
    selectEvent: (state, action) => {
      state.selectedEvent = action.payload;
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
  setEvents, 
  selectEvent, 
  setLoading,
  setError
} = eventSlice.actions;

export default eventSlice.reducer;
