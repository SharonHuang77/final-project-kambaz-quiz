import { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Editor } from "@tinymce/tinymce-react";

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

interface FillInTheBlankEditorProps {
  question: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
  onDelete: () => void;
  onTypeChange: (id: string, newType: Question['type']) => void;
}

export default function FillInTheBlankEditor({ 
  question, 
  onSave, 
  onCancel, 
  onDelete,
  onTypeChange
}: FillInTheBlankEditorProps) {
  const [formData, setFormData] = useState({
    title: question.title || 'New Question',
    type: 'fill-in-blank' as const,
    points: question.points || 1,
    question: question.question || '',
    possibleAnswers: question.possibleAnswers && question.possibleAnswers.length > 0
      ? question.possibleAnswers
      : [''],
    caseSensitive: question.caseSensitive ?? false
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...formData.possibleAnswers];
    newAnswers[index] = value;
    setFormData(prev => ({
      ...prev,
      possibleAnswers: newAnswers
    }));
  };

  const addAnswer = () => {
    setFormData(prev => ({
      ...prev,
      possibleAnswers: [...prev.possibleAnswers, '']
    }));
  };

  const removeAnswer = (index: number) => {
    if (formData.possibleAnswers.length > 1) {
      setFormData(prev => ({
        ...prev,
        possibleAnswers: prev.possibleAnswers.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSave = () => {
    const questionData: Question = {
      ...question,
      ...formData,
      possibleAnswers: formData.possibleAnswers.filter(answer => answer.trim() !== '')
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
        <Form.Label>Question</Form.Label>
        <Editor
          apiKey="foeb8ni7rkbpo9kctear5mi485lcceuuqws0gaqtlegm4637"
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
        <Form.Text className="text-muted">
          Students will see the question followed by a small text box to type their answer.
        </Form.Text>
      </Form.Group>

        {/* Possible Answers */}
        <Form.Group className="mb-3">
          <Form.Label>Possible Correct Answers:</Form.Label>
          {formData.possibleAnswers.map((answer, index) => (
            <Row key={index} className="mb-2 align-items-center">
              <Col xs={10}>
                <Form.Control
                  type="text"
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder={`Possible Answer ${index + 1}`}
                />
              </Col>
              <Col xs={2}>
                {formData.possibleAnswers.length > 1 && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeAnswer(index)}
                    title="Remove this answer"
                  >
                    🗑️
                  </Button>
                )}
              </Col>
            </Row>
          ))}
          
          <Button
            variant="link"
            className="text-danger p-0"
            onClick={addAnswer}
          >
            + Add Another Answer
          </Button>
          
          <Form.Text className="text-muted d-block mt-2">
            List all possible correct answers. Answers can be case insensitive.
          </Form.Text>
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