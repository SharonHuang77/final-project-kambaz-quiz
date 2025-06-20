import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState, useCallback } from "react";
import { Button, Card, Row, Col, Alert, ListGroup, ProgressBar } from "react-bootstrap";
import { FaExclamationCircle, FaClock } from "react-icons/fa";
import * as quizzesClient from "../client";
import * as questionsClient from "./QuizQuestion/client";

export default function QuizPreview() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const isFaculty = currentUser?.role === "FACULTY";
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const [startTime] = useState(new Date());

  const checkIfCorrect = (question: any, userAnswer: any) => {
    if (!userAnswer && userAnswer !== 0 && userAnswer !== false) return false;
    
    switch (question.type) {
      case "multiple-choice":
        return userAnswer === question.correctAnswer;
      case "true-false":
        return userAnswer === question.correctAnswer;
      case "fill-in-blank":
        return question.acceptableAnswers?.some(
          (ans: string) => ans.toLowerCase() === userAnswer?.toLowerCase()
        );
      default:
        return false;
        }
  };
  
  useEffect(() => {
    const fetchQuizAndQuestions = async () => {
      try {
        setLoading(true);
        // Fetch quiz details
        const quizData = await quizzesClient.findQuizById(qid!);
        console.log("Loaded quiz:", quizData);
        setQuiz(quizData);
        // Fetch questions separately
        const questionsData = await questionsClient.getQuestions(qid!);
        console.log("Loaded questions:", questionsData);
        setQuestions(questionsData || []);
        setError(null);
      } catch (error) {
        console.error("Error loading quiz or questions:", error);
        setError("Failed to load quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (qid) fetchQuizAndQuestions();
  }, [qid]);

  //Handle time
  useEffect(() => {
    if (!quiz || submitted || !quiz.timeLimit) return;
    const limit = (quiz.timeLimitMinutes ?? 20) * 60;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= limit && !submitted && !autoSubmitted) {
        setAutoSubmitted(true); 
        
      }
      return next;
    });
  }, 1000);
  return () => clearInterval(timer);
}, [quiz, submitted, autoSubmitted]);
  // Auto-submit when time runs out
  useEffect(() => {
    if (autoSubmitted && !submitted) {
      handleSubmit();
    }
  }, [autoSubmitted]);

  const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' + secs : secs}`;
};
  
const handleAnswer = (qid: string, value: any) => {
    setAnswers({ ...answers, [qid]: value });
  };
  const calculateScore = useCallback(() => {
    let total = 0;
    questions.forEach((q: any) => {
      const userAnswer = answers[q._id];
      if (q.type === "multiple-choice" && userAnswer === q.correctAnswer) total += q.points;
      if (q.type === "true-false" && userAnswer === q.correctAnswer) total += q.points;
      if (
        q.type === "fill-in-blank" &&
        q.acceptableAnswers?.some((ans: string) => ans.toLowerCase() === userAnswer?.toLowerCase())
      ) {
        total += q.points;
      }
    });
    return total;
     }, [questions, answers]);

     const handleSubmit = async () => {
    if (submitted) return; // Prevent double submission
    
    const totalScore = calculateScore();
    setScore(totalScore);
    setSubmitted(true);

    if (!isFaculty) {
      try {
        // Calculate time spent
        const endTime = new Date();
        const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // in seconds
        // Format answers to match the new schema
        const formattedAnswers = questions.map((q: any) => ({
          questionId: q._id,
          answer: answers[q._id] || null,
          isCorrect: checkIfCorrect(q, answers[q._id]),
          pointsEarned: checkIfCorrect(q, answers[q._id]) ? q.points : 0
        }));

        await quizzesClient.submitQuizResult(qid!, {
          studentId: currentUser._id,
          answers: formattedAnswers,
          score: totalScore,
          totalPoints: quiz.points,
          timeSpent,
          startedAt: startTime
        });
        navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/Results/${currentUser._id}`);
        console.log("Quiz submission saved to DB.");
      } catch (error) {
        console.error("Error saving quiz submission:", error);
      }
    }
  };
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  // Error state
  if (error) return (
    <Alert variant="danger">
      {error}
      <Button variant="link" onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}>
        Back to Quizzes
      </Button>
    </Alert>
  );


  if (!quiz || questions.length === 0) {
    return (
      <Alert variant="warning">
        This quiz has no questions.
        <Button variant="link" onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}>
          Back to Quizzes
        </Button>
      </Alert>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const totalLimit = quiz.timeLimitMinutes ?? 20;
  const timeProgress = (elapsedSeconds / (totalLimit * 60)) * 100;

  return (
    <Row>
      <Col md={8}>
        <h3>{quiz.title}</h3>
        {isFaculty && (
          <Alert variant="warning" className="d-flex align-items-center">
            <FaExclamationCircle className="me-2" />
            <span>This is a preview of the published version of the quiz.</span>
          </Alert>
        )}

        {quiz.timeLimit && (
          <Alert variant={timeProgress > 80 ? "danger" : "info"} className="d-flex align-items-center justify-content-between">
            <div>
              <FaClock className="me-2" />
              Time Remaining: {formatTime((totalLimit * 60) - elapsedSeconds)}
            </div>
            <ProgressBar 
              now={timeProgress} 
              variant={timeProgress > 80 ? "danger" : "primary"}
              style={{ width: "200px" }}
            />
          </Alert>
        )}

        <div className="mb-3">
          <strong>Started:</strong> {new Date().toLocaleString()}
        </div>

        {quiz.description && (
          <>
            <h5 className="mb-3">Quiz Instructions</h5>
            <div dangerouslySetInnerHTML={{ __html: quiz.description }} className="mb-4" />
          </>
        )}

        <Card className="mb-3">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className="text-muted">{currentQuestion.points} points</span>
            </div>
          </Card.Header>
          <Card.Body>
            <h5>{currentQuestion.title}</h5>
            <div dangerouslySetInnerHTML={{ __html: currentQuestion.question }} className="mb-3" />

            {currentQuestion.type === "multiple-choice" &&
              currentQuestion.choices.map((choice: string, i: number) => (
                <div key={i} className="mb-2">
                  <label>
                    <input
                      type="radio"
                      name={currentQuestion._id}
                      value={i}
                      disabled={submitted}
                      checked={answers[currentQuestion._id] === i}
                      onChange={() => handleAnswer(currentQuestion._id, i)}
                      className="me-2"
                    />
                    {choice}
                  </label>
                </div>
              ))}
              {currentQuestion.type === "true-false" && (
              <>
                <div className="mb-2">
                  <label>
                    <input
                      type="radio"
                      name={currentQuestion._id}
                      value="true"
                      disabled={submitted}
                      checked={answers[currentQuestion._id] === true}
                      onChange={() => handleAnswer(currentQuestion._id, true)}
                      className="me-2"
                    />
                    True
                  </label>
                </div>
                <div className="mb-2">
                  <label>
                    <input
                      type="radio"
                      name={currentQuestion._id}
                      value="false"
                      disabled={submitted}
                      checked={answers[currentQuestion._id] === false}
                      onChange={() => handleAnswer(currentQuestion._id, false)}
                      className="me-2"
                    />
                    False
                  </label>
                </div>
              </>
            )}
            {currentQuestion.type === "fill-in-blank" && (
              <input
                type="text"
                className="form-control w-50"
                value={answers[currentQuestion._id] || ""}
                disabled={submitted}
                onChange={(e) => handleAnswer(currentQuestion._id, e.target.value)}
                placeholder="Type your answer here"
              />
            )}

            {submitted && (
              <Alert variant={
                currentQuestion.type === "fill-in-blank"
                  ? currentQuestion.acceptableAnswers?.some(
                      (ans: string) => ans.toLowerCase() === (answers[currentQuestion._id] || "").toLowerCase()
                    ) ? "success" : "danger"
                  : answers[currentQuestion._id] === currentQuestion.correctAnswer ? "success" : "danger"
              } className="mt-3">
                {currentQuestion.type === "fill-in-blank"
                  ? currentQuestion.acceptableAnswers?.some(
                      (ans: string) => ans.toLowerCase() === (answers[currentQuestion._id] || "").toLowerCase()
                    ) ? "✔ Correct" : "✘ Incorrect"
                  : answers[currentQuestion._id] === currentQuestion.correctAnswer ? "✔ Correct" : "✘ Incorrect"
                }
              </Alert>

              )}
          </Card.Body>
          <Card.Footer>
            <div className="d-flex justify-content-between">
              <Button
                variant="outline-secondary"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              {currentQuestionIndex < questions.length - 1 ? (
                <Button variant="outline-primary" onClick={handleNextQuestion}>
                  Next
                </Button>
              ) : (
                !submitted && (
                  <Button variant="success" onClick={handleSubmit}>
                    Submit Quiz
                  </Button>
                )
              )}
            </div>
          </Card.Footer>
        </Card>

        {submitted && (
          <Alert variant="info" className="mt-3">
            <h5>Quiz Completed!</h5>
            <p>Total Score: {score} / {quiz.points} ({Math.round((score / quiz.points) * 100)}%)</p>
            <Button variant="primary" onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}>
              Back to Quizzes
            </Button>
          </Alert>
        )}
      </Col>

      <Col md={4}>
        {isFaculty && (
          <Card className="mb-4">
            <Card.Body>
              <Button 
                variant="outline-primary" 
                className="w-100" 
                onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/Questions`)}
              >
                Keep Editing This Quiz
              </Button>
            </Card.Body>
          </Card>
        )}

        <Card>
          <Card.Header>
            <h5 className="mb-0">Questions</h5>
          </Card.Header>
          <Card.Body>
            <ListGroup variant="flush">
              {questions.map((q: any, index: number) => (
                <ListGroup.Item
                  key={q._id}
                  action
                  active={currentQuestionIndex === index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className="d-flex justify-content-between align-items-center"
                >
                  <span>Question {index + 1}</span>
                  {submitted && (
                    <span className={answers[q._id] !== undefined ? "text-success" : "text-danger"}>
                      {answers[q._id] !== undefined ? "✓" : "○"}
                    </span>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

