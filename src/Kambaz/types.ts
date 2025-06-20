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
  published?: any;
  description?: string;
  quizType?:                     
    | "Graded Quiz"
    | "Practice Quiz"
    | "Graded Survey"
    | "Ungraded Survey";
  shuffleAnswers?: boolean;
  timeLimit?: boolean;
  multipleAttempts?: boolean;
  timeLimitMinutes?: number;
  howManyAttempts?: number; // fix 

  availableFromDate?: string;
  availableUntilDate?: string;
  dueDate?: string;
  points?: number;
  numberOfQuestions?: number;
  score?: number;
  
}
export interface RootState {
  accountReducer: {
    currentUser: User;
  };
  quizzesDetailReducer: {
    quizzes: Quiz[];
  };
}