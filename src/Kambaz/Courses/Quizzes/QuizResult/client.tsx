
import axios from "axios";
const axiosWithCredentials = axios.create({ withCredentials: true });

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;

export const fetchQuizResults = async (quizId: String, studentId: String) => {
  const response = await axiosWithCredentials.get(`${REMOTE_SERVER}/api/quizzes/${quizId}/results/${studentId}`);
  console.log("✅ Raw quiz result:", response);
  return response.data;

};


// In your client.js file - add detailed logging

// export const fetchQuizResults = async (quizId: String, studentId: String) => {
//   try {
//     const url = `${REMOTE_SERVER}/api/quizzes/${quizId}/results/${studentId}`;
//     console.log(`🌐 CLIENT: Making request to: ${url}`);
//     console.log(`🌐 CLIENT: Params - quizId: ${quizId}, studentId: ${studentId}`);
    
//     const response = await axiosWithCredentials.get(url);
    
//     console.log(`🌐 CLIENT: Response received`);
//     console.log(`🌐 CLIENT: Status: ${response.status}`);
//     console.log(`🌐 CLIENT: Headers:`, response.headers);
//     console.log(`🌐 CLIENT: Raw response.data:`, response.data);
//     console.log(`🌐 CLIENT: response.data type:`, typeof response.data);
//     console.log(`🌐 CLIENT: response.data keys:`, response.data ? Object.keys(response.data) : 'No keys');
    
//     // Check if response.data has the expected structure
//     if (response.data) {
//       console.log(`🌐 CLIENT: Data analysis:`);
//       console.log(`  - Has title: ${!!response.data.title}`);
//       console.log(`  - Title value: ${response.data.title}`);
//       console.log(`  - Has questions: ${!!response.data.questions}`);
//       console.log(`  - Questions type: ${typeof response.data.questions}`);
//       console.log(`  - Questions is array: ${Array.isArray(response.data.questions)}`);
//       console.log(`  - Questions length: ${response.data.questions?.length}`);
//       console.log(`  - Has attemptHistory: ${!!response.data.attemptHistory}`);
//       console.log(`  - AttemptHistory length: ${response.data.attemptHistory?.length}`);
//       console.log(`  - Has currentAttempt: ${!!response.data.currentAttempt}`);
//       console.log(`  - hasAttempts flag: ${response.data.hasAttempts}`);
//     }
    
//     console.log(`🌐 CLIENT: Returning:`, response.data);
//     return response.data;
//   } catch (error) {
//     console.error(`🌐 CLIENT: Error occurred:`, error);
//     console.error(`🌐 CLIENT: Error message:`, error.message);
//     console.error(`🌐 CLIENT: Error response:`, error.response?.data);
//     console.error(`🌐 CLIENT: Error status:`, error.response?.status);
//     throw error;
//   }
// };