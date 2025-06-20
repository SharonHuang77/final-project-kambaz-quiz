import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Button, Card, Container, Row, Col, Alert } from "react-bootstrap";
import * as quizzesClient from "../../client";
import * as questionsClient from "../QuizQuestion/client";

export default function QuizDetailSummary() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();

  const { quizzes = [] } = useSelector((state: any) => state.quizzesDetailReducer);
  const quiz = quizzes.find((q: any) => q._id === qid);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const isFaculty = currentUser?.role === "FACULTY";

  const [attemptCount, setAttemptCount] = useState(0);
  const [canTakeQuiz, setCanTakeQuiz] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!qid || !quiz || isFaculty) {
        setLoading(false);
        return;
      }
      
      try {
       // Fetch questions to calculate total points
       const questions = await questionsClient.getQuestions(qid);
         if (questions && questions.length > 0) {
           const total = questions.reduce((sum: number, question: any) => {
            return sum + (question.points || 0);
           }, 0);
           setTotalPoints(total);
          } else {
            setTotalPoints(0);
           }
        
         // Fetch student's attempt count
        if (currentUser) {
          const results = await quizzesClient.findQuizResultsForStudent(qid, currentUser._id);
          const attempts = results?.length || 0;
          setAttemptCount(attempts);
          
          // Check if student can take quiz
          const allowedAttempts = quiz.howManyAttempts || 1;
          setCanTakeQuiz(attempts < allowedAttempts);
        }
      } catch (error) {
        console.error("Error fetching attempt data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [qid, quiz, currentUser, isFaculty]);

  if (!quiz) return <div>Quiz not found.</div>;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${month} ${day} at ${displayHours}:${displayMinutes}${ampm}`;
  };

  const allowedAttempts = quiz.howManyAttempts || 1;
  const nextAttemptNumber = attemptCount + 1;
  // Check if quiz is available
  const now = new Date();
  const availableFrom = new Date(quiz.availableFromDate);
  const dueDate = new Date(quiz.dueDate);
  const isAvailable = now >= availableFrom && now <= dueDate;


  return (
    <Container className="mt-4">
     {isFaculty && (
      <div className="d-flex justify-content-center mb-4">
        <Button 
          variant="outline-secondary" 
          className="me-2"
          style={{ minWidth: '120px' }}
          onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/Preview`)}
        >Preview
        </Button>
        <Button 
          variant="outline-secondary"
          style={{ minWidth: '120px' }}
          onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/Editor`)}
        >Edit
        </Button>
      </div>
     )}
      
      <Card className="p-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="mb-4">{quiz.title || "Q1 - HTML"}</h2>
        
        <Row className="mb-3">
          <Col sm={4} className="text-end fw-bold">Quiz Type</Col>
          <Col sm={8}>{quiz.type || "Graded Quiz"}</Col>
        </Row>
        
        <Row className="mb-3">
          <Col sm={4} className="text-end fw-bold">Points</Col>
          <Col sm={8}>{totalPoints || quiz.points || 0}</Col>
        </Row>
        
        <Row className="mb-3">
          <Col sm={4} className="text-end fw-bold">Assignment Group</Col>
          <Col sm={8}>{quiz.assignmentGroup || "QUIZZES"}</Col>
        </Row>
        
        <Row className="mb-3">
          <Col sm={4} className="text-end fw-bold">Shuffle Answers</Col>
          <Col sm={8}>{quiz.shuffleAnswers || "Yes" }</Col>
        </Row>
        
        <Row className="mb-3">
          <Col sm={4} className="text-end fw-bold">Time Limit</Col>
          <Col sm={8}>{quiz.timeLimit || "20 Minutes"}</Col>
        </Row>
        
        <Row className="mb-3">
          <Col sm={4} className="text-end fw-bold">Multiple Attempts</Col>
          <Col sm={8}>{quiz.multipleAttempts || "No"}</Col>
        </Row>
        
        <Row className="mb-3">
          <Col sm={4} className="text-end fw-bold">View Responses</Col>
          <Col sm={8}>{quiz.viewResponses || "Always"}</Col>
        </Row>
        
        <Row className="mb-3">
          <Col sm={4} className="text-end fw-bold">Show Correct Answers</Col>
          <Col sm={8}>{quiz.showCorrectAnswers ? "Yes" : "No"}</Col>
        </Row>
        
        <Row className="mb-3">
          <Col sm={4} className="text-end fw-bold">One Question at a Time</Col>
          <Col sm={8}>{quiz.oneQuestionAtTime ? "Yes" : "No"}</Col>
        </Row>
        
        <Row className="mb-3">
          <Col sm={4} className="text-end fw-bold">Require Respondus LockDown Browser</Col>
          <Col sm={8}>{quiz.requireLockdown || "No"}</Col>
        </Row>
        
        <Row className="mb-3">
          <Col sm={4} className="text-end fw-bold">Required to View Quiz Results</Col>
          <Col sm={8}>{quiz.requiredToViewResults || "No"}</Col>
        </Row>
        
        <Row className="mb-3">
          <Col sm={4} className="text-end fw-bold">Webcam Required</Col>
          <Col sm={8}>{quiz.webcamRequired ? "Yes" : "No"}</Col>
        </Row>
        
        <Row className="mb-3">
          <Col sm={4} className="text-end fw-bold">Lock Questions After Answering</Col>
          <Col sm={8}>{quiz.lockQuestionsAfterAnswering ? "Yes" : "No"}</Col>
        </Row>
        
        
        <hr/>
        
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Due</th>
                <th>For</th>
                <th>Available from</th>
                <th>Until</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{quiz.dueDate ? formatDateTime(quiz.dueDate) : "Sep 21 at 1pm"}</td>
                <td>{quiz.assignTo || "Everyone"}</td>
                <td>{quiz.availableFromDate ? formatDateTime(quiz.availableFromDate) : "-"}</td>
                <td>{quiz.availableUntilDate ? formatDateTime(quiz.availableUntilDate) : "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {!isFaculty && !loading && (
          <>
            <div className="text-center mt-4 mb-3">
              <h6>This is your attempt: {nextAttemptNumber}</h6>
              <p className="text-muted mb-0">
                You are allowed {allowedAttempts} attempt{allowedAttempts !== 1 ? 's' : ''}
              </p>
            </div>
            
          <div className="text-center mt-4 d-flext gap-2">
            <Button 
              variant="success" 
              size="lg"
              onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/Take`)}
              disabled={!canTakeQuiz || !isAvailable || !quiz.published}
                style={{
                  opacity: (!canTakeQuiz || !isAvailable || !quiz.published) ? 0.5 : 1,
                  cursor: (!canTakeQuiz || !isAvailable || !quiz.published) ? 'not-allowed' : 'pointer'
                }}
            >
              Start Quiz
            </Button>

            {attemptCount > 0 && (
                <Button
                  variant="outline-primary"
                  size="lg"
                  onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/results`)}
                >
                  View Results
                </Button>
            )}

          </div>
          {!canTakeQuiz && attemptCount >= allowedAttempts && (
              <Alert variant="warning" className="mt-3 mb-0">
                You have used all {allowedAttempts} attempt{allowedAttempts !== 1 ? 's' : ''} for this quiz.
              </Alert>
            )}
            {!isAvailable && now < availableFrom && (
              <Alert variant="info" className="mt-3 mb-0">
                This quiz is not available until {formatDateTime(quiz.availableFromDate)}.
              </Alert>
            )}
            {!isAvailable && now > dueDate && (
              <Alert variant="danger" className="mt-3 mb-0">
                This quiz is closed. The due date was {formatDateTime(quiz.dueDate)}.
              </Alert>
            )}
            {!quiz.published && (
              <Alert variant="warning" className="mt-3 mb-0">
                This quiz is not published yet.
              </Alert>
            )}
            </>
        )}

        
      </Card>
    </Container>
  );
}