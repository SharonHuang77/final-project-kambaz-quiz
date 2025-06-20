
import axios from "axios";
const axiosWithCredentials = axios.create({ withCredentials: true });

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;

export const fetchQuizResults = async (quizId: String, studentId: String) => {
  const response = await axiosWithCredentials.get(`${REMOTE_SERVER}/api/quizzes/${quizId}/results/${studentId}`);
  return response.data;
};