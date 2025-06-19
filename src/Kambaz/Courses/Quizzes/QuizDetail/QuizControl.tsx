import { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { BsThreeDotsVertical } from "react-icons/bs";

interface QuizListControlProps {
  onAction: (action: string) => void;
}

export default function QuizListControl({ onAction }: QuizListControlProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <Dropdown show={showDropdown} onToggle={(isOpen) => setShowDropdown(isOpen)}>
      <Dropdown.Toggle
        as="div"
        className="btn btn-light ms-2"
        style={{ cursor: "pointer" }}
      >
        <BsThreeDotsVertical className="text-muted" />
      </Dropdown.Toggle>

      <Dropdown.Menu align="end">
        <Dropdown.Item onClick={() => onAction('edit')}>
          Edit
        </Dropdown.Item>
        <Dropdown.Item onClick={() => onAction('delete')} className="text-danger">
          Delete
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={() => onAction('publish')}>
          Publish
        </Dropdown.Item>
        <Dropdown.Item onClick={() => onAction('unpublish')}>
          Unpublish
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}