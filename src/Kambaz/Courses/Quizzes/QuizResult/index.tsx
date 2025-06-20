
import React, { useState } from 'react';
import { Check, X, Clock } from 'lucide-react';

export default function QuizResults() {
  const [quizData] = useState({
    title: "Q1",
    dueDate: "May 19 at 11:59pm",
    points: 29,
    totalQuestions: 11,
    availablePeriod: "May 13 at 12am - May 19 at 11:59pm",
    timeLimit: "20 Minutes",
    multipleAttempts: true,
    maxAttempts: 3,
    instructions: {
      title: "Asynchronous Courses",
      guidelines: [
        "Exams will be accessible for a one-week period.",
        "Exams must be submitted within one week of their release.",
        "Correct answers will be provided one day after the submission deadline."
      ],
      halfSemesterTerms: "Given the accelerated pace of half-semester courses like Summer 1 and Summer 2"
    },
    lockDate: "May 19 at 11:59pm",
    currentAttempt: {
      attemptNumber: 1,
      score: 26,
      totalPoints: 29,
      timeUsed: "3 minutes",
      submittedDate: "May 14 at 4:11pm",
      status: "completed"
    },
    attemptHistory: [
      {
        attempt: 1,
        score: 26,
        totalPoints: 29,
        timeUsed: "3 minutes",
        date: "May 14 at 4:11pm"
      }
    ],
    questions: [
      {
        id: 1,
        points: 1,
        question: "An HTML label element can be associated with an HTML input element by setting their id attributes to the same value.",
        explanation: "The resulting effect is that when you click on the label text, the input element receives focus as if you had click on the input element itself",
        studentAnswer: "True",
        correctAnswer: "True",
        isCorrect: true,
        type: "true-false"
      },
      {
        id: 2, 
        points: 2,
        question: "Which of the following CSS properties is used to control the spacing between characters in text?",
        options: ["letter-spacing", "word-spacing", "line-height", "text-indent"],
        studentAnswer: "word-spacing",
        correctAnswer: "letter-spacing",
        isCorrect: false,
        type: "multiple-choice"
      },
      {
        id: 3,
        points: 3,
        question: "What does HTML stand for?",
        studentAnswer: "HyperText Markup Language",
        correctAnswer: "HyperText Markup Language",
        isCorrect: true,
        type: "short-answer"
      },
      {
        id: 4,
        points: 1,
        question: "CSS stands for Cascading Style Sheets.",
        studentAnswer: "False",
        correctAnswer: "True",
        isCorrect: false,
        type: "true-false"
      }
    ]
  });

  const getScorePercentage = () => {
    return Math.round((quizData.currentAttempt.score / quizData.currentAttempt.totalPoints) * 100);
  };

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
          <p className="text-muted">For asynchronous courses, please note the following guidelines:</p>
          <ul className="text-muted">
            {quizData.instructions.guidelines.map((guideline, index) => (
              <li key={index}>{guideline}</li>
            ))}
          </ul>
          
          <br />
          
          <h3>Half Semester Terms</h3>
          <p className="text-muted">{quizData.instructions.halfSemesterTerms}</p>
          
          <br />
          
          <p className="text-muted">This quiz was locked {quizData.lockDate}.</p>
          
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
                    <h3 className="mb-0">Question {question.id}</h3>
                    <div className="d-flex align-items-center">
                      <span className="me-3">{question.points} / {question.points} pts</span>
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

                  {/* Answer Display */}
                  {question.type === 'multiple-choice' && question.options && (
                    <div>
                      {question.options.map((option, index) => (
                        <div key={index} className={`p-2 mb-2 ${
                          option === question.correctAnswer
                            ? 'bg-success bg-opacity-25 border-start border-success border-4'
                            : option === question.studentAnswer && !question.isCorrect
                            ? 'bg-danger bg-opacity-25 border-start border-danger border-4'
                            : 'bg-light border-start border-secondary border-4'
                        }`}>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <input 
                                type="radio" 
                                name={`question-${question.id}`}
                                checked={option === question.studentAnswer}
                                disabled
                                className="me-2"
                              />
                              <span>{option}</span>
                            </div>
                            <div className="d-flex align-items-center">
                              {option === question.studentAnswer && (
                                <span className="badge bg-secondary me-2">Your Answer</span>
                              )}
                              {option === question.correctAnswer && (
                                <>
                                  <span className="badge bg-success me-2">Correct Answer</span>
                                  <Check size={16} className="text-success" />
                                </>
                              )}
                              {option === question.studentAnswer && !question.isCorrect && (
                                <X size={16} className="text-danger" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'true-false' && (
                    <div>
                      <div className={`p-2 mb-2 ${
                        question.correctAnswer === 'True'
                          ? 'bg-success bg-opacity-25 border-start border-success border-4'
                          : question.studentAnswer === 'True' && !question.isCorrect
                          ? 'bg-danger bg-opacity-25 border-start border-danger border-4'
                          : 'bg-light border-start border-secondary border-4'
                      }`}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <input 
                              type="radio" 
                              name={`question-${question.id}`}
                              checked={question.studentAnswer === 'True'}
                              disabled
                              className="me-2"
                            />
                            <span>True</span>
                          </div>
                          <div className="d-flex align-items-center">
                            {question.studentAnswer === 'True' && (
                              <span className="badge bg-secondary me-2">Your Answer</span>
                            )}
                            {question.correctAnswer === 'True' && (
                              <>
                                <span className="badge bg-success me-2">Correct Answer</span>
                                <Check size={16} className="text-success" />
                              </>
                            )}
                            {question.studentAnswer === 'True' && !question.isCorrect && (
                              <X size={16} className="text-danger" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-2 mb-2 ${
                        question.correctAnswer === 'False'
                          ? 'bg-success bg-opacity-25 border-start border-success border-4'
                          : question.studentAnswer === 'False' && !question.isCorrect
                          ? 'bg-danger bg-opacity-25 border-start border-danger border-4'
                          : 'bg-light border-start border-secondary border-4'
                      }`}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <input 
                              type="radio" 
                              name={`question-${question.id}`}
                              checked={question.studentAnswer === 'False'}
                              disabled
                              className="me-2"
                            />
                            <span>False</span>
                          </div>
                          <div className="d-flex align-items-center">
                            {question.studentAnswer === 'False' && (
                              <span className="badge bg-secondary me-2">Your Answer</span>
                            )}
                            {question.correctAnswer === 'False' && (
                              <>
                                <span className="badge bg-success me-2">Correct Answer</span>
                                <Check size={16} className="text-success" />
                              </>
                            )}
                            {question.studentAnswer === 'False' && !question.isCorrect && (
                              <X size={16} className="text-danger" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {question.type === 'short-answer' && (
                    <div>
                      <p><strong>Your Answer:</strong></p>
                      <div className={`p-2 mb-2 ${
                        question.isCorrect
                          ? 'bg-success bg-opacity-25 border-start border-success border-4'
                          : 'bg-danger bg-opacity-25 border-start border-danger border-4'
                      }`}>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{question.studentAnswer}</span>
                          {question.isCorrect ? (
                            <Check size={16} className="text-success" />
                          ) : (
                            <X size={16} className="text-danger" />
                          )}
                        </div>
                      </div>
                      
                      {!question.isCorrect && (
                        <div>
                          <p><strong>Correct Answer:</strong></p>
                          <div className="p-2 mb-2 bg-success bg-opacity-25 border-start border-success border-4">
                            <div className="d-flex justify-content-between align-items-center">
                              <span>{question.correctAnswer}</span>
                              <Check size={16} className="text-success" />
                            </div>
                          </div>
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