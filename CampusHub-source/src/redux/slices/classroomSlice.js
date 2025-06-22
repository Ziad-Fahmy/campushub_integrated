import { createSlice } from '@reduxjs/toolkit';

const classroomSlice = createSlice({
  name: 'classrooms',
  initialState: {
    classrooms: [],
    selectedClassroom: null,
    loading: false,
    error: null,
  },
  reducers: {
    setClassrooms: (state, action) => {
      state.classrooms = action.payload;
    },
    selectClassroom: (state, action) => {
      state.selectedClassroom = action.payload;
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
  setClassrooms, 
  selectClassroom, 
  setLoading,
  setError
} = classroomSlice.actions;

export default classroomSlice.reducer;
