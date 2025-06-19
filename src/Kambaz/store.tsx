import { configureStore } from "@reduxjs/toolkit";
import accountReducer from "./Account/reducer";
import coursesReducer from "./Courses/reducer";
import enrollmentsReducer from "./Enrollments/enrollmentsReducer";
import modulesReducer from "./Courses/Modules/reducer";
import quizzesDetailReducer from "./Courses/Quizzes/QuizDetail/reducer";
import questionReducer from "./Courses/Quizzes/QuizQuestion/reducer";
const store = configureStore({
  reducer: {
    accountReducer,
    coursesReducer,
    modulesReducer,
    enrollmentsReducer,
    quizzesDetailReducer,
    questionReducer,
  },
});

export default store;