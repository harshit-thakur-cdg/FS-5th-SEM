import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "./postsSlice";
import platformReducer from "./platformSlice";

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    platform: platformReducer,
  },
});