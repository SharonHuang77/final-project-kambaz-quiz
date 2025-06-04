import { createSlice } from "@reduxjs/toolkit";
import { courses } from "../Database";
import { v4 as uuidv4 } from "uuid";

const initialState = {
  courses: courses,
};

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    addCourse: (state, { payload: course }) => {
      const newCourse: any = {
        _id: uuidv4(),
        name: course.name,
        number: course.number || `NEW${Date.now()}`,
        startDate: course.startDate || "2023-09-10",
        endDate: course.endDate || "2023-12-15",
        department: course.department || "New Department",
        credits: course.credits || 4,
        description: course.description,
      };
      state.courses = [...state.courses, newCourse] as any;
    },
    
    deleteCourse: (state, { payload: courseId }) => {
      state.courses = state.courses.filter(
        (c: any) => c._id !== courseId
      );
    },
    
    updateCourse: (state, { payload: course }) => {
      state.courses = state.courses.map((c: any) =>
        c._id === course._id ? course : c
      ) as any;
    },
    
    editCourse: (state, { payload: courseId }) => {
      state.courses = state.courses.map((c: any) =>
        c._id === courseId ? { ...c, editing: true } : c
      ) as any;
    },
  },
});

export const { addCourse, deleteCourse, updateCourse, editCourse } =
  coursesSlice.actions;
export default coursesSlice.reducer;