import { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Editor } from "@tinymce/tinymce-react";

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
  onTypeChange: (id: string, newType: Question['type']) => void;
}

export default function TrueFalseEditor({ 
  question, 
  onSave, 
  onCancel, 
  onDelete,
  onTypeChange
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


  return (
    <div className="border rounded p-4 mb-4 bg-white">
      <Form>
        {/* Question Type and Points */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Question Type:</Form.Label>
            <Form.Select
              value={formData.type}
              onChange={(e) => onTypeChange(question._id, e.target.value as Question['type'])}
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
          <Editor
            apiKey="h5nnm855oz66hvwc983n6tv3w57uz92gvz2yietxaj4c0wxy"
            value={formData.question}
            init={{
              height: 300,
              menubar: true,
              plugins: [
                'advlist autolink lists link image charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table paste code help wordcount'
              ],
              toolbar:
                'undo redo | formatselect | ' +
                'bold italic underline forecolor backcolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
              statusbar: true
            }}
            onEditorChange={(content) => handleInputChange('question', content)}
          />
        </Form.Group>

        {/* True/False Selection */}
        <Form.Group className="mb-3">
          <Form.Label>Correct Answer:</Form.Label>
          <div className="ms-3">
            <div className="d-flex align-items-center mb-2">
              <Form.Check
                type="radio"
                id="true-answer"
                name="correctAnswer"
                label="True"
                checked={formData.correctAnswer === true}
                onChange={() => handleInputChange('correctAnswer', true)}
                className="me-3"
              />
              {formData.correctAnswer === true && (
                <span className="text-success fw-bold">✓ Correct Answer</span>
              )}
            </div>
            
            <div className="d-flex align-items-center">
              <Form.Check
                type="radio"
                id="false-answer"
                name="correctAnswer"
                label="False"
                checked={formData.correctAnswer === false}
                onChange={() => handleInputChange('correctAnswer', false)}
                className="me-3"
              />
              {formData.correctAnswer === false && (
                <span className="text-success fw-bold">✓ Correct Answer</span>
              )}
            </div>
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