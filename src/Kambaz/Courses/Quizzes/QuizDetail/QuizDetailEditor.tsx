import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button, Row, Card, Col, Nav } from "react-bootstrap";
import { addQuiz, updateQuiz } from "./reducer.ts";
import * as quizzesClient from "../../client.tsx";
import type { RootState, Quiz } from "../../../types.ts";

export default function QuizDetailEditor() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { quizzes =[] } = useSelector((state: RootState) => state.quizzesDetailReducer);
  const quiz = quizzes.find((q: any) => q._id === qid);

  const isNewQuiz = !qid;
  const [activeTab] = useState("details");
  const [editedQuiz, setEditedQuiz] = useState<Quiz>({
    _id: qid || "",
    title: "Unnamed Quiz",
    course: cid || "",
    points: 0,
    numberOfQuestions: 0,
    score: 0,
    quizType: "Graded Quiz",
    published: false,
    shuffleAnswers: false,
    timeLimit: false,
    multipleAttempts: false
  });
  const [dueDate, setDueDate] = useState("");
  const [availableFromDate, setAvailableFromDate] = useState("");
  const [availableUntilDate, setAvailableUntilDate] = useState("");

  useEffect(() => {
    if (!isNewQuiz && quiz) {setEditedQuiz({ ...quiz });
    if (quiz.dueDate) setDueDate(quiz.dueDate);
    if (quiz.availableFromDate) setAvailableFromDate(quiz.availableFromDate);
    if (quiz.availableUntilDate) setAvailableUntilDate(quiz.availableUntilDate);
    }
  }, [quiz, isNewQuiz]);

  const handleChange = (field: keyof Quiz, value: string | number | boolean) => {
    setEditedQuiz({ ...editedQuiz, [field]: value });
  };

  const handleSave = async () => {
    try{
    const quizData = {
      ...editedQuiz,
      _id: qid || "",
      dueDate,
      availableFromDate,
      availableUntilDate,
      published: false 
    };
    if (isNewQuiz) {
        const newQuiz = await quizzesClient.createQuizForCourse(cid!, quizData);
        dispatch(addQuiz(newQuiz));
        navigate(`/Kambaz/Courses/${cid}/Quizzes/${newQuiz._id}`);
      } else {
        const updated = await quizzesClient.updateQuiz(quizData);
        dispatch(updateQuiz(updated));
        navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}`);
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Failed to save quiz. Please try again.");
    }
  };

  const handleSaveAndPublish = async () => {
    try {
    const quizData = {
      ...editedQuiz,
      _id: qid || "",
      dueDate,
      availableFromDate,
      availableUntilDate,
      published: true 
    };
    if (isNewQuiz) {
      const newQuiz = await quizzesClient.createQuizForCourse(cid!, quizData);
        dispatch(addQuiz(newQuiz));
      } else {
        const updated = await quizzesClient.updateQuiz(quizData);
        dispatch(updateQuiz(updated));
      }
      navigate(`/Kambaz/Courses/${cid}/Quizzes`);
    } catch (error) {
      console.error("Error saving and publishing quiz:", error);
      alert("Failed to save and publish quiz. Please try again.");
    }
  };  

   
  const handleCancel = () => {
    navigate(`/Kambaz/Courses/${cid}/Quizzes`);
  };
  if (!isNewQuiz && !quiz) return <div>Quiz not found.</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>{isNewQuiz ? "New Quiz" : "Edit Quiz"}</h3>
        <div className="d-flex align-items-center">
          <span className="me-3">Points {editedQuiz.points || 0}</span>
          <div className="d-flex align-items-center">
            <Form.Check 
              type="checkbox"
              id="published-check"
              label="Not Published"
              checked={!editedQuiz.published}
              onChange={(e) => handleChange("published", !e.target.checked)}
              className="me-2"
            />
            <Button variant="link" className="p-0">
              <i className="bi bi-three-dots-vertical"></i>
            </Button>
          </div>
        </div>
       </div>
 
      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
        <Nav.Link 
         active={true}
         onClick={() => { 
      }}>
         Details
        </Nav.Link>
        </Nav.Item>
        <Nav.Item>
         <Nav.Link 
          active={false}
          onClick={() => {if (qid && cid) {
        navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/Questions`);
      }
    }}>
            Questions
        </Nav.Link>
        </Nav.Item>
        </Nav>

          {activeTab === "details" && (
          <Form>
          <Form.Group className="mb-3">
            <Form.Control 
              type="text" 
              value={editedQuiz.title || ""} 
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Quiz Title"
              className="mb-3"/>
          </Form.Group>

          <Form.Group className="mb-3">
          <Form.Label>Quiz Instruction</Form.Label>
          <div className="d-flex align-items-center mb-2 gap-2 flex-wrap">
            <Form.Select size="sm" style={{ width: "80px" }} defaultValue="12pt">
              <option>12pt</option>
              <option>14pt</option>
              <option>16pt</option>
            </Form.Select>
            <Form.Select size="sm" style={{ width: "100px" }} defaultValue="Paragraph">
              <option>Paragraph</option>
            </Form.Select>
              <div className="btn-group btn-group-sm me-2" role="group">
                <Button variant="light"><b>B</b></Button>
                <Button variant="light"><i>I</i></Button>
                <Button variant="light"><u>U</u></Button>
                <Button variant="light">A</Button>
                <Button variant="light">🎨</Button>
                <Button variant="light" size="sm">T²</Button>
                <Button variant="light" size="sm" className="ms-auto">⋮</Button>
              </div>
              <Form.Control as="textarea" rows={3} value={editedQuiz.description || ""} onChange={(e) => handleChange("description", e.target.value)} />
          </div >
          </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Form.Label>Quiz Type</Form.Label>
              <Form.Select value={editedQuiz.quizType || "Graded Quiz"}
                onChange={(e) => handleChange("quizType", e.target.value)}>
                <option value="Graded Quiz">Graded Quiz</option>
                <option value="Practice Quiz">Practice Quiz</option>
                <option value="Graded Survey">Graded Survey</option>
                <option value="Ungraded Survey">Ungraded Survey</option>
              </Form.Select>
            </Form.Group>

            <Form.Group as={Row} className="mb-3" controlId="wd-submission-type">
              <Form.Label>Assignment Group</Form.Label>            
              <Form.Select defaultValue="Quizzes">
                <option value="Quizzes">Quizzes</option>
                <option value="Exams">Exams</option>
                <option value="Assignments">Assignments</option>
                <option value="Project">Project</option>
              </Form.Select><br/>
            </Form.Group>

            <Form.Group as={Row} className="mb-3" controlId="wd-submission-type"> 
              <Form.Label column sm={2}>Options</Form.Label> 
              <Col sm={10}>
              <Card className="p-3">
                <Card.Title as="h6" className="mb-3">Quiz Options</Card.Title>
                <Form.Check type="checkbox" id="wd-shuffle-answers" label="Shuffle Answers"
                  checked={editedQuiz.shuffleAnswers || false} 
                  onChange={(e) => handleChange("shuffleAnswers", e.target.checked)}
                  />
                <Form.Check type="checkbox" id="wd-time-limit" label="Time Limit"
                  checked={editedQuiz.timeLimit || false}
                  onChange={(e) => handleChange("timeLimit", e.target.checked)}
                /><hr />
                <Form.Check type="checkbox" id="wd-allow-multiple-ttempts" label="Allow Multiple Attempts" 
                  checked={editedQuiz.multipleAttempts || false}
                  onChange={(e) => handleChange("multipleAttempts", e.target.checked)}
                /><hr />
              </Card>
              </Col>        
            </Form.Group>

            <Form.Group as={Row} className="mb-3" controlId="wd-assign-to">
              <Form.Label column sm={2}>Assign</Form.Label>
                <Col sm={10}>
                <Card className="p-3">
                  <Form.Label>Assign to</Form.Label>
                  <Form.Select defaultValue="Everyone" className="mb-3">
                    <option value="Everyone" >Everyone</option>
                    <option value="Section 1">Section 1</option>
                    <option value="Section 2">Section 2</option>
                  </Form.Select>

              <Form.Group className="mb-3" controlId="wd-due-date">
                <Form.Label>Due</Form.Label>
                  <Form.Control type="date" value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value) }/>
                  </Form.Group>
                  <Row>
                    <Col>
                      <Form.Group className="mb-3" controlId="wd-available-from">Available From</Form.Group>
                      <Form.Control type="date" value={availableFromDate} 
                      onChange={(e) => setAvailableFromDate(e.target.value)}/>
                    </Col>
                    <Col>                        
                    <Form.Group className="mb-3" controlId="wd-available-until">Until</Form.Group>
                      <Form.Control type="date" value={availableUntilDate } 
                        onChange={(e) => setAvailableUntilDate(e.target.value)}/>
                    </Col>
                    
                  </Row> <hr />
                </Card>
                </Col>
          </Form.Group>
            <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" className="me-2" onClick={handleCancel} >Cancel</Button>
          
            <Button variant="danger" onClick={handleSave}>Save </Button>
          
        
            <Button variant="danger" onClick={handleSaveAndPublish}>Save and Publish</Button>
    
            </div>
            </Form>
          )}
          
    </div>    
            
  );
}
