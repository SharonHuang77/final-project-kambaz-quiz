import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Define the Question interface
interface Question {
  _id: string;
  title: string;
  type: 'multiple-choice' | 'true-false' | 'fill-in-blank';
  points: number;
  question: string;
  quiz: string;
  choices?: string[];
  correctAnswer?: number | boolean;
  possibleAnswers?: string[];
  caseSensitive?: boolean;
  isNew?: boolean;
  isEditing?: boolean;
}

// Define the initial state interface
interface QuestionsState {
  questions: Question[];
}

const initialState: QuestionsState = {
  questions: [],
};

const questionsSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
    },
    addQuestion: (state, action: PayloadAction<Question>) => {
      state.questions.push(action.payload);
    },
    deleteQuestion: (state, action: PayloadAction<string>) => {
      state.questions = state.questions.filter(
        (q) => q._id !== action.payload
      );
    },
    updateQuestion: (state, action: PayloadAction<Question>) => {
      const index = state.questions.findIndex(q => q._id === action.payload._id);
      if (index !== -1) {
        state.questions[index] = action.payload;
      }
    },
    editQuestion: (state, action: PayloadAction<Question>) => {
      const index = state.questions.findIndex(q => q._id === action.payload._id);
      if (index !== -1) {
        state.questions[index] = { ...state.questions[index], ...action.payload };
      }
    },
  },
});

export const { 
  setQuestions, 
  addQuestion, 
  deleteQuestion, 
  updateQuestion, 
  editQuestion 
} = questionsSlice.actions;

export default questionsSlice.reducer;

// Export types for use in components
export type { Question, QuestionsState };