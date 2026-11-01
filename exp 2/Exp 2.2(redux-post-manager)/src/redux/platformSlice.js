import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedPlatform: "Twitter",

  limits: {
    Twitter: 280,
    LinkedIn: 3000,
    Instagram: 2200,
  },
};

const platformSlice = createSlice({
  name: "platform",

  initialState,

  reducers: {
    changePlatform: (state, action) => {
      state.selectedPlatform = action.payload;
    },
  },
});

export const { changePlatform } = platformSlice.actions;

export default platformSlice.reducer;