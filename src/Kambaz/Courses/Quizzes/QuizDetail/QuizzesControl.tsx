import { BsThreeDotsVertical } from "react-icons/bs";
import { useState } from "react";
import { Button, Modal, Dropdown } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import GreenCheckMarks from "./GreenCheckMarks";
import { publishQuiz, unpublishQuiz } from "./reducer";
import * as quizzesClient from "../../client";

interface QuizzesControlProps {
    quizId: string;
    deleteQuiz: (quizId: string) => void;
}

export default function QuizzesControl({ quizId, deleteQuiz }: QuizzesControlProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { cid } = useParams();
    
    // Get the quiz from Redux store to check published status
    const quiz = useSelector((state: any) => 
        state.quizzesDetailReducer.quizzes.find((q: any) => q._id === quizId)
    );
    
    const handleCloseModal = () => setShowDeleteModal(false);
    const handleShowModal = () => {
        setShowDropdown(false); // Close dropdown when opening modal
        setShowDeleteModal(true);
    };

    const handleEdit = () => {
        setShowDropdown(false);
        navigate(`/Kambaz/Courses/${cid}/Quizzes/${quizId}/Editor`);
    };

    const handleTogglePublish = async () => {
        try {
            const updatedQuiz = { 
                _id: quizId, 
                published: !quiz.published 
            };
            await quizzesClient.updateQuiz(updatedQuiz);
            
            if (quiz.published) {
                dispatch(unpublishQuiz(quizId));
            } else {
                dispatch(publishQuiz(quizId));
            }
        } catch (error) {
            console.error("Error toggling publish status:", error);
            alert(`Failed to ${quiz.published ? 'unpublish' : 'publish'} quiz.`);
        }
    };

    return (
        <>
            <div className="d-flex align-items-center float-end">
                <GreenCheckMarks 
                    published={quiz?.published || false}
                    togglePublish={handleTogglePublish}
                />
                
                <Dropdown show={showDropdown} onToggle={(isOpen) => setShowDropdown(isOpen)}>
                    <Dropdown.Toggle
                        as="div"
                        className="p-0"
                        style={{ cursor: "pointer" }}
                    >
                        <BsThreeDotsVertical className="fs-4" />
                    </Dropdown.Toggle>

                    <Dropdown.Menu align="end">
                        <Dropdown.Item onClick={handleEdit}>
                            Edit
                        </Dropdown.Item>
                        <Dropdown.Item 
                            onClick={handleShowModal}
                            className="text-danger"
                        >
                            Delete
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div> 
            
            <Modal show={showDeleteModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Quiz</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to remove this quiz?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => {
                        deleteQuiz(quizId);
                        handleCloseModal();
                    }}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}