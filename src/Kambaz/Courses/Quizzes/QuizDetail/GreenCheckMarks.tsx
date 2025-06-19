import { FaCheckCircle, FaCircle } from "react-icons/fa";

export default function GreenCheckMarks({
  published,
  togglePublish,
}: {
  published: boolean;
  togglePublish: () => void;  
}) { 
    return (
        <span className="me-1 position-relative" style={{ opacity: published ? 1 : 0.3, cursor: "pointer" }}
      onClick={togglePublish}
      title={published ? "Published" : "Unpublished"}>
            <FaCheckCircle style={{ top: "2px" }} className="text-success me-1 position-absolute fs-5" />
            <FaCircle className="text-white me-1 fs-6" />
        </span>
    );
}