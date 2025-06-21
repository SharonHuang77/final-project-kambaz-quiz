import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button, Row, Card, Col, Nav } from "react-bootstrap";
import { addQuiz, updateQuiz } from "./reducer.ts";
import * as quizzesClient from "../../client.tsx";
import type { RootState, Quiz } from "../../../types.ts";
import { FaBan } from "react-icons/fa";
import { Editor } from "@tinymce/tinymce-react";
import { BsThreeDotsVertical } from "react-icons/bs";


export default function QuizDetailEditor() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { quizzes =[] } = useSelector((state: RootState) => state.quizzesDetailReducer);
  const quiz = quizzes.find((q: any) => q._id === qid);

  const isNewQuiz = !qid;
  const [activeTab] = useState("details");

  const [editorContent, setEditorContent] = useState("");
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false);
  

  const [editedQuiz, setEditedQuiz] = useState<Quiz>({
    title: "Unnamed Quiz",
    course: cid || "",
    points: 0,
    numberOfQuestions: 0,
    score: 0,
    quizType: "Graded Quiz",
    published: false,
    shuffleAnswers: false,
    timeLimitMinutes: 20,
    multipleAttempts: false,
    howManyAttempts: 1,
    description: "",
    assignmentGroup: "Quizzes"
  });
  const [dueDate, setDueDate] = useState("");
  const [availableFromDate, setAvailableFromDate] = useState("");
  const [availableUntilDate, setAvailableUntilDate] = useState("");

  useEffect(() => {
    if (!isNewQuiz && quiz) {
      const hasTimeLimit = !!(quiz.timeLimit && quiz.timeLimit > 0);
      setEditedQuiz({
        ...quiz,
        timeLimitMinutes: hasTimeLimit ? quiz.timeLimit : 20
      });
      setTimeLimitEnabled(hasTimeLimit);
      setEditorContent(quiz.description || "");

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
      published: false ,
      description: editorContent,
      timeLimit: timeLimitEnabled ? (editedQuiz.timeLimitMinutes || 20) : 0,
      howManyAttempts: editedQuiz.multipleAttempts ? (editedQuiz.howManyAttempts || 1) : 1,
      assignmentGroup: editedQuiz.assignmentGroup || "Quizzes"
    };
    delete quizData.timeLimitEnabled;
    delete quizData.timeLimitMinutes;

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
      published: true,
      description: editorContent, 
      timeLimit: timeLimitEnabled ? (editedQuiz.timeLimitMinutes || 20) : 0,
      howManyAttempts: editedQuiz.multipleAttempts ? (editedQuiz.howManyAttempts || 1) : 1,
      assignmentGroup: editedQuiz.assignmentGroup || "Quizzes"
    };
    delete quizData.timeLimitEnabled;
    delete quizData.timeLimitMinutes;
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
        <h3>{isNewQuiz ? "New Quiz" : "Edit Quiz"} {quiz?.title}</h3>
        <div className="d-flex align-items-center">
          <span className="me-3">Points {editedQuiz.points || 0}</span>
          <div className="d-flex align-items-center">
            <div 
              className="d-flex align-items-center me-3"
              style={{ 
                opacity: editedQuiz.published ? 0.5 : 1,
                transition: 'opacity 0.3s ease'
              }}
            >
              <FaBan
                className={`me-2 ${editedQuiz.published ? 'text-muted' : 'text-danger'}`} 
              />
              <span className={editedQuiz.published ? 'text-muted' : 'text-danger'}>
                Not Published
              </span>
            </div>
            <BsThreeDotsVertical />
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
          <Editor
            apiKey="foeb8ni7rkbpo9kctear5mi485lcceuuqws0gaqtlegm4637"
            value={editedQuiz.description}
            init={{
              height: 300,
              menubar: true,
              plugins: [
                "advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor",
                "searchreplace", "visualblocks", "code", "fullscreen",
                "media", "table", "help", "wordcount"
              ],
              toolbar:
                'undo redo | formatselect | ' +
                'bold italic underline forecolor backcolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
              statusbar: true
            }}
            onEditorChange={(content) => handleChange("description", content)}/>

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
              <Form.Select value={editedQuiz.assignmentGroup || "Quizzes"}
                onChange={(e) => handleChange("assignmentGroup", e.target.value)}>
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
                <Form.Group as={Row} className="align-items-center mt-2">
                <Col xs="auto">
                  <Form.Check
                    type="checkbox"
                    id="wd-time-limit"
                    label="Time Limit"
                    checked={timeLimitEnabled}
                    onChange={(e) => {
                      setTimeLimitEnabled(e.target.checked);
                      if (!e.target.checked) {
                        handleChange("timeLimitMinutes", 20);
                      }

                    }}
                  />
                </Col>
                <Col xs="auto">
                  <Form.Control
                    type="number"
                    min={1}
                    value={editedQuiz.timeLimitMinutes || 20}
                    disabled={!timeLimitEnabled}
                    onChange={(e) => handleChange("timeLimitMinutes", parseInt(e.target.value) || 20)}
                    placeholder="Minutes"
                    style={{ width: "100px", display: "inline" }}
                  />
                </Col>
                <Col xs="auto">
                  <span className="text-muted">Minutes</span>
                </Col>
              </Form.Group><hr />

              <Form.Group as={Row} className="align-items-center">
                  <Col xs="auto">
                    <Form.Check 
                      type="checkbox" 
                      id="wd-allow-multiple-attempts" 
                      label="Allow Multiple Attempts" 
                      checked={editedQuiz.multipleAttempts || false}
                      onChange={(e) => {
                        handleChange("multipleAttempts", e.target.checked);
                        if (!e.target.checked) {
                          handleChange("howManyAttempts", 1);
                        }
                      }}
                    />
                  </Col>
                  <Col xs="auto">
                    <Form.Control
                      type="number"
                      min={1}
                      value={editedQuiz.howManyAttempts || 1}
                      disabled={!editedQuiz.multipleAttempts}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 1) {
                          handleChange("howManyAttempts", value);
                        }
                      }}
                      placeholder="Attempts"
                      style={{ width: "100px", display: "inline" }}
                    />
                  </Col>
                  <Col xs="auto">
                    <span className="text-muted">Attempts</span>
                  </Col>
                </Form.Group><hr />
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
                  <Form.Control type="datetime-local" 
                  value={dueDate ? new Date(dueDate).toISOString().slice(0, 16) : ""} 
                    onChange={(e) => setDueDate(e.target.value) }/>
                  </Form.Group>
                  <Row>
                    <Col>
                      <Form.Group className="mb-3" controlId="wd-available-from">
                        <Form.Label>Available From</Form.Label>
                        
                      <Form.Control type="datetime-local" 
                      value={availableFromDate ? new Date(availableFromDate).toISOString().slice(0, 16) : ""} 
                      onChange={(e) => setAvailableFromDate(e.target.value)}/>
                      </Form.Group>
                    </Col>
                    <Col>                        
                    <Form.Group className="mb-3" controlId="wd-available-until">
                      <Form.Label>Until</Form.Label>
                      
                      <Form.Control type="datetime-local" value={availableUntilDate ? new Date(availableUntilDate).toISOString().slice(0, 16) : ""} 
                        onChange={(e) => setAvailableUntilDate(e.target.value)}/>
                    </Form.Group>
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
