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
  howManyAttempts?: number;

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

export interface QuizAttempt {
  attempt: number;
  score: number;
  timeUsed: string;
  totalPoints: number;
}

export interface QuestionResult {
  id: string;
  title: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: any;
  studentAnswer: any;
  isCorrect: boolean;
  earnedPoints: number;
  maxPoints: number;
  explanation?: string;
  possibleAnswers?: string[];
}

export interface QuizInstructions {
  title: string;
  guidelines: string[];
}

export interface QuizResultData {
  title: string;
  dueDate: string;
  points: number;
  totalPoints: number;
  availablePeriod: string;
  instructions: QuizInstructions;
  totalQuestions: number;
  timeLimit: string;
  lockDate: string;
  multipleAttempts: boolean;
  maxAttempts: number;
  currentAttempt: {
    score: number;
    totalPoints: number;
    submittedDate: string;
    timeUsed: string;
  };
  attemptHistory: QuizAttempt[];
  questions: QuestionResult[];
}