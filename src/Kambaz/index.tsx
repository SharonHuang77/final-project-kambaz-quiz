import { Navigate, Route, Routes } from "react-router-dom";
import Account from "./Account";
import Dashboard from "./Dashboard";
import KambazNavigation from "./KambazNavigation";
import "./styles.css";

import ProtectedRoute from "./Account/ProtectedRoute";
import ProtectedCourseRoute from "./Courses/ProctedCourseRoute";
import Courses from "./Courses";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Session from "./Account/Session";
import * as courseClient from "./Courses/client";
import * as userClient from "./Account/client";
//import * as enrollmentClient from "./Enrollments/client";


export default function Kambaz() {
    const [courses, setCourses] = useState<any[]>([]);
    const { currentUser } = useSelector((state: any) => state.accountReducer);

    const [course, setCourse] = useState<any>({
      _id: "1234",
      name: "New Course",
      number: "New Number",
      startDate: "2023-09-10",
      endDate: "2023-12-15",
      description: "New Description",
    });

    // const [enrolling, setEnrolling] = useState<boolean>(false);
    // const findCoursesForUser = async () => {
    //   try {
    //     if (!currentUser) {
    //       return;
    //     }

    //     const courses = await userClient.findCoursesForUser(currentUser._id);
    //     setCourses(courses);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // };

    // const updateEnrollment = async (courseId: string, enrolled: boolean) => {
    //   if (enrolled) {
    //     await enrollmentClient.enrollIntoCourse(currentUser._id, courseId);
    //   } else {
    //     await enrollmentClient.unenrollFromCourse(currentUser._id, courseId);
    //   }
    //   setCourses(
    //     courses.map((course) => {
    //       if (course._id === courseId) {
    //         return { ...course, enrolled: enrolled };
    //       } else {
    //         return course;
    //       }
    //     })
    //   );
    // };
   

    // const fetchCourses = async () => {
    //   try {
    //     const allCourses = await courseClient.fetchAllCourses();
    //     const enrolledCourses = await userClient.findCoursesForUser(
    //       currentUser._id
    //     );
    //     const courses = allCourses.map((course: any) => {
    //       if (enrolledCourses.find((c: any) => c._id === course._id)) {
    //         return { ...course, enrolled: true };
    //       } else {
    //         return course;
    //       }
    //     });
    //     setCourses(courses);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // };

    const fetchCourses = async () => {
      try {
        const allCourses = await courseClient.fetchAllCourses();
        const enrolledCourses = await userClient.findCoursesForUser(currentUser._id);
  
        const enrolledIds = new Set(enrolledCourses.map((c: any) => c._id));
    
        const coursesWithEnrollment = allCourses.map((course: any) => ({
          ...course,
          enrolled: enrolledIds.has(course._id),
        }));
    
        setCourses(coursesWithEnrollment);
      } catch (error) {
        console.error("Error in fetchCourses:", error);
      }
    };
   

    // const fetchCourses = async () => {
    //   let courses = [];
    //   try {
    //     const courses = await userClient.findMyCourses();
    //   } catch (error) {
    //     console.error(error);
    //   }
    // };

    // const fetchCourses = async () => {
    //   try {
    //     //const fetchedCourses = await userClient.findMyCourses();
    //     const fetchedCourses = await courseClient.fetchAllCourses();
    //     console.log('Fetched courses:', fetchedCourses); //debug
    //     setCourses(fetchedCourses || []);
    //   } catch (error) {
    //     console.error('Error fetching courses:', error);
    //     setCourses([]);
    //   }
    // };

    const updateCourse = async () => {
      const updatedCourse = await courseClient.updateCourse(course);
      setCourses(courses.map((c) => {
          if (c._id === course._id) { return updatedCourse; }
          else { return c; }
      })
      );
      setCourse(updatedCourse);
   };
  

    const addNewCourse = async () => {
      //const newCourse = await userClient.createCourse(course);
      const newCourse = await courseClient.createCourse(course);
      const courseWithEnrollment = {
        ...newCourse, enrolled: true };
      setCourses([ ...courses, courseWithEnrollment ]);
    };

    const deleteCourse = async (courseId: string) => {
      await courseClient.deleteCourse(courseId);
      setCourses(courses.filter((course) => course._id !== courseId));
    };
  
    // useEffect(() => {
    //   if (enrolling) {
    //     fetchCourses();
    //   } else {
    //     findCoursesForUser();
    //   };
    // }, [currentUser, enrolling]);
    useEffect(() => {
      if (currentUser) {
        fetchCourses();
      }
    }, [currentUser]);
  
    return (
      <Session>
          <div id="wd-kambaz">
              <KambazNavigation />
              <div className="wd-main-content-offset p-3"> 
              <Routes>
                  <Route path="/" element={<Navigate to="/Kambaz/Account" />} />
                  <Route path="/Account/*" element={<Account />} />
                  <Route path="/Dashboard" element={
                    <ProtectedRoute>
                      <Dashboard
                        courses={courses}
                        course={course}
                        setCourse={setCourse}
                        addNewCourse={addNewCourse}
                        deleteCourse={deleteCourse}
                        updateCourse={updateCourse}
                        fetchCourses={fetchCourses}
                        // enrolling={enrolling}
                        // setEnrolling={setEnrolling}
                        // updateEnrollment={updateEnrollment}
                      />
                    </ProtectedRoute>} />
                  <Route path="/Courses/:cid/*" element={
                    <ProtectedRoute>
                          <ProtectedCourseRoute>
                              <Courses />
                          </ProtectedCourseRoute>
                    </ProtectedRoute>} />
                  <Route path="/Calendar" element={<h1>Calendar</h1>} />
                  <Route path="/Inbox" element={<h1>Inbox</h1>} />
                  <Route path="/Help" element={<h1>Help</h1>} />
              </Routes>
              </div>
          </div>
      </Session>
    );
}