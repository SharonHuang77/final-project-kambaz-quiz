import { configureStore } from "@reduxjs/toolkit";
import accountReducer from "./Account/reducer";
import coursesReducer from "./Courses/reducer";
import enrollmentsReducer from "./Courses/enrollmentsReducer";
import modulesReducer from "./Courses/Modules/reducer";

const store = configureStore({
  reducer: {
    accountReducer,
    coursesReducer,
    modulesReducer,
    enrollmentsReducer,
  },
});

export default store;