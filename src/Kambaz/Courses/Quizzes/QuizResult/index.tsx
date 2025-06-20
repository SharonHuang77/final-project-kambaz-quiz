
import { useEffect, useState } from 'react';
import { Check, X, Clock } from 'lucide-react';
import { useParams } from 'react-router-dom';
import * as quizzesResultClient from './client';
import type { QuizResultData } from "../../../types.ts";


export default function QuizResults() {
  const { qid, studentId } = useParams<{ qid: string; studentId: string }>();
  const [quizData, setQuizData] = useState<QuizResultData | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchResults = async () => {
      try {;
        const results = await quizzesResultClient.fetchQuizResults(qid!, studentId!);
        setQuizData(results);
      } catch (error) {
        setQuizData(null);
      } finally {
        setLoading(false);
      }
    };
  
    if (qid && studentId) {
      fetchResults();
    } else {
      console.warn("❗ Missing qid or studentId:", { qid, studentId });
    }
  }, [qid, studentId]);

  if (loading) return <div>Loading...</div>;
  if (!quizData) return <div>No results found.</div>;

  const canRetakeQuiz = () => {
    return quizData.multipleAttempts && quizData.attemptHistory.length < quizData.maxAttempts;
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-8">
          
          {/* Header */}
          <div className="d-flex justify-content-between">
            <div>
              <h1>{quizData.title}</h1>
              <hr></hr>
              <div className="text-muted">
                <span className="me-3"><strong>Due:</strong> {quizData.dueDate}</span>
                <span className="me-3"><strong>Points:</strong> {quizData.points}</span>
                <span className="me-3"><strong>Questions:</strong> {quizData.totalQuestions}</span>
                <span className="me-3"><strong>Available:</strong> {quizData.availablePeriod}</span>
                <span><strong>Time Limit:</strong> {quizData.timeLimit}</span>
              </div>
              <hr></hr>
            </div>
          </div>
          
          <br /><br />

          {/* Instructions */}
          <h2>Instructions</h2>
          <br />
          
          <h3>{quizData.instructions.title}</h3>
          <ul className="text-muted">
            {quizData.instructions.guidelines.map((guideline, index) => (
              <li key={index}>{guideline}</li>
            ))}
          </ul>
          
          <br />
          
          <p className="text-muted">This quiz was locked until {quizData.lockDate}.</p>
          
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
              {quizData.attemptHistory.map((attempt, index) => (
                <tr key={index} className={index === 0 ? "table-danger" : ""}>
                  <td>
                    <span className={index === 0 ? "text-danger fw-bold" : ""}>
                      Attempt {attempt.attempt}
                    </span>
                  </td>
                  <td>{attempt.timeUsed}</td>
                  <td>{attempt.score} out of {attempt.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-3">
            <p><strong>Score for this quiz:</strong> {quizData.currentAttempt.score} out of {quizData.currentAttempt.totalPoints}</p>
            <p>Submitted {quizData.currentAttempt.submittedDate}</p>
            <p>This attempt took {quizData.currentAttempt.timeUsed}.</p>
          </div>
          
          <br /><br />

          {canRetakeQuiz() && (
              <button className="btn btn-primary d-block mx-auto">Take Quiz Again</button>
            )}

          <br /><br />

          {/* Questions */}
          {quizData.questions.map((question) => (
            <div key={question.id}>
              <div className="border border-secondary">
                {/* Question Header */}
                <div className="bg-secondary text-black p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Question {question.title}</h3>
                    <div className="d-flex align-items-center">
                      <span className="me-3">{question.earnedPoints} / {question.maxPoints} pts</span>
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
                  <p>{question.question}</p>
                  
                  {question.explanation && (
                    <p className="text-muted fst-italic">{question.explanation}</p>
                  )}
                  
                  <br />
                  {/* Answer Display - Fixed Version */}
                  {question.type === 'multiple-choice' && question.options && (
                    <div>
                      {question.options.map((option, index) => {
                        const isStudentAnswer = option === question.studentAnswer;
                        const isCorrectAnswer = option === question.correctAnswer;
                        const isWrongSelection = isStudentAnswer && !question.isCorrect;
                        
                        return (
                          <div key={index} className={`p-2 mb-2 ${
                            isCorrectAnswer
                              ? 'bg-success bg-opacity-25 border-start border-success border-4'
                              : isWrongSelection
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
                                {isCorrectAnswer && (
                                  <>
                                    <span className="badge bg-success me-2">Correct Answer</span>
                                    <Check size={16} className="text-success" />
                                  </>
                                )}
                                {isWrongSelection && (
                                  <X size={16} className="text-danger" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {question.type === 'true-false' && (
                    <div>
                      {['True', 'False'].map((option) => {
                        const isStudentAnswer = option === question.studentAnswer;
                        const isCorrectAnswer = option === question.correctAnswer;
                        const isWrongSelection = isStudentAnswer && !question.isCorrect;
                        
                        return (
                          <div key={option} className={`p-2 mb-2 ${
                            isCorrectAnswer
                              ? 'bg-success bg-opacity-25 border-start border-success border-4'
                              : isWrongSelection
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
                                {isCorrectAnswer && (
                                  <>
                                    <span className="badge bg-success me-2">Correct Answer</span>
                                    <Check size={16} className="text-success" />
                                  </>
                                )}
                                {isWrongSelection && (
                                  <X size={16} className="text-danger" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

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
                      
                      {!question.isCorrect && question.possibleAnswers && Array.isArray(question.possibleAnswers) && (
                        <div>
                          <p><strong>Accepted Answers:</strong></p>
                          <div className="p-2 mb-2 bg-success bg-opacity-25 border-start border-success border-4">
                            <div className="d-flex justify-content-between align-items-center">
                              <span>{question.possibleAnswers.join(', ')}</span>
                              <div className="d-flex align-items-center">
                                <span className="badge bg-success me-2">Accepted Answers</span>
                                <Check size={16} className="text-success" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Show possible answers even when correct, for reference */}
                      {question.isCorrect && question.possibleAnswers && Array.isArray(question.possibleAnswers) && question.possibleAnswers.length > 1 && (
                        <div className="mt-2">
                          <p className="text-muted"><small><strong>Other accepted answers:</strong> {question.possibleAnswers.filter(ans => ans !== question.studentAnswer).join(', ')}</small></p>
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
            <button className="btn btn-outline-secondary">← Previous</button>
            <h4>Quiz Score: {quizData.currentAttempt.score} out of {quizData.currentAttempt.totalPoints}</h4>
            <button className="btn btn-outline-secondary">Next →</button>
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
                  <p className="mb-0 text-muted">{quizData.currentAttempt.timeUsed}</p>
                </div>
              </div>
              
              <br />

              <div className="d-flex align-items-center mb-2">
                <div className="bg-primary" style={{width: '16px', height: '16px', marginRight: '8px'}}></div>
                <div>
                  <p className="mb-0"><strong>Current Score:</strong></p>
                  <p className="mb-0 text-muted">{quizData.currentAttempt.score} out of {quizData.currentAttempt.totalPoints}</p>
                </div>
              </div>
              
              <br />

              <div className="d-flex align-items-center mb-2">
                <div className="bg-success" style={{width: '16px', height: '16px', marginRight: '8px'}}></div>
                <div>
                  <p className="mb-0"><strong>Kept Score:</strong></p>
                  <p className="mb-0 text-muted">{quizData.currentAttempt.score} out of {quizData.currentAttempt.totalPoints}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}