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

interface MultipleChoiceEditorProps {
  question: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
  onDelete: () => void;
  onTypeChange: (id: string, newType: Question['type']) => void;
}

export default function MultipleChoiceEditor({ 
  question, 
  onSave, 
  onCancel, 
  onDelete,
  onTypeChange
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

  console.log("Submitting question data:", question);

  const handleSave = () => {
    const questionData: Question = {
      ...question,
      ...formData
    };
    onSave(questionData);
  };


  const choices = Array.isArray(formData.choices) ? formData.choices : [];

  return (
    <div className="border rounded p-4 mb-4 bg-white">
      <Form>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Question Type:</Form.Label>
            <Form.Select
              value={question.type}
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