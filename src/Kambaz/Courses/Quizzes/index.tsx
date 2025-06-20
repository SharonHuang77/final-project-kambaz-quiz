import { useParams, Link } from "react-router";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import * as quizzesClient from "../client";
import * as questionsClient from "./QuizQuestion/client"
import { useEffect, useState } from "react";

import { Button, FormControl, InputGroup, ListGroup } from "react-bootstrap";
import { FaPlus, FaSearch } from "react-icons/fa";
import { BsGripVertical } from "react-icons/bs";
import { BsFillRocketTakeoffFill } from "react-icons/bs";

import QuizzesControl from "./QuizDetail/QuizzesControl";
import { setQuizzes, deleteQuiz} from "./QuizDetail/reducer";
import QuizListControl from "./QuizDetail/QuizControl";


export default function Quizzes() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [quizQuestionCounts, setQuizQuestionCounts] = useState<Record<string, number>>({});
  const [quizTotalPoints, setQuizTotalPoints] = useState<Record<string, number>>({});

  const quizzesState = useSelector((state: any) => state.quizzesDetailReducer);
  const quizzes = quizzesState?.quizzes || [];
  const filteredQuizzes = quizzes.filter((quiz: any) => quiz.course === cid);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const isFaculty = currentUser?.role === "FACULTY";

  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${month} ${day} at ${hours}:${minutesStr}${ampm}`;
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await quizzesClient.deleteQuiz(quizId);
      dispatch(deleteQuiz(quizId));
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("Failed to delete quiz. Please try again.");
    }
  };
  

  const getMostRecentQuiz = () => {
    if (filteredQuizzes.length === 0) return null;
    const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
      return b._id.localeCompare(a._id);
    });
    return sortedQuizzes[0];
  };

// Fetch quiz scores and question counts and total points
  useEffect(() => {
    const fetchQuizData = async () => {
      
      const scores: Record<string, number> = {};
      const questionCounts: Record<string, number> = {};
      const totalPoints: Record<string, number> = {};

      for (const quiz of filteredQuizzes) {
        try {
          // Fetch questions to get count and calculate total points
          const questions = await questionsClient.getQuestions(quiz._id);
          questionCounts[quiz._id] = questions?.length || 0;
          
          // Calculate total points from all questions
          if (questions && questions.length > 0) {
            const total = questions.reduce((sum: number, question: any) => {
              return sum + (question.points || 0);
            }, 0);
            totalPoints[quiz._id] = total;
          } else {
            totalPoints[quiz._id] = 0;
          }

      if (!isFaculty && currentUser) {
            const results = await quizzesClient.findQuizResultsForStudent(quiz._id, currentUser._id);
            // Find the highest score
            if (results && results.length > 0) {
              const highestScore = Math.max(...results.map((r: any) => r.score || 0));
              scores[quiz._id] = highestScore;
            }
          }
        } catch (error) {
          console.error(`Error fetching data for quiz ${quiz._id}:`, error);
          totalPoints[quiz._id] = 0;
          questionCounts[quiz._id] = 0;
        }
      }
      setQuizScores(scores);
      setQuizQuestionCounts(questionCounts);
      setQuizTotalPoints(totalPoints);
    };
    if (filteredQuizzes.length > 0) {
      fetchQuizData();
    }
  }, [filteredQuizzes, currentUser, isFaculty]);


  useEffect(() => {
    if (!cid) return;
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const data = await quizzesClient.findQuizzesForCourse(cid);
        console.log("Fetched quizzes:", data);
        dispatch(setQuizzes(data)); 
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [cid, dispatch]);


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
    <div id="wd-quizzes">
      <InputGroup size="lg" className="me-1 float-right" id="wd-search-quiz">
        <InputGroup.Text id="wd-search-quiz-icon">
          <FaSearch className="text-muted"/>
        </InputGroup.Text>
        <FormControl placeholder="Search for Quizzes" />

        {isFaculty && (
          <>
          <Button
            variant="danger"
            size="lg"
            className="me-1 float-end"
            id="wd-add-quiz"
            onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/Editor`)}
          >
            <FaPlus className="position-relative me-2" style={{ bottom: "1px" }} />
            Quiz
          </Button>
          <QuizListControl 
      onAction={async (action) => {
        const mostRecentQuiz = getMostRecentQuiz();
        switch(action) {
          case 'edit':
            if (mostRecentQuiz) {
              navigate(`/Kambaz/Courses/${cid}/Quizzes/${mostRecentQuiz._id}/Editor`);
            } else {
              alert('No quiz available to edit');
            }
            break;
          case 'delete':
            if (mostRecentQuiz) {
              if (window.confirm(`Are you sure you want to delete "${mostRecentQuiz.title}"?`)) {
                await handleDeleteQuiz(mostRecentQuiz._id);
              }
            } else {
              alert('No quiz available to delete');
            }
            break;
        }
      }}/>
      </>
          
        )}
      </InputGroup>
      <br/><br/>

    <ListGroup className="rounded-0" id="wd-quizzes-list">
        <ListGroup.Item className="quizzes p-0 mb-0 fs-5 border-gray">
          <div className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center">
            <BsGripVertical className="me-2 fs-3" />
            <span className="fw-bold">Assignment Quizzes</span>
            {isFaculty && (
              <div className="ms-auto d-flex align-items-center">
              </div>
            )}
          </div>
        </ListGroup.Item>

        {filteredQuizzes.length === 0 && (
          <ListGroup.Item className="text-center py-4 text-muted">
            No quizzes available for this course.
          </ListGroup.Item>
        )}

        {filteredQuizzes.map((quiz: any) => {
          if (!isFaculty && !quiz.published) {
            return null;
          } 
          const now = new Date();
          const availableFrom = new Date(quiz.availableFromDate);
          const dueDate = new Date(quiz.dueDate);
          
          const notYetAvailable = now < availableFrom;
          const isClosed = now > dueDate;
          const isAvailable = !notYetAvailable && !isClosed;

          // Get student's highest score for this quiz
          const studentScore = !isFaculty ? quizScores[quiz._id] : undefined;
          const questionCount = quizQuestionCounts[quiz._id] || quiz.numberOfQuestions || 0;
          const totalPoints = quizTotalPoints[quiz._id] || quiz.points || 0;

          return (
            <ListGroup.Item
              key={quiz._id}
              className="wd-quiz-list-item p-3 ps-2 d-flex align-items-center mb-0 wd-quiz-group"
            >
              <div className="d-flex me-3">
                <BsGripVertical className="me-2 fs-4" />
                <BsFillRocketTakeoffFill className="fs-4 text-success" />
              </div>
              
              <div className="flex-grow-1">
                <div className="fw-bold mb-0">
                  <Link
                    to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}`}
                    className="wd-quiz-link d-block mb-0 text-dark text-decoration-none"
                  >
                    {quiz.title || quiz._id}
                  </Link>
                </div>

                <div className="fs-6 text-danger">
                  {notYetAvailable && (
                    <>
                      <span className="text-dark"><b>Not available until</b> {formatDate(quiz.availableFromDate)}</span>
                    </>
                  )}
                  
                  {isAvailable && (
                    <>
                      <span className="text-success">Available</span>
                    </>
                  )}
                  {isClosed && (
                    <>
                      <span className="text-danger"><b>Closed</b></span>
                    </>
                  )}
                  
                  <span className="text-dark">
                    {" | "}
                    <b>Due</b> {quiz.dueMultipleDates ? (
                      <span className="text-danger">Multiple Dates</span>
                    ) : (
                      formatDate(quiz.dueDate)
                    )}
                    {" | "}
                    {totalPoints} pts
                    {" | "}
                    {questionCount} Questions
                    {studentScore !== undefined && (
                      <>
                        {" | "}
                        <b>Score:</b> {studentScore}/{totalPoints}
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="d-flex align-items-center">
                
                {isFaculty && (
                  <div className="ms-auto">
                    <QuizzesControl 
                      quizId={quiz._id} 
                      deleteQuiz={handleDeleteQuiz} 
                    />
                  </div>
                )}
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
    {/* TEMPORARY DEBUG SECTION
        <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <Link to={`/Kambaz/Courses/${cid}/Quizzes/quiz123/Questions`}>
            <strong>[ GO TO QUESTIONS EDITOR ]</strong>
          </Link>
        </div> */}
        <br ></br>
        <br ></br>
        
        </div>
    
  );
}


