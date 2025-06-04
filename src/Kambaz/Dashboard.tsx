import { Row, Col, Card, Button, FormControl } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// import * as db from "./Database";
import { useState } from "react";
import { addCourse, deleteCourse, updateCourse } from "./Courses/reducer";
import { enrollUser, unenrollUser } from "./Courses/enrollmentsReducer";



export default function Dashboard() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { courses } = useSelector((state: any) => state.coursesReducer);
  const { enrollments } = useSelector((state: any) => state.enrollmentsReducer);

  const isFaculty = currentUser?.role === "FACULTY";

  const [showAllCourses, setShowAllCourses] = useState(false);
  const [course, setCourse] = useState({
    _id: "1234", 
    name: "New Course", 
    number: "New Number",
    startDate: "2023-09-10", 
    endDate: "2023-12-15", 
    description: "New Description",
  });

  const handleAddNewCourse = () => {
    dispatch(addCourse(course));
    setCourse({
      _id: "1234", 
      name: "New Course", 
      number: "New Number",
      startDate: "2023-09-10", 
      endDate: "2023-12-15", 
      description: "New Description",
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    dispatch(deleteCourse(courseId));
  };

  const handleUpdateCourse = () => {
    dispatch(updateCourse(course));
  };
  
  const isUserEnrolledInCourse = (courseId: string) => {
    return enrollments.some(
      (enrollment: any) =>
        enrollment.user === currentUser._id && enrollment.course === courseId
    );
  };

  const handleEnroll = (courseId: string) => {
    dispatch(enrollUser({ userId: currentUser._id, courseId }));
  };

  const handleUnenroll = (courseId: string) => {
    dispatch(unenrollUser({ userId: currentUser._id, courseId }));
  };

  const getCoursesToDisplay = () => {
    if (showAllCourses) {
      return courses;
    }
    return courses.filter((course: any) => isUserEnrolledInCourse(course._id));
  };

  const coursesToDisplay = getCoursesToDisplay();

  return (
    <div id="wd-dashboard">
      <div>
        <h1 id="wd-dashboard-title">Dashboard</h1> 
        <Button
            variant="primary"
            onClick={() => setShowAllCourses(!showAllCourses)}
            className="mb-3 float-end"
          > {showAllCourses ? "My Enrollments" : "All Courses"}
        </Button> <br></br><br></br>
      </div>
      <hr />

      {isFaculty && (
        <div>
          <h5>New Course
          <button className="btn btn-primary float-end"
                  id="wd-add-new-course-click"
                  onClick={handleAddNewCourse} > 
              Add 
          </button>
          <button className="btn btn-warning float-end me-2"
                  onClick={handleUpdateCourse}
                  id="wd-update-course-click">
            Update
          </button><br></br><br></br>
          <FormControl value={course.name} className="mb-2"
              onChange={(e) => setCourse({ ...course, name: e.target.value }) } />
          <FormControl value={course.description} className="form-control" 
              onChange={(e) => setCourse({ ...course, description: e.target.value }) }/>
          </h5>
          <hr />
        </div>
      )}

      <h2 id="wd-dashboard-published">Published Courses ({coursesToDisplay.length})</h2> <hr />
      <div id="wd-dashboard-courses">
        <Row xs={1} md={5} className="g-4">
          {coursesToDisplay.map((course: any) => {
            const isEnrolled = isUserEnrolledInCourse(course._id);
            
            return (
          // { courses
          // .filter((course) =>
          //   enrollments.some(
          //     (enrollment) =>
          //       enrollment.user === currentUser._id &&
          //       enrollment.course === course._id
          //      ))
          // .map((course) => (
            <Col key={course._id} className="wd-dashboard-course" style={{ width: "300px" }}>
              <Card>
              <Link to={`/Kambaz/Courses/${course._id}/Home`}
                    className="wd-dashboard-course-link text-decoration-none text-dark">
                <Card.Img variant="top" src="/images/reactjs.jpg" width="100%" height={160}/>
                <Card.Body className="card-body">
                <Card.Title className="wd-dashboard-course-title text-nowrap overflow-hidden">{course.name}</Card.Title>
                <Card.Text  className="wd-dashboard-course-description overflow-hidden" style={{ height: "100px" }}>
                  {course.description}</Card.Text>

                {isEnrolled && (
                  <Button variant="primary">Go</Button>
                )}

                <div className="mt-2">
                    {isEnrolled ? (
                      <Button
                        variant="danger"
                        onClick={(event) => {
                          event.preventDefault();
                          handleUnenroll(course._id);
                        }}
                        className="me-2"
                      >
                        Unenroll
                      </Button>
                    ) : (
                      <Button
                        variant="success"
                        onClick={(event) => {
                          event.preventDefault();
                          handleEnroll(course._id);
                        }}
                        className="me-2"
                      >
                        Enroll
                      </Button>
                    )}
                  </div>

                {isFaculty && (
                  <div>
                    <Button id="wd-delete-course-click"
                      onClick={(event) => {
                        event.preventDefault();
                        handleDeleteCourse(course._id);
                      }} 
                      className="btn btn-danger float-end"
                      >
                      Delete
                    </Button>
                    <Button id="wd-edit-course-click"
                      onClick={(event) => {
                        event.preventDefault();
                        setCourse(course);
                      }}
                      className="btn btn-warning me-2 float-end" >
                      Edit
                    </Button>
                </div>
                )}
                </Card.Body>
              </Link>
              </Card>
            </Col>
            );
          })}
        </Row>
      </div>
    </div>
);}
