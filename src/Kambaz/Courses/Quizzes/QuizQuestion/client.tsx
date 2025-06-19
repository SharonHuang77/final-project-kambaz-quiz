import axios from "axios";
const axiosWithCredentials = axios.create({ withCredentials: true });

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const QUESTIONS_API = `${REMOTE_SERVER}/api/questions`;
const QUIZZES_API = `${REMOTE_SERVER}/api/quizzes`;

export const getQuestions = async (quizId: string) => {
  const response = await axiosWithCredentials.get(`${QUIZZES_API}/${quizId}/questions`);
  return response.data;
};

export const getQuestion = async (questionId: string) => {
  const response = await axiosWithCredentials.get(`${QUESTIONS_API}/${questionId}`);
  return response.data;
};

export const createQuestion = async (quizId: string, question: any) => {
  const questionData = { ...question };
  delete questionData._id;
  delete questionData.isNew;
  delete questionData.isEditing;

  const response = await axiosWithCredentials.post(`${QUIZZES_API}/${quizId}/questions`, questionData);
  return response.data;
};

export const updateQuestion = async (questionId: string, question: any) => {
  const questionData = { ...question };
  console.log("Sending to server:", questionData);
  delete questionData.isNew;
  delete questionData.isEditing;
  
  const response = await axiosWithCredentials.put(`${QUESTIONS_API}/${questionId}`, questionData);
  return response.data;
};

export const deleteQuestion = async (questionId: string) => {
  const response = await axiosWithCredentials.delete(`${QUESTIONS_API}/${questionId}`);
  return response.data;
};

// export const getQuiz = async (quizId: string) => {
//   const response = await axiosWithCredentials.get(`${QUIZZES_API}/${quizId}`);
//   return response.data;
// };