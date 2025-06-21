import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button, Card, Row, Col, Alert, ListGroup, ProgressBar } from "react-bootstrap";
import { FaExclamationCircle, FaClock, FaCheckCircle, FaTimesCircle  } from "react-icons/fa";
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
  const [submitting, setSubmitting] = useState(false);//add
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [previousAttempts, setPreviousAttempts] = useState<any[]>([]); //add
  

  const [startTime] = useState(new Date());
  const hasFetchedRef = useRef(false); //add
  const isMountedRef = useRef(true);


  const checkIfCorrect = (question: any, userAnswer: any) => {
    if (userAnswer === null || userAnswer === undefined || userAnswer === '') {
      return false;
    } //fix
    
    switch (question.type) {
      case "multiple-choice":
        return Number(userAnswer) === Number(question.correctAnswer);//fix
      case "true-false":
        // add:Handle boolean comparison properly
        const correctBool = question.correctAnswer === true || 
                          question.correctAnswer === "true" || 
                          question.correctAnswer === 1;
        const userBool = userAnswer === true || 
                        userAnswer === "true" || 
                        userAnswer === 1;
        return correctBool === userBool;
      case "fill-in-blank"://add
        const userAnswerStr = String(userAnswer).trim().toLowerCase();
        return question.possibleAnswers?.some(
          (ans: string) => String(ans).trim().toLowerCase() === userAnswerStr
        );//
      default:
        return false;
        }
  };
  
  useEffect(() => {
    isMountedRef.current = true;
    const fetchQuizAndQuestions = async () => {
      //add
      if (hasFetchedRef.current || !qid) return;
      hasFetchedRef.current = true;//
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 50));
         if (!isMountedRef.current) return;
        // Fetch quiz details
        const quizData = await quizzesClient.findQuizById(qid!);
        console.log("Loaded quiz:", quizData);

        if (!isMountedRef.current) return;
        setQuiz(quizData);
        // Fetch questions separately
        const questionsData = await questionsClient.getQuestions(qid!);
        console.log("Loaded questions:", questionsData);
        if (!isMountedRef.current) return;
        setQuestions(questionsData || []);
        
        // add: Fetch previous attempts if student
        if (!isFaculty && currentUser?._id && isMountedRef.current) {
          try {
            const attempts = await quizzesClient.findQuizResultsForStudent(qid!, currentUser._id);
            if (!isMountedRef.current) return;
            setPreviousAttempts(attempts);
        // Check if max attempts reached
            if (quizData.howManyAttempts && attempts.length >= quizData.howManyAttempts) {
              setError(`You have reached the maximum number of attempts (${quizData.howManyAttempts}) for this quiz.`);
              setSubmitted(true);
            }
            } catch (err) {
            console.log("No previous attempts found");
          }
        }
        if (isMountedRef.current) {
        setError(null);}
      } catch (error) {
        console.error("Error loading quiz or questions:", error);
        setError("Failed to load quiz. Please try again.");
      } finally {
        if (isMountedRef.current) {
        setLoading(false);}
      }
    };
    fetchQuizAndQuestions();
  
    // Reset ref when component unmounts or qid changes
    return () => {
      isMountedRef.current = false;
      hasFetchedRef.current = false;
    };
  }, [qid, currentUser?._id, isFaculty]);

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
    if (autoSubmitted && !submitted && !submitting) {
      const timeoutId = setTimeout(() => {
        if (!submitted && !submitting) {
          handleSubmit();
    }
  }, 100);
    return () => clearTimeout(timeoutId);
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
      if (checkIfCorrect(q, userAnswer)) {
        total += q.points || 0;
      }
    });
    
    return total;
     }, [questions, answers]);

     const handleSubmit = async () => {
    if (submitted || submitting) return; // Prevent double submission
    setSubmitting(true);
    const totalScore = calculateScore();
    setScore(totalScore);
    setSubmitted(true);

    if (!isFaculty && currentUser?._id) {
      try {
        // Calculate time spent
        const endTime = new Date();
        const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // in seconds
        // Format answers to match the new schema
        const formattedAnswers = questions.map((q: any) => ({
          questionId: q._id,
          answer: answers[q._id] !== undefined ? answers[q._id] : null,
          isCorrect: checkIfCorrect(q, answers[q._id]),
          pointsEarned: checkIfCorrect(q, answers[q._id]) ? (q.points || 0) : 0
        }));

        const totalPossiblePoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
        await quizzesClient.submitQuizResult(qid!, {
          studentId: currentUser._id,
          courseId: cid!, // add: Include courseId
          answers: formattedAnswers,
          score: totalScore,
          totalPoints: totalPossiblePoints || quiz.points,
          timeSpent,
          startedAt: startTime,
          submittedAt: endTime
        });
        console.log("Quiz submission saved to DB.");
      } catch (error) {
        console.error("Error saving quiz submission:", error);
        setError("Failed to save quiz submission. Your answers may not have been recorded.");
      }
    }
    setSubmitting(false);
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
  if (error && !quiz) return (
    <Alert variant="danger">
      <FaTimesCircle className="me-2" />
      {error}
      <div className="mt-2">
      <Button variant="link" onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}>
        Back to Quizzes
      </Button>
      </div>
    </Alert>
  );


  if (!quiz || questions.length === 0) {
    return (
      <Alert variant="warning">
        <FaExclamationCircle className="me-2" />
        This quiz has no questions.
        <div className="mt-2">
        <Button variant="link" onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}>
          Back to Quizzes
        </Button>
        </div>
      </Alert>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const totalLimit = quiz.timeLimit || 20;
  const timeProgress = (elapsedSeconds / (totalLimit * 60)) * 100;

  return (
    <Row>
      <Col md={8}>
        <h3>{quiz.title}</h3>
        {/* Max attempts error */}
        {error && submitted && (
          <Alert variant="danger">
            <FaTimesCircle className="me-2" />
            {error}
          </Alert>
        )}

        {isFaculty && (
          <Alert variant="warning" className="d-flex align-items-center">
            <FaExclamationCircle className="me-2" />
            <span>This is a preview of the published version of the quiz.</span>
          </Alert>
        )}

        {/* Previous attempts info */}
        {!isFaculty && previousAttempts.length > 0 && !submitted && (
          <Alert variant="info">
            <strong>Attempt {previousAttempts.length + 1} of {quiz.howManyAttempts || 'unlimited'}</strong>
            {previousAttempts.length > 0 && (
              <div className="mt-1">
                Previous best score: {Math.max(...previousAttempts.map(a => a.percentage || 0))}%
              </div>
            )}
          </Alert>
        )}

        {quiz.timeLimit && !submitted &&(
          <Alert variant={timeProgress > 80 ? "danger" : "info"} className="d-flex align-items-center justify-content-between">
            <div>
              <FaClock className="me-2" />
              Time Remaining: {formatTime((totalLimit * 60) - elapsedSeconds)}
            </div>
            <ProgressBar 
              now={timeProgress} 
              variant={timeProgress > 80 ? "danger" : "primary"}
              style={{ width: "200px" }}
              animated={timeProgress > 80}
            />
          </Alert>
        )}

        <div className="mb-3">
          <strong>Started:</strong> {startTime.toLocaleString()}
        </div>

        {quiz.description && (
          <Card className="mb-4">
            <Card.Header>
            <h5 className="mb-3">Quiz Instructions</h5>
            </Card.Header>
            <Card.Body>
              <div dangerouslySetInnerHTML={{ __html: quiz.description }} />
            </Card.Body>
            </Card>
        )}

      {!submitted || !error ? (
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
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      id={`choice-${i}`}
                      name={currentQuestion._id}
                      value={i}
                      disabled={submitted}
                      checked={answers[currentQuestion._id] === i}
                      onChange={() => handleAnswer(currentQuestion._id, i)}
                    />
                    <label className="form-check-label" htmlFor={`choice-${i}`}>
                    {choice}
                  </label>
                </div>
                </div>
              ))}
              {currentQuestion.type === "true-false" && (
              <>
                <div className="form-check mb-2">
                  
                    <input
                      type="radio"
                      id="true-option"
                      name={currentQuestion._id}
                      value="true"
                      disabled={submitted}
                      checked={answers[currentQuestion._id] === true}
                      onChange={() => handleAnswer(currentQuestion._id, true)}
                      className="form-check-input"
                    />
                    <label className="form-check-label" htmlFor="true-option">
                    True
                  </label>
                </div>
                <div className="form-check mb-2">
                  
                    <input
                      className="me-2"
                      type="radio"
                      id="false-option"
                      name={currentQuestion._id}
                      disabled={submitted}
                      checked={answers[currentQuestion._id] === false}
                      onChange={() => handleAnswer(currentQuestion._id, false)} 
                    />
                    <label className="form-check-label" htmlFor="false-option">
                    False
                    </label>
                </div>
              </>
            )}
            {currentQuestion.type === "fill-in-blank" && (
              <input
                type="text"
                className="form-control w-50"
                style={{ maxWidth: "400px" }}
                value={answers[currentQuestion._id] || ""}
                disabled={submitted}
                onChange={(e) => handleAnswer(currentQuestion._id, e.target.value)}
                placeholder="Type your answer here"
              />
            )}

            {submitted && (
              <Alert 
                variant={checkIfCorrect(currentQuestion, answers[currentQuestion._id]) ? "success" : "danger"} 
                  className="mt-3">
                    <div className="d-flex align-items-center">
                    {checkIfCorrect(currentQuestion, answers[currentQuestion._id]) ? (
                      <>
                        <FaCheckCircle className="me-2" />
                        <strong>Correct!</strong>
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="me-2" />
                        <strong>Incorrect</strong>
                      </>
                    )}
                  </div>
                  {quiz.showCorrectAnswers && !checkIfCorrect(currentQuestion, answers[currentQuestion._id]) && (
                    <div className="mt-2">
                      <small>
                        Correct answer: {
                          currentQuestion.type === "multiple-choice" 
                            ? currentQuestion.choices[currentQuestion.correctAnswer]
                            : currentQuestion.type === "true-false"
                            ? currentQuestion.correctAnswer ? "True" : "False"
                            : currentQuestion.acceptableAnswers?.join(", ")
                        }
                      </small>
                    </div>
                  )} 
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
              <span className="text-muted align-self-center">
                  {Object.keys(answers).length} of {questions.length} answered
                </span>

              {currentQuestionIndex < questions.length - 1 ? (
                <Button variant="outline-primary" onClick={handleNextQuestion}>
                  Next
                </Button>
              ) : (
                !submitted && (
                  <Button variant="success" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </Button>
                )
              )}
            </div>
          </Card.Footer>
        </Card>
      ) : null}

        {submitted && !error &&(
          <Alert variant="primary" className="mt-3">
            <h5>
              <FaCheckCircle className="me-2" /> Quiz Completed!</h5>

            <Row>
              <Col sm={6}>
                <p className="mb-1">  
                  <strong>Score:</strong> {score} / {questions.reduce((sum, q) => sum + (q.points || 0), 0)} points
                </p>
                <p className="mb-1">
                  <strong>Percentage:</strong> {Math.round((score / questions.reduce((sum, q) => sum + (q.points || 0), 0)) * 100)}%
                </p>
              </Col>
              <Col sm={6}>
              <p className="mb-1"><strong>Time spent:</strong> {formatTime(elapsedSeconds)}</p>
                <p className="mb-1">
                  <strong>Questions correct:</strong> {questions.filter(q => checkIfCorrect(q, answers[q._id])).length} / {questions.length}
                </p>
              </Col>  
              </Row><hr />

            <Button variant="primary" onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}`)}>
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
              {questions.map((q: any, index: number) => {
                const isAnswered = answers[q._id] !== undefined;
                const isCorrect = submitted && checkIfCorrect(q, answers[q._id]);
                return (
                  <ListGroup.Item
                    key={q._id}
                    action
                    active={currentQuestionIndex === index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>Question {index + 1}</span>
                    <span>
                      {submitted ? (
                        isAnswered ? (
                          isCorrect ? (
                            <FaCheckCircle className="text-success" />
                          ) : (
                            <FaTimesCircle className="text-danger" />
                          )
                        ) : (
                          <span className="text-muted">—</span>
                        )
                      ) : (
                        isAnswered && <FaCheckCircle className="text-primary" />
                      )}
                    </span>

                  </ListGroup.Item>

                );
              })}
                </ListGroup>
            
            {/* Progress summary */}
            {!submitted && (
              <div className="mt-3 text-center text-muted">
                <small>
                  {Object.keys(answers).length} / {questions.length} answered
                </small>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}