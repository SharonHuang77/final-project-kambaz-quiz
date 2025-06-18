import { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

// Define the Question interface (or import from shared types)
interface Question {
  _id: string;
  title: string;
  type: 'multiple-choice' | 'true-false' | 'fill-in-blank';
  points: number;
  question: string;
  quiz: string;
  choices?: string[];
  correctAnswer?: number | boolean;
  possibleAnswers?: string[];
  caseSensitive?: boolean;
  isNew?: boolean;
  isEditing?: boolean;
}

interface TrueFalseEditorProps {
  question: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function TrueFalseEditor({ 
  question, 
  onSave, 
  onCancel, 
  onDelete 
}: TrueFalseEditorProps) {
  const [formData, setFormData] = useState({
    title: question.title || 'New Question',
    type: 'true-false' as const,
    points: question.points || 1,
    question: question.question || '',
    correctAnswer: (typeof question.correctAnswer === 'boolean' ? question.correctAnswer : true)
  });

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    const questionData: Question = {
      ...question,
      ...formData
    };
    onSave(questionData);
  };

  const handleTypeChange = (newType: string) => {
    let updatedQuestion: Question;
  
    if (newType === 'multiple-choice') {
      updatedQuestion = {
        ...question,
        title: formData.title,
        type: 'multiple-choice',
        points: formData.points,
        question: formData.question,
        choices: ['', '', '', ''],
        correctAnswer: 0
      };
    } else if (newType === 'true-false') {
      updatedQuestion = {
        ...question,
        title: formData.title,
        type: 'true-false',
        points: formData.points,
        question: formData.question,
        correctAnswer: true
      };
    } else {
      updatedQuestion = {
        ...question,
        title: formData.title,
        type: 'fill-in-blank',
        points: formData.points,
        question: formData.question,
        possibleAnswers: [''],
        caseSensitive: false
      };
    }
  
    onSave(updatedQuestion); // Save with updated type
  };

  return (
    <div className="border rounded p-4 mb-4 bg-white">
      <Form>
        {/* Question Type and Points */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Question Type:</Form.Label>
            <Form.Select
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True/False</option>
              <option value="fill-in-blank">Fill in the Blank</option>
            </Form.Select>
          </Col>
          <Col md={6}>
            <Form.Label>Points:</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={formData.points}
              onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 0)}
            />
          </Col>
        </Row>

        {/* Question Title */}
        <Form.Group className="mb-3">
          <Form.Label>Question Title:</Form.Label>
          <Form.Control
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter question title"
          />
        </Form.Group>

        {/* Question Text */}
        <Form.Group className="mb-3">
          <Form.Label>Question:</Form.Label>
          <div className="border rounded">
            <div className="border-bottom bg-light p-2 small text-muted">
              Edit | View | Insert | Format | Tools | Table
            </div>
            <Form.Control
              as="textarea"
              rows={4}
              value={formData.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              placeholder="Enter your question text. Students will select if True or False is the correct answer."
              className="border-0"
            />
          </div>
        </Form.Group>

        {/* True/False Selection */}
        <Form.Group className="mb-3">
          <Form.Label>Correct Answer:</Form.Label>
          <div className="ms-3">
            <Form.Check
              type="radio"
              id="true-answer"
              name="correctAnswer"
              label={
                <span>
                  {formData.correctAnswer === true && <span className="text-success me-2">✓</span>}
                  True
                </span>
              }
              checked={formData.correctAnswer === true}
              onChange={() => handleInputChange('correctAnswer', true)}
            />
            
            <Form.Check
              type="radio"
              id="false-answer"
              name="correctAnswer"
              label={
                <span>
                  {formData.correctAnswer === false && <span className="text-success me-2">✓</span>}
                  False
                </span>
              }
              checked={formData.correctAnswer === false}
              onChange={() => handleInputChange('correctAnswer', false)}
            />
          </div>
        </Form.Group>

        {/* Action Buttons */}
        <hr />
        <div className="d-flex justify-content-between">
          <div>
            {!question.isNew && (
              <Button
                variant="link"
                className="text-danger p-0"
                onClick={onDelete}
              >
                Delete Question
              </Button>
            )}
          </div>
          <div>
            <Button
              variant="secondary"
              className="me-2"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleSave}
            >
              Update Question
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}