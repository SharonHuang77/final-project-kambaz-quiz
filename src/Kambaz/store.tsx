import { configureStore } from "@reduxjs/toolkit";
import accountReducer from "./Account/reducer";
import coursesReducer from "./Courses/reducer";
import enrollmentsReducer from "./Courses/enrollmentsReducer";

const store = configureStore({
  reducer: {
    accountReducer,
    coursesReducer,
    enrollmentsReducer,
  },
});

export default store;