import { useEffect, useState } from 'react';
import { Check, X, Clock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import * as quizzesResultClient from './client';
import { Button } from 'react-bootstrap';


const isValidQuizData = (data: any): boolean => {
  return data && 
         typeof data === 'object' && 
         typeof data.title === 'string' &&
         data.currentAttempt &&
         Array.isArray(data.attemptHistory);
};

export default function QuizResults() {
  const { cid, qid, studentId } = useParams<{ cid: string; qid: string; studentId: string }>();
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  

  useEffect(() => {
    let isMounted = true;

    const fetchResults = async () => {
      if (!qid || !studentId) {
        setLoading(false);
        return;
      }

      try {
        console.log("🔄 Frontend fetching results for:", { qid, studentId });
        
        const response = await quizzesResultClient.fetchQuizResults(qid, studentId);
        console.log("✅ Raw quiz result:", response);
        
        if (isMounted) {
          if (response && typeof response === 'object') {
            setQuizData(response);
          }
        }
      } catch (error) {
        console.error("❌ Error loading quiz result:", error);
        
        if (isMounted) {
          setQuizData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      isMounted = false;
    };
  }, [qid, studentId]);

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading quiz results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quizData || !isValidQuizData(quizData)) {
    return (
      <div className="container-fluid">
        <div className="alert alert-warning">
          <h4>No Data Available</h4>
          <p>Unable to load quiz information.</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const dueDate = quizData.dueDate ? new Date(quizData.dueDate) : null;

  const maxAttemptsReached =
    !quizData.multipleAttempts ||
    (quizData.attemptHistory?.length || 0) >= (quizData.maxAttempts || 1);

  const isPastDue = dueDate !== null && now > dueDate;

  // Show answers only if due date has passed OR all attempts are used
  const canRevealAnswers = maxAttemptsReached || isPastDue;

  // Now TypeScript knows quizData is valid
  const hasAttempts = quizData.currentAttempt && quizData.attemptHistory && quizData.attemptHistory.length > 0;
  const questions = quizData.currentAttempt?.questions || [];

  if (!hasAttempts) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <h1>{quizData.title}</h1>
            <hr />
            <div className="text-muted">
              <span className="me-3"><strong>Due:</strong> {quizData.dueDate || 'No due date'}</span>
              <span className="me-3"><strong>Points:</strong> {quizData.points || 0}</span>
              <span className="me-3"><strong>Questions:</strong> {quizData.totalQuestions || 0}</span>
              <span className="me-3"><strong>Available:</strong> {quizData.availablePeriod || 'Always available'}</span>
              <span><strong>Time Limit:</strong> {quizData.timeLimit || 'Unlimited'}</span>
            </div>
            <hr />
            
            <div className="alert alert-info mt-4">
              <h4>No Quiz Attempts Found</h4>
              <p>This student has not yet taken this quiz.</p>
              <p><strong>Student ID:</strong> {studentId}</p>
              <p><strong>Quiz ID:</strong> {qid}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canRetakeQuiz = () => {
    return quizData.multipleAttempts && 
           quizData.attemptHistory && 
           quizData.attemptHistory.length < (quizData.maxAttempts || 1);
  };

  const getHighestScore = (): { max: number; maxTotalPoints: number } => {
    if (!quizData.attemptHistory || quizData.attemptHistory.length === 0) {
      return { max: 0, maxTotalPoints: 0 };
    }
  
    let max = 0;
    let maxTotalPoints = 0;
  
    quizData.attemptHistory.forEach((attempt: any) => {
      if (attempt.score > max) {
        max = attempt.score;
        maxTotalPoints = attempt.totalPoints;
      }
    });
  
    return { max, maxTotalPoints };
  };



  return (
    <div className="container-fluid">
      {!canRevealAnswers && (
        <div className="alert alert-warning">
          <strong>Note:</strong> Correct answers are hidden until you finish all allowed attempts or after the due date passes.
        </div>
      )}
      <div className="row">
        <div className="col-8">
          
          {/* Header */}
          <div className="d-flex justify-content-between">
            <div>
              <h1>{quizData.title}</h1>
              <hr />
              <div className="text-muted">
                <span className="me-3"><strong>Due:</strong> {quizData.dueDate ? new Date(quizData.dueDate).toLocaleDateString() : 'No due date'}</span>
                <span className="me-3"><strong>Points:</strong> {quizData.points || 0}</span>
                <span className="me-3"><strong>Questions:</strong> {quizData.totalQuestions || 0}</span>
                <span className="me-3"><strong>Available:</strong> {quizData.availablePeriod || 'Always available'}</span>
                <span><strong>Time Limit:</strong> {quizData.timeLimit || 'Unlimited'}</span>
              </div>
              <hr />
            </div>
          </div>
          
          <br /><br />

          {/* Instructions */}
          <h2>Instructions</h2>
          <br />
          
          <h3>{quizData.instructions?.title || 'Instructions'}</h3>
          <ul className="text-muted">
            {(quizData.instructions?.guidelines || []).map((guideline: string, index: number) => (
              <li key={index}>{guideline}</li>
            ))}
          </ul>
          
          <br />
          
          <p className="text-muted">This quiz was locked until {quizData.lockDate || 'N/A'}.</p>
          
          <br /><br />

          {/* Attempt History */}
          <h2>Attempt History</h2>
          <br />
          
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Attempt</th>
                <th>Time</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {(quizData.attemptHistory || []).map((attempt: any, index: number) => (
                <tr key={index} className={index === 0 ? "table-danger" : ""}>
                  <td>
                    <span className={index === 0 ? "text-danger fw-bold" : ""}>
                      Attempt {attempt.attempt || index + 1}
                    </span>
                  </td>
                  <td>{attempt.timeUsed || 'N/A'}</td>
                  <td>{attempt.score || 0} out of {attempt.totalPoints || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {quizData.currentAttempt && (
            <div className="p-3">
              <p><strong>Score for this quiz:</strong> {quizData.currentAttempt.score || 0} out of {quizData.currentAttempt.totalPoints || 0}</p>
              <p>Submitted {quizData.currentAttempt.submittedDate || 'N/A'}</p>
              <p>This attempt took {quizData.currentAttempt.timeUsed || 'N/A'}.</p>
            </div>
          )}
          
          <br /><br />

          {canRetakeQuiz() ? (
            <Button
              variant="primary"
              className="d-block mx-auto"
              onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}`)}
            >
              Take Quiz Again
            </Button>
          ) : (
            <Button variant="secondary" className="d-block mx-auto" disabled>
              Exceeds Attempt Limit
            </Button>
          )}

          <br /><br />

          {/* Questions */}
          {questions.map((question: any) => (
            <div key={question.id}>
              <div className="border border-secondary">
                {/* Question Header */}
                <div className="bg-secondary text-black p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Question {question.title || 'Untitled'}</h3>
                    <div className="d-flex align-items-center">
                      <span className="me-3">{question.earnedPoints || 0} / {question.maxPoints || 0} pts</span>
                      {question.isCorrect ? (
                        <span className="badge bg-success">
                          <Check size={16} /> Correct!
                        </span>
                      ) : (
                        <span className="badge bg-danger">
                          <X size={16} /> Incorrect
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Question Content */}
                <div className="p-3">
                  <div dangerouslySetInnerHTML={{ __html: question.question || '' }} />
                  
                  {question.explanation && (
                    <p className="text-muted fst-italic">{question.explanation}</p>
                  )}
                  
                  <br />
                  
                  {/* Answer Display for Multiple Choice */}
                  {question.type === 'multiple-choice' && question.options && Array.isArray(question.options) && (
                    <div>
                      {question.options.map((option: string, index: number) => {
                        const isStudentAnswer = index === question.studentAnswer;
                        const isCorrectAnswer = canRevealAnswers && option === question.correctAnswer;
                        const isStudentCorrect = isStudentAnswer && question.isCorrect;
                        const isStudentWrong = isStudentAnswer && !question.isCorrect;
                        
                        return (
                          <div key={index} className={`p-2 mb-2 ${
                            isCorrectAnswer
                              ? 'bg-success bg-opacity-25 border-start border-success border-4'
                              : isStudentCorrect
                              ? 'bg-success bg-opacity-25 border-start border-success border-4'
                              : isStudentWrong
                              ? 'bg-danger bg-opacity-25 border-start border-danger border-4'
                              : 'bg-light border-start border-secondary border-4'
                          }`}>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <input 
                                  type="radio" 
                                  name={`question-${question.id}`}
                                  checked={isStudentAnswer}
                                  disabled
                                  className="me-2"
                                />
                                <span>{option}</span>
                              </div>
                              <div className="d-flex align-items-center">
                                {isStudentAnswer && (
                                  <span className="badge bg-secondary me-2">Your Answer</span>
                                )}
                                {canRevealAnswers && isCorrectAnswer && (
                                  <>
                                    <span className="badge bg-success me-2">Correct Answer</span>
                                    <Check size={16} className="text-success" />
                                  </>
                                )}
                                {isStudentCorrect && (
                                  <Check size={16} className="text-success" />
                                )}
                                {isStudentWrong && (
                                  <X size={16} className="text-danger" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Answer Display for True/False */}
                  {question.type === 'true-false' && (
                    <div>
                      {['True', 'False'].map((option: string) => {
                        const isStudentAnswer = option.toLowerCase() === String(question.studentAnswer).toLowerCase();
                        const isCorrectAnswer = canRevealAnswers && option.toLowerCase() === String(question.correctAnswer).toLowerCase();
                        const isStudentCorrect = isStudentAnswer && question.isCorrect;
                        const isStudentWrong = isStudentAnswer && !question.isCorrect;
                        
                        return (
                          <div key={option} className={`p-2 mb-2 ${
                            isCorrectAnswer
                              ? 'bg-success bg-opacity-25 border-start border-success border-4'
                              : isStudentCorrect
                              ? 'bg-success bg-opacity-25 border-start border-success border-4'
                              : isStudentWrong
                              ? 'bg-danger bg-opacity-25 border-start border-danger border-4'
                              : 'bg-light border-start border-secondary border-4'
                          }`}>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <input 
                                  type="radio" 
                                  name={`question-${question.id}`}
                                  checked={isStudentAnswer}
                                  disabled
                                  className="me-2"
                                />
                                <span>{option}</span>
                              </div>
                              <div className="d-flex align-items-center">
                                {isStudentAnswer && (
                                  <span className="badge bg-secondary me-2">Your Answer</span>
                                )}
                                {canRevealAnswers && isCorrectAnswer && (
                                  <>
                                    <span className="badge bg-success me-2">Correct Answer</span>
                                    <Check size={16} className="text-success" />
                                  </>
                                )}
                                {isStudentCorrect && (
                                  <Check size={16} className="text-success" />
                                )}
                                {isStudentWrong && (
                                  <X size={16} className="text-danger" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Answer Display for Fill-in-the-Blank */}
                  {question.type === 'fill-in-blank' && (
                    <div>
                      <p><strong>Your Answer:</strong></p>
                      <div className={`p-2 mb-2 ${
                        question.isCorrect
                          ? 'bg-success bg-opacity-25 border-start border-success border-4'
                          : 'bg-danger bg-opacity-25 border-start border-danger border-4'
                      }`}>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{question.studentAnswer || 'No answer provided'}</span>
                          <div className="d-flex align-items-center">
                            <span className="badge bg-secondary me-2">Your Answer</span>
                            {question.isCorrect ? (
                              <Check size={16} className="text-success" />
                            ) : (
                              <X size={16} className="text-danger" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {canRevealAnswers && !question.isCorrect && question.possibleAnswers && (
                        <div>
                          <p><strong>Accepted Answers:</strong></p>
                          <div className="p-2 mb-2 bg-success bg-opacity-25 border-start border-success border-4">
                            <div className="d-flex justify-content-between align-items-center">
                              <span>
                                {Array.isArray(question.possibleAnswers) 
                                  ? question.possibleAnswers.join(', ') 
                                  : question.possibleAnswers
                                }
                              </span>
                              <div className="d-flex align-items-center">
                                <span className="badge bg-success me-2">Accepted Answers</span>
                                <Check size={16} className="text-success" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {canRevealAnswers && question.isCorrect && question.possibleAnswers && Array.isArray(question.possibleAnswers) && question.possibleAnswers.length > 1 && (
                        <div className="mt-2">
                          <p className="text-muted">
                            <small><strong>Other accepted answers:</strong> {question.possibleAnswers.filter((ans: string) => ans !== question.studentAnswer).join(', ')}</small>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                </div>
              </div>
              <br />
            </div>
          ))}

          {/* Bottom Navigation */}
          <div className="d-flex justify-content-between align-items-center">
            <h4>Quiz Score: {quizData.currentAttempt?.score || 0} out of {quizData.currentAttempt?.totalPoints || 0}</h4>
            <Button variant="primary" onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}>
              Back to Quiz List
            </Button>
          </div>
          
          <br /><br />
        </div>

        {/* Right Section - Submission Details */}
        <div className="col-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Submission Details:</h5>
              
              <div className="d-flex align-items-center mb-2">
                <Clock size={16} className="text-muted me-2" />
                <div>
                  <p className="mb-0"><strong>Time:</strong></p>
                  <p className="mb-0 text-muted">{quizData.currentAttempt?.timeUsed || 'N/A'}</p>
                </div>
              </div>
              
              <br />

              <div className="d-flex align-items-center mb-2">
                <div className="bg-primary" style={{width: '16px', height: '16px', marginRight: '8px'}}></div>
                <div>
                  <p className="mb-0"><strong>Current Score:</strong></p>
                  <p className="mb-0 text-muted">{quizData.currentAttempt?.score || 0} out of {quizData.currentAttempt?.totalPoints || 0}</p>
                </div>
              </div>
              
              <br />

              {(() => {
                  const { max, maxTotalPoints } = getHighestScore();
                  return (
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-success" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                      <div>
                        <p className="mb-0"><strong>Kept Score:</strong></p>
                        <p className="mb-0 text-muted">{max} out of {maxTotalPoints}</p>
                      </div>
                    </div>
                  );
                })()}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}