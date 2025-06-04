import { Link, useLocation, useParams } from "react-router-dom";


export default function CourseNavigation() {
  const links = ["Home", "Modules", "Piazza", "Zoom", "Assignments", "Quizzes", "Grades", "People"];
  const { pathname } = useLocation();
  const { cid } = useParams();
  return (
    <div id="wd-courses-navigation" className="wd list-group fs-5 rounded-0 d-none d-md-block">
      {links.map((link) => (
        <Link to={`/Kambaz/Courses/${cid}/${link}`}
          key={link} 
          id={`wd-course-${link.toLowerCase()}-link`}
          className={`list-group-item text-danger border border-0
            ${pathname.includes(link) ? "active" : ""}`}>
          {link}
        </Link>
      ))}
    </div>
  );}