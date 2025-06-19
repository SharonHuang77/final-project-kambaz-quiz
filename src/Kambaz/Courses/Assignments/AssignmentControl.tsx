import { IoEllipsisVertical, IoTrash } from "react-icons/io5";
import GreenCheckMarks from "./GreenCheckMarks";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";



export default function AssignmentControl(
    { assignmentId, deleteAssignment }:
    { assignmentId: string; deleteAssignment: (assignmentId: string) => void; }
) {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

return (
   <>
    <div className="float-end">
        <GreenCheckMarks />
        <IoTrash 
                    className="text-danger me-2 fs-5" 
                    style={{ cursor: "pointer" }}
                    onClick={handleShow}
                />
        <IoEllipsisVertical className="fs-4" />
    </div> 
    <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Assignment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to remove this assignment?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => {
                        deleteAssignment(assignmentId);
                        handleClose();
                    }}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>

    
    );}