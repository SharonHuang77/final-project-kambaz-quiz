export interface Course {
  _id: string;
  name: string;
  description?: string;
  enrolled?: boolean;
}

export interface User {
  _id: string;
  username: string;
  role?: string;
}
export interface Quiz {
  _id?: string;
  title: string;
  course: string;
  published?: boolean;
  description?: string;
  quizType?:                     
    | "Graded Quiz"
    | "Practice Quiz"
    | "Graded Survey"
    | "Ungraded Survey";
  assignmentGroup?: string; 
  shuffleAnswers?: boolean;
  timeLimit?: number;
  multipleAttempts?: boolean;
  timeLimitMinutes?: number;
  howManyAttempts?: number; // fix 
  showCorrectAnswers?: boolean;
  oneQuestionAtATime?: boolean;
  webcamRequired?: boolean;
  lockQuestionsAfterAnswering?: boolean;
  accessCode?: string;
  availableFromDate?: string;
  availableUntilDate?: string;
  dueDate?: string;
  points?: number;
  numberOfQuestions?: number;
  score?: number;

  timeLimitEnabled?: boolean;
  
  
}
export interface RootState {
  accountReducer: {
    currentUser: User;
  };
  quizzesDetailReducer: {
    quizzes: Quiz[];
  };
}