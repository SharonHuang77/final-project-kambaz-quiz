import { useParams, useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";
import { Button, Card, Container, Row, Col } from "react-bootstrap";

export default function QuizDetailSummary() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();

  const { quizzes = [] } = useSelector((state: any) => state.quizzesDetailReducer);
  const quiz = quizzes.find((q: any) => q._id === qid);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const isFaculty = currentUser?.role === "FACULTY";

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

  return (
    <Container className="mt-4">
     
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
      
      <Card className="p-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="mb-4">{quiz.title || "Q1 - HTML"}</h2>
        
        <Row className="mb-3">
          <Col sm={4} className="text-end fw-bold">Quiz Type</Col>
          <Col sm={8}>{quiz.type || "Graded Quiz"}</Col>
        </Row>
        
        <Row className="mb-3">
          <Col sm={4} className="text-end fw-bold">Points</Col>
          <Col sm={8}>{quiz.points || 0}</Col>
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
          <Col sm={8}>{quiz.showCorrectAnswers || "Immediately"}</Col>
        </Row>
        
        <Row className="mb-3">
          <Col sm={4} className="text-end fw-bold">One Question at a Time</Col>
          <Col sm={8}>{quiz.oneQuestionAtTime || "Yes"}</Col>
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
          <Col sm={8}>{quiz.webcamRequired || "No"}</Col>
        </Row>
        
        <Row className="mb-3">
          <Col sm={4} className="text-end fw-bold">Lock Questions After Answering</Col>
          <Col sm={8}>{quiz.lockQuestionsAfterAnswering || "No"}</Col>
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
                <td>{quiz.availableFromDate ? formatDateTime(quiz.availableFromDate) : "Sep 21 at 11:40am"}</td>
                <td>{quiz.availableUntilDate ? formatDateTime(quiz.availableUntilDate) : "Sep 21 at 1pm"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {!isFaculty && (
          <div className="text-center mt-4">
            <Button 
              variant="success" 
              size="lg"
              onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/Take`)}
            >
              Start Quiz
            </Button>
          </div>
        )}
      </Card>
    </Container>
  );
}