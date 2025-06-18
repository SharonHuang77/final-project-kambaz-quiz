import { configureStore } from "@reduxjs/toolkit";
import accountReducer from "./Account/reducer";
import coursesReducer from "./Courses/reducer";
import enrollmentsReducer from "./Enrollments/enrollmentsReducer";
import modulesReducer from "./Courses/Modules/reducer";
import questionReducer from "./Courses/Quizzes/QuizQuestion/reducer";

const store = configureStore({
  reducer: {
    accountReducer,
    coursesReducer,
    modulesReducer,
    enrollmentsReducer,
    questionReducer,
  },
});

export default store;