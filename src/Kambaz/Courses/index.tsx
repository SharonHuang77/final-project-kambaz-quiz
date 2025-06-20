import Modules from "./Modules";
import CoursesNavigation from "./Navigation";
import Home from "./Home";
import Assignments from "./Assignments";
import People from "./People/Table";
import Quizzes from "./Quizzes";
import QuizQuestions from "./Quizzes/QuizQuestion";
import { Navigate, Route, Routes, useParams, useLocation } from "react-router";
import { FaAlignJustify } from "react-icons/fa6";
import { useSelector } from "react-redux";
import QuizDetailEditor from "./Quizzes/QuizDetail/QuizDetailEditor";
import QuizDetailSummary from "./Quizzes/QuizDetail/QuizDetailSummary";
import QuizPreview from "./Quizzes/QuizPreview";
import QuizResult from "./Quizzes/QuizResult";


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
              <Route path="Quizzes" element={<Quizzes />} />
              <Route path="Quizzes/:qid/Questions" element={<QuizQuestions />} />
              <Route path="Grades" element={<h2>Grades</h2>} />
              <Route path="People" element={<People />} />
              <Route path="Quizzes/Editor" element={<QuizDetailEditor />} />                   
              <Route path="Quizzes/QuizDetailSummary" element={<QuizDetailSummary />} />
              <Route path="Quizzes/:qid" element={<QuizDetailSummary />} />
              <Route path="Quizzes/:qid/Editor" element={<QuizDetailEditor />} />  
              <Route path="Quizzes/:qid/Preview" element={<QuizPreview />} />
              <Route path="Quizzes/:qid/Take" element={<QuizPreview />}/>
              <Route path="Quizzes/:qid/Results/:studentId" element={<QuizResult />} />
            </Routes>
        </div>
      </div>
    </div>
  );
}
  