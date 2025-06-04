import Modules from "./Modules";
import CoursesNavigation from "./Navigation";
import Home from "./Home";
import Assignments from "./Assignments";
import People from "./People/Table";
import { Navigate, Route, Routes, useParams, useLocation } from "react-router";
import { FaAlignJustify } from "react-icons/fa6";
import { useSelector } from "react-redux";


export default function Courses() {
  const { cid } = useParams();
  const { courses } = useSelector((state: any) => state.coursesReducer);
  const course = courses.find((course: any) => course._id === cid);

  const {pathname} = useLocation();
  return (
    <div id="wd-courses">
      <h2 className="text-danger">
        <FaAlignJustify className="me-4 fs-4 mb-1" />
          {course && course.name} &gt; {pathname.split("/")[4]}</h2><hr />
      <div className="d-flex">
        <div className="d-none d-md-block">
            <CoursesNavigation />
        </div>
        <div className="flex-fill">
            <Routes>
              <Route path="/" element={<Navigate to="Home" />} />
              <Route path="Home" element={<Home />} />
              <Route path="Modules" element={<Modules />} />
              <Route path="Piazza" element={<h2>Piazza</h2>} />
              <Route path="Zoom" element={<h2>Zoom</h2>} />
              <Route path="Assignments" element={<Assignments />} />
              <Route path="Assignments/:aid" element={<h2>Assignment Editor</h2>} />
              <Route path="Quizs" element={<h2>Quizzes</h2>} />
              <Route path="Grades" element={<h2>Grades</h2>} />
              <Route path="People" element={<People />} />
            </Routes>
        </div>
      </div>
    </div>
  );
}
  