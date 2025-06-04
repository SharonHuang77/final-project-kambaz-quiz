import { createSlice } from "@reduxjs/toolkit";
import { enrollments } from "../Database";

const initialState = {
    enrollments: enrollments,
};

const enrollmentsSlice = createSlice({
    name: "enrollments",
    initialState,
    reducers: {
        enrollUser: (state, { payload: { userId, courseId } }) => {
            const existingEnrollment = state.enrollments.find(
                (enrollment: any) => enrollment.user === userId && enrollment.course === courseId
            );
            
            if (!existingEnrollment) {
                const maxId = state.enrollments.length > 0 
                    ? Math.max(...state.enrollments.map((e: any) => parseInt(e._id) || 0))
                    : 0;
                
                const newEnrollment = {
                    _id: (maxId + 1).toString(),
                    user: userId,
                    course: courseId,
                };
                state.enrollments.push(newEnrollment);
            }
        },
        
        unenrollUser: (state, { payload: { userId, courseId } }) => {
            state.enrollments = state.enrollments.filter(
                (enrollment: any) => !(enrollment.user === userId && enrollment.course === courseId)
            );
        },
        
        setEnrollments: (state, { payload: enrollments }) => {
            state.enrollments = enrollments;
        },
        
        resetEnrollments: (state) => {
            state.enrollments = enrollments;
        },
    }
});

export const { enrollUser, unenrollUser, setEnrollments, resetEnrollments } = enrollmentsSlice.actions;
export default enrollmentsSlice.reducer;