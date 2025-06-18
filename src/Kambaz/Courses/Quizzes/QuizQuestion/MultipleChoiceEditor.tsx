import { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

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

interface MultipleChoiceEditorProps {
  question: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function MultipleChoiceEditor({ 
  question, 
  onSave, 
  onCancel, 
  onDelete 
}: MultipleChoiceEditorProps) {
  const [formData, setFormData] = useState({
    title: question.title || 'New Question',
    type: 'multiple-choice' as const,
    points: question.points || 1,
    question: question.question || '',
    choices: Array.isArray(question.choices) ? question.choices : ['', '', '', ''],
    correctAnswer: typeof question.correctAnswer === 'number' ? question.correctAnswer : 0
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...formData.choices];
    newChoices[index] = value;
    setFormData(prev => ({ ...prev, choices: newChoices }));
  };

  const addChoice = () => {
    setFormData(prev => ({ ...prev, choices: [...prev.choices, ''] }));
  };

  const removeChoice = (index: number) => {
    if (formData.choices.length > 2) {
      const newChoices = formData.choices.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        choices: newChoices,
        correctAnswer: prev.correctAnswer >= index ? Math.max(0, (prev.correctAnswer as number) - 1) : prev.correctAnswer
      }));
    }
  };

  const handleCorrectAnswerChange = (index: number) => {
    setFormData(prev => ({ ...prev, correctAnswer: index }));
  };

  const handleSave = () => {
    const questionData: Question = {
      ...question,
      ...formData
    };
    onSave(questionData);
  };

  const handleTypeChange = (newType: string) => {
    if (newType === 'multiple-choice') {
      setFormData({
        title: formData.title,
        type: 'multiple-choice',
        points: formData.points,
        question: formData.question,
        choices: ['', '', '', ''],
        correctAnswer: 0
      } as any);
    } else if (newType === 'true-false') {
      setFormData({
        title: formData.title,
        type: 'true-false',
        points: formData.points,
        question: formData.question,
        correctAnswer: true
      } as any);
    } else if (newType === 'fill-in-blank') {
      setFormData({
        title: formData.title,
        type: 'fill-in-blank',
        points: formData.points,
        question: formData.question,
        possibleAnswers: [''],
        caseSensitive: false
      } as any);
    }
  };

  const choices = Array.isArray(formData.choices) ? formData.choices : [];

  return (
    <div className="border rounded p-4 mb-4 bg-white">
      <Form>
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

        <Form.Group className="mb-3">
          <Form.Label>Question Title:</Form.Label>
          <Form.Control
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter question title"
          />
        </Form.Group>

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
              placeholder="Enter your question text here"
              className="border-0"
            />
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Answers:</Form.Label>
          {choices.map((choice, index) => (
            <Row key={index} className="mb-2 align-items-center">
              <Col xs={1}>
                <Form.Check
                  type="radio"
                  name="correctAnswer"
                  checked={formData.correctAnswer === index}
                  onChange={() => handleCorrectAnswerChange(index)}
                />
              </Col>
              <Col xs={1} className="text-center">
                {formData.correctAnswer === index && <span className="text-success">✓</span>}
              </Col>
              <Col xs={8}>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={choice}
                  onChange={(e) => handleChoiceChange(index, e.target.value)}
                  placeholder={`Possible Answer ${index + 1}`}
                />
              </Col>
              <Col xs={2}>
                {choices.length > 2 && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeChoice(index)}
                    title="Remove this choice"
                  >
                    Remove
                  </Button>
                )}
              </Col>
            </Row>
          ))}

          <Button
            variant="link"
            className="text-danger p-0"
            onClick={addChoice}
          >
            + Add Another Answer
          </Button>
        </Form.Group>

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
            <Button variant="secondary" className="me-2" onClick={onCancel}>Cancel</Button>
            <Button variant="danger" onClick={handleSave}>Update Question</Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
