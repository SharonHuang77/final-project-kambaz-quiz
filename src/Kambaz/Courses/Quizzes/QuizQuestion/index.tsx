import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Row, Col, Nav } from 'react-bootstrap';
import { FaBan, FaCheckCircle } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import MultipleChoiceEditor from './MultipleChoiceEditor';
import TrueFalseEditor from './TrueFalseEditor';
import FillInTheBlankEditor from './FillInTheBlankEditor';
import * as questionsClient from './client';
import * as quizDetailClient from '../QuizDetail/client';
import { setQuestions, addQuestion, deleteQuestion } from './reducer';
import type { Question } from './reducer';
import type { Quiz } from "../../../types.ts";

export default function QuizQuestionsEditor() {
  const { cid, qid } = useParams<{ cid: string; qid: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { questions } = useSelector((state: any) => state.questionReducer);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const isFaculty = currentUser?.role === "FACULTY";

  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState<number>(0);

  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (qid) {
      loadQuestions();
      loadQuiz();
    }
  }, [qid]);

  useEffect(() => {
    const total = questions?.reduce((sum: number, q: Question) => sum + (q.points || 0), 0) || 0;
    setTotalPoints(total);
  }, [questions]);

  const loadQuiz = async () => {
    if (!qid) return;
    try {
      const quizData = await quizDetailClient.findQuizById(qid);
      setQuiz(quizData);
    } catch (error) {
      console.error("Error loading quiz:", error);
    }
  };

  const loadQuestions = async () => {
    if (!qid) return;
    try {
      const questionsData = await questionsClient.getQuestions(qid);
      const validQuestions = (questionsData || []).map((q: Question) => ({
        ...q,
        isEditing: false
      }));
      dispatch(setQuestions(validQuestions));
      setEditingQuestion(null);
    } catch (error) {
      console.error('Error loading questions:', error);
      dispatch(setQuestions([]));
    }
  };

  const createAndEditQuestion = () => {
    if (!isFaculty || !qid) return;
  
    const tempId = `temp-${Date.now()}`;
    const tempQuestion: Question = {
      _id: tempId,
      title: "New Question",
      type: "multiple-choice",
      question: "New question text",
      points: 1,
      quiz: qid,
      choices: ['', '', '', ''],
      correctAnswer: 0,
      isEditing: true
    };
  
    dispatch(addQuestion(tempQuestion));
    setEditingQuestion(tempId);
  };

  const handleEditQuestion = (questionId: string) => {
    if (!isFaculty || editingQuestion !== null || !questionId) return;
    setEditingQuestion(questionId);
    const updatedQuestions = questions?.map((q: Question) => ({
      ...q,
      isEditing: q._id === questionId
    })) || [];
    dispatch(setQuestions(updatedQuestions));
  };

  const handleSaveQuestion = async (questionData: Question) => {
    console.log('🚀 handleSaveQuestion called with:', questionData);
    if (!qid || !questionData._id) return;
  
    try {
      const { isEditing, _id, ...toSave } = questionData;

          // Only log for fill-in-blank questions
          if (toSave.type === "fill-in-blank") {
            console.log('=== Fill-in-Blank Debug ===');
            console.log('Question:', toSave.question);
            console.log('Type:', toSave.type);
            console.log('Correct Answer:', toSave.correctAnswer);
            console.log('Correct Answer Type:', typeof toSave.correctAnswer);
            console.log('Is Empty?', !toSave.correctAnswer);
            console.log('========================');
          }
  
      let updated;
      if (_id.startsWith("temp-")) {
        // It's a new question → create
        updated = await questionsClient.createQuestion(qid, toSave);
        
      } else {
        // It's an existing question → update
        updated = await questionsClient.updateQuestion(_id, toSave);
      }
  
      const updatedQuestions = questions.map((q: Question) =>
        q._id === questionData._id ? { ...updated, isEditing: false } : q
      );
      dispatch(setQuestions(updatedQuestions));
      setEditingQuestion(null);
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const handleCancelEdit = (questionId: string) => {
    const isTemp = questionId.startsWith("temp-");
    if (isTemp) {
      const updatedQuestions = questions.filter((q: Question) => q._id !== questionId);
      dispatch(setQuestions(updatedQuestions));
    } else {
      const updatedQuestions = questions.map((q: Question) =>
        q._id === questionId ? { ...q, isEditing: false } : q
      );
      dispatch(setQuestions(updatedQuestions));
    }
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!isFaculty || !questionId) return;
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await questionsClient.deleteQuestion(questionId);
        dispatch(deleteQuestion(questionId));
        if (editingQuestion === questionId) setEditingQuestion(null);
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const handleTypeChange = (questionId: string, newType: Question['type']) => {
    const updatedQuestions = questions.map((q: Question) => {
      if (q._id !== questionId) return q;

      const updated: Question = { ...q, type: newType };

      if (newType === 'multiple-choice') {
        updated.choices = ['', '', '', ''];
        updated.correctAnswer = 0;
      } else if (newType === 'true-false') {
        updated.correctAnswer = true;
        delete updated.choices;
      } else if (newType === 'fill-in-blank') {
        updated.possibleAnswers = [''];
        updated.caseSensitive = false;
        delete updated.choices;
      }

      return updated;
    });

    dispatch(setQuestions(updatedQuestions));
  };

  const renderQuestionEditor = (question: Question) => {
    if (!question || !question._id) return null;
    const commonProps = {
      question,
      onSave: handleSaveQuestion,
      onCancel: () => handleCancelEdit(question._id),
      onDelete: () => handleDeleteQuestion(question._id),
      onTypeChange: handleTypeChange
    };
    switch (question.type) {
      case 'true-false': return <TrueFalseEditor key={`editor-${question._id}`} {...commonProps} />;
      case 'fill-in-blank': return <FillInTheBlankEditor key={`editor-${question._id}`} {...commonProps} />;
      default: return <MultipleChoiceEditor key={`editor-${question._id}`} {...commonProps} />;
    }
  };

  const renderQuestionPreview = (question: Question) => {
    if (!question || !question._id) return null;
    return (
      <div key={`preview-${question._id}`} className="border rounded p-3 mb-3 bg-white">
        <Row className="align-items-start">
          <Col xs={10}>
            <h5 className="mb-1">{question.title}</h5>
            <p className="text-muted small mb-1">
              {question.type === 'multiple-choice' && 'Multiple Choice'} 
              {question.type === 'true-false' && 'True/False'}
              {question.type === 'fill-in-blank' && 'Fill in the Blank'}
            </p>
            <div className="mt-2" dangerouslySetInnerHTML={{ __html: question.question }} />
          </Col>
          <Col xs={2} className="text-end">
            <div className="mb-2">
              <small className="text-muted">{question.points} pts</small>
            </div>
            {isFaculty && (
              <div className="d-flex flex-column gap-1">
                <Button size="sm" variant="outline-primary" onClick={() => handleEditQuestion(question._id)} disabled={editingQuestion !== null}>Edit</Button>
                <Button size="sm" variant="outline-danger" onClick={() => handleDeleteQuestion(question._id)} disabled={editingQuestion !== null}>Delete</Button>
              </div>
            )}
          </Col>
        </Row>
      </div>
    );
  };

  if (!cid || !qid) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger">
          Missing required parameters. Cannot load quiz questions.
        </div>
      </div>
    );
  }

  const validQuestions = questions?.filter((q: Question) => q && q._id) || [];

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Edit Quiz {quiz?.title} </h3>
        <div className="d-flex align-items-center">
          <span className="me-3">Points {totalPoints || 0}</span>
          <div
            className="d-flex align-items-center me-3"
            style={{
              opacity: 0.5,
              transition: "opacity 0.3s ease",
            }}
          >
          <div
            className="d-flex align-items-center me-3"
            style={{ 
              opacity: quiz?.published ? 1 : 0.5,
              transition: 'opacity 0.3s ease'
            }}
          >
            {quiz?.published ? (
              <>
                <FaCheckCircle className="me-2 text-success" />
                <span className="text-success">Published</span>
              </>
            ) : (
              <>
                <FaBan className="me-2 text-danger" />
                <span className="text-danger">Not Published</span>
              </>
            )}
          </div>

          </div>
          <BsThreeDotsVertical />
          <Button variant="link" className="p-0">
            <i className="bi bi-three-dots-vertical"></i>
          </Button>
        </div>
      </div>

      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link
            active={false}
            onClick={() => {
              if (qid && cid) {
                navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/Editor`);
              }
            }}
          >
            Details
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={true}>
            Questions
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <Row>
        <Col>
          {validQuestions.length === 0 && (
            <div className="text-center py-5 text-muted">
              <p>No questions yet. Click "New Question" to add your first question.</p>
            </div>
          )}
          {validQuestions.map((question: Question) =>
            question.isEditing ? renderQuestionEditor(question) : renderQuestionPreview(question)
          )}
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          {isFaculty && (
            <Button
              onClick={createAndEditQuestion}
              disabled={editingQuestion !== null}
              variant="secondary"
              className="me-2"
            >
              + New Question
            </Button>
          )}
        </Col>
        <Col xs="auto">
          <Button
            onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}
            variant="outline-secondary"
            className="me-2"
          >
            Cancel
          </Button>
          {isFaculty && (
            <Button
              onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}`)}
              variant="danger"
            >
              Save
            </Button>
          )}
        </Col>
      </Row>
    </div>
  );
}



// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { Button, Row, Col, Nav } from 'react-bootstrap';
// import MultipleChoiceEditor from './MultipleChoiceEditor';
// import TrueFalseEditor from './TrueFalseEditor';
// import FillInTheBlankEditor from './FillInTheBlankEditor';
// import * as questionsClient from './client';
// import { setQuestions, addQuestion, deleteQuestion } from './reducer';
// import type { Question } from './reducer';

// // Define Quiz interface
// interface Quiz {
//   _id: string;
//   title: string;
//   description?: string;
//   course: string;
//   published: boolean;
//   // Add other quiz properties as needed
// }

// export default function QuizQuestionsEditor() {
//   const { cid, qid } = useParams<{ cid: string; qid: string }>();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const { questions } = useSelector((state: any) => state.questionReducer);
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
  
//   const isFaculty = currentUser?.role === "FACULTY";
  
//   const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
//   const [totalPoints, setTotalPoints] = useState<number>(0);
//   const [quiz, setQuiz] = useState<Quiz | null>(null);

//   useEffect(() => {
//     if (qid) {
//       loadQuestions();
//       loadQuiz();
//     }
//   }, [qid]);

//   useEffect(() => {
//     // Calculate total points whenever questions change
//     const total = questions?.reduce((sum: number, q: Question) => sum + (q.points || 0), 0) || 0;
//     setTotalPoints(total);
//   }, [questions]);

//   const loadQuiz = async () => {
//     if (!qid) return;
    
//     try {
//       const quizData = await questionsClient.getQuiz(qid);
//       setQuiz(quizData);
//     } catch (error) {
//       console.error('Error loading quiz:', error);
//     }
//   };

//   const loadQuestions = async () => {
//     if (!qid) return;
    
//     try {
//       const questionsData = await questionsClient.getQuestions(qid);
      
//       console.log('Raw questions data from server:', questionsData); // Debug log
      
//       if (questionsData && questionsData.length > 0) {
//         console.log('First question structure:', questionsData[0]); // See the structure
//         console.log('All keys in first question:', Object.keys(questionsData[0])); // See all field names
//       }
      
//       // More flexible validation and initialization
//       const validQuestions = questionsData
//         .filter((q: any) => q) // Just check if question exists
//         .map((q: any, index: number) => {
//           // Try to find the real ID field - check multiple possible field names
//           const questionId = q._id || q.id || q.questionId || q.question_id || `fallback_${index}_${Date.now()}`;
          
//           console.log(`Question ${index}:`);
//           console.log('  - Original ID field (_id):', q._id);
//           console.log('  - Alternative ID field (id):', q.id);
//           console.log('  - Alternative ID field (questionId):', q.questionId);
//           console.log('  - Alternative ID field (question_id):', q.question_id);
//           console.log('  - Using ID:', questionId);
//           console.log('  - Full object:', q);
          
//           return {
//             ...q,
//             _id: questionId,
//             isEditing: false,
//             isNew: false
//           };
//         });
      
//       console.log('Processed questions:', validQuestions); // Debug log
      
//       dispatch(setQuestions(validQuestions));
//       setEditingQuestion(null);
//     } catch (error) {
//       console.error('Error loading questions:', error);
//       // Initialize with empty array if loading fails
//       dispatch(setQuestions([]));
//     }
//   };

//   const handleNewQuestion = () => {
//     if (!isFaculty || !qid || editingQuestion !== null) return;
    
//     const newQuestionId = `temp_${Date.now()}_${Math.random()}`;
//     const newQuestion: Question = {
//       _id: newQuestionId,
//       title: 'New Question',
//       type: 'multiple-choice',
//       points: 1,
//       question: '',
//       quiz: qid,
//       choices: ['', '', '', ''],
//       correctAnswer: 0,
//       possibleAnswers: [''],
//       caseSensitive: false,
//       isNew: true,
//       isEditing: true
//     };
    
//     dispatch(addQuestion(newQuestion));
//     setEditingQuestion(newQuestionId);
//   };

//   const handleEditQuestion = (questionId: string) => {
//     if (!isFaculty || editingQuestion !== null || !questionId) return;
    
//     setEditingQuestion(questionId);
    
//     // Close all other editing questions and open this one
//     const updatedQuestions = questions?.map((q: Question) => ({
//       ...q,
//       isEditing: q._id === questionId
//     })) || [];
    
//     dispatch(setQuestions(updatedQuestions));
//   };

//   const handleSaveQuestion = async (questionData: Question) => {
//     if (!qid || !questionData._id) {
//       console.error('Missing quiz ID or question ID');
//       return;
//     }
    
//     try {
//       let savedQuestion: Question;
      
//       if (questionData.isNew) {
//         // Remove client-side only properties before saving
//         const { isNew, isEditing, ...questionToSave } = questionData;
//         savedQuestion = await questionsClient.createQuestion(qid, questionToSave) as Question;
        
//         // Replace the temporary question with the saved one
//         const updatedQuestions = questions?.map((q: Question) => 
//           q._id === questionData._id 
//             ? { ...savedQuestion, isEditing: false, isNew: false }
//             : q
//         ) || [];
//         dispatch(setQuestions(updatedQuestions));
//       } else {
//         // Remove client-side only properties before saving
//         const { isNew, isEditing, ...questionToSave } = questionData;
//         console.log("Question sent to server:", questionToSave);
//         savedQuestion = await questionsClient.updateQuestion(questionData._id, questionToSave) as Question;
        
//         // Update the existing question
//         const updatedQuestions = questions?.map((q: Question) => 
//           q._id === questionData._id 
//             ? { ...savedQuestion, isEditing: false, isNew: false }
//             : q
//         ) || [];
//         dispatch(setQuestions(updatedQuestions));
//       }
      
//       setEditingQuestion(null);
//     } catch (error) {
//       console.error('Error saving question:', error);
//     }
//   };

//   const handleCancelEdit = (questionId: string) => {
//     if (!questionId) return;
    
//     const question = questions?.find((q: Question) => q._id === questionId);
    
//     if (question?.isNew) {
//       // Remove new question if cancelled
//       dispatch(deleteQuestion(questionId));
//     } else {
//       // Just exit edit mode for existing questions
//       const updatedQuestions = questions?.map((q: Question) => 
//         q._id === questionId ? { ...q, isEditing: false } : q
//       ) || [];
//       dispatch(setQuestions(updatedQuestions));
//     }
    
//     setEditingQuestion(null);
//   };

//   const handleDeleteQuestion = async (questionId: string) => {
//     if (!isFaculty || !questionId) return;
    
//     if (window.confirm('Are you sure you want to delete this question?')) {
//       try {
//         // Only call API if it's not a new question
//         const question = questions?.find((q: Question) => q._id === questionId);
//         if (!question?.isNew) {
//           await questionsClient.deleteQuestion(questionId);
//         }
        
//         dispatch(deleteQuestion(questionId));
        
//         // If we were editing this question, clear the editing state
//         if (editingQuestion === questionId) {
//           setEditingQuestion(null);
//         }
//       } catch (error) {
//         console.error('Error deleting question:', error);
//       }
//     }
//   };

//   const renderQuestionEditor = (question: Question) => {
//     if (!question || !question._id) {
//       console.error('Invalid question data:', question);
//       return null;
//     }

//     const commonProps = {
//       question,
//       onSave: handleSaveQuestion,
//       onCancel: () => handleCancelEdit(question._id),
//       onDelete: () => handleDeleteQuestion(question._id)
//     };

//     switch (question.type) {
//       case 'true-false':
//         return <TrueFalseEditor key={`editor-${question._id}`} {...commonProps} />;
//       case 'fill-in-blank':
//         return <FillInTheBlankEditor key={`editor-${question._id}`} {...commonProps} />;
//       default:
//         return <MultipleChoiceEditor key={`editor-${question._id}`} {...commonProps} />;
//     }
//   };

//   const renderQuestionPreview = (question: Question) => {
//     if (!question || !question._id) {
//       console.error('Invalid question data:', question);
//       return null;
//     }

//     return (
//       <div key={`preview-${question._id}`} className="border rounded p-3 mb-3 bg-white">
//         <Row className="align-items-start">
//           <Col xs={10}>
//             <h5 className="mb-1">{question.title}</h5>
//             <p className="text-muted small mb-1">
//               {question.type === 'multiple-choice' && 'Multiple Choice'} 
//               {question.type === 'true-false' && 'True/False'}
//               {question.type === 'fill-in-blank' && 'Fill in the Blank'}
//             </p>
//             <div className="mt-2" dangerouslySetInnerHTML={{ __html: question.question }} />
//           </Col>
//           <Col xs={2} className="text-end">
//             <div className="mb-2">
//               <small className="text-muted">{question.points} pts</small>
//             </div>
//             {isFaculty && (
//               <div className="d-flex flex-column gap-1">
//                 <Button
//                   size="sm"
//                   variant="outline-primary"
//                   onClick={() => handleEditQuestion(question._id)}
//                   disabled={editingQuestion !== null}
//                 >
//                   Edit
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="outline-danger"
//                   onClick={() => handleDeleteQuestion(question._id)}
//                   disabled={editingQuestion !== null}
//                 >
//                   Delete
//                 </Button>
//               </div>
//             )}
//           </Col>
//         </Row>
//       </div>
//     );
//   };

//   // Early return if required params are missing
//   if (!cid || !qid) {
//     return (
//       <div className="container-fluid">
//         <div className="alert alert-danger">
//           Missing required parameters. Cannot load quiz questions.
//         </div>
//       </div>
//     );
//   }

//   // Filter out invalid questions and ensure unique keys
//   const validQuestions = questions?.filter((q: Question) => q && q._id) || [];

//   return (
//     <div className="container-fluid">
//       {/* Header */}
//       <Row className="mb-4">
//         <Col>
//           <h2>{quiz?.title || 'Quiz Questions'}</h2>
//           <Nav variant="tabs" className="mt-3">
//             <Nav.Item>
//               <Nav.Link 
//                 onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}`)}
//                 className="text-primary"
//               >
//                 Details
//               </Nav.Link>
//             </Nav.Item>
//             <Nav.Item>
//               <Nav.Link active>Questions</Nav.Link>
//             </Nav.Item>
//           </Nav>
//         </Col>
//         <Col xs="auto" className="text-end">
//           <div className="h5 mb-0">Points: {totalPoints}</div>
//           <small className="text-muted">Not Published</small>
//         </Col>
//       </Row>

//       {/* Questions List */}
//       <Row>
//         <Col>
//           {validQuestions.length === 0 && (
//             <div className="text-center py-5 text-muted">
//               <p>No questions yet. Click "New Question" to add your first question.</p>
//             </div>
//           )}

//           {validQuestions.map((question: Question) => 
//             question.isEditing === true ? 
//               renderQuestionEditor(question) : 
//               renderQuestionPreview(question)
//           )}
//         </Col>
//       </Row>

//       {/* Action Buttons */}
//       <Row className="mt-4">
//         <Col>
//           {isFaculty && (
//             <Button
//               onClick={handleNewQuestion}
//               disabled={editingQuestion !== null}
//               variant="secondary"
//               className="me-2"
//             >
//               + New Question
//             </Button>
//           )}
//         </Col>
//         <Col xs="auto">
//           <Button
//             onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}
//             variant="outline-secondary"
//             className="me-2"
//           >
//             Cancel
//           </Button>
//           {isFaculty && (
//             <Button
//               onClick={() => {
//                 // Save quiz and navigate back
//                 navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}`);
//               }}
//               variant="danger"
//             >
//               Save
//             </Button>
//           )}
//         </Col>
//       </Row>
//     </div>
//   );
// }