import { createSlice } from '@reduxjs/toolkit';

const complaintSlice = createSlice({
  name: 'complaints',
  initialState: {
    complaints: [],
    selectedComplaint: null,
    loading: false,
    error: null,
  },
  reducers: {
    setComplaints: (state, action) => {
      state.complaints = action.payload;
    },
    selectComplaint: (state, action) => {
      state.selectedComplaint = action.payload;
    },
    addComplaint: (state, action) => {
      state.complaints.push({ ...action.payload, upvotes: 0, downvotes: 0, votedBy: {} });
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    // New reducer for voting
    voteComplaint: (state, action) => {
      const { complaintId, userId, voteType } = action.payload;
      const complaint = state.complaints.find(c => c.id === complaintId);
      if (complaint) {
        const currentVote = complaint.votedBy[userId];

        if (currentVote === voteType) {
          // User is revoking their vote
          if (voteType === 'upvote') {
            complaint.upvotes--;
          } else {
            complaint.downvotes--;
          }
          delete complaint.votedBy[userId];
        } else {
          // User is changing their vote or casting a new vote
          if (currentVote === 'upvote') {
            complaint.upvotes--;
          } else if (currentVote === 'downvote') {
            complaint.downvotes--;
          }

          if (voteType === 'upvote') {
            complaint.upvotes++;
          } else {
            complaint.downvotes++;
          }
          complaint.votedBy[userId] = voteType;
        }
      }
    },
  },
});

export const { 
  setComplaints, 
  selectComplaint, 
  addComplaint,
  setLoading,
  setError,
  voteComplaint
} = complaintSlice.actions;

export default complaintSlice.reducer;
