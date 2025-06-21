import Nav from "react-bootstrap/Nav";
import {Link} from "react-router-dom";

export default function TOC() {
  
    return (
        <Nav variant="pills">
            <Nav.Item> 
                <Nav.Link to="/Kambaz" as={Link} id="wd-a3">Kambaz</Nav.Link> 
            </Nav.Item> 
            <Nav.Item> 
                <Nav.Link href="https://github.com/SharonHuang77/final-project-node-server/tree/sharon" target="_blank">GitHub Node</Nav.Link> 
            </Nav.Item>
            <Nav.Item> 
                <Nav.Link href="https://github.com/SharonHuang77/final-project-kambaz-quiz/tree/sharon" target="_blank">GitHub React</Nav.Link> 
            </Nav.Item>
        </Nav>
        
        
    );
}