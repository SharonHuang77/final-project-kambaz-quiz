import axios from "axios";
const axiosWithCredentials = axios.create({ withCredentials: true });

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER || "";
const USERS_API     = `${REMOTE_SERVER}/api/users`;

export const findEnrollmentsByUser = async (userId: string) => {
  const { data } = await axiosWithCredentials.get(`${USERS_API}/${userId}/enrollments`);
  return data; 
};

export const enrollIntoCourse = async (userId: string, courseId: string) => {
  const response = await axiosWithCredentials.post(`${USERS_API}/${userId}/courses/${courseId}`);
  return response.data;
 };

 
// export const enrollUserInCourse = async (userId: string, courseId: string) => {
//   const { data } = await axiosWithCredentials.post(
//     `${USERS_API}/${userId}/enrollments/${courseId}`
//   );
//   return data;
// };


export const unenrollFromCourse = async (userId: string, courseId: string) => {
  const response = await axiosWithCredentials.delete(`${USERS_API}/${userId}/courses/${courseId}`);
  return response.data;
 };
 
//  export const unenrollUserFromCourse = async (userId: string, courseId: string) => {
//   await axiosWithCredentials.delete(`${USERS_API}/${userId}/enrollments/${courseId}`);
// };
