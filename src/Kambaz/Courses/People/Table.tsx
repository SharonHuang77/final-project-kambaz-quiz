import { Table } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router";

//import {useParams} from "react-router-dom";
//import * as db from "../../Database";


export default function PeopleTable({ users = [] }: { users?: any[] }) {
    // const { cid } = useParams();
    // const { users, enrollments} = db;
    
        return (
        <div id="wd-people-table">
        <Table striped bordered hover responsive>
            <thead>
            <tr><th>Name</th><th>Login ID</th><th>Section</th><th>Role</th><th>Last Activity</th><th>Total Activity</th></tr>
            </thead>
            <tbody>
                {users
                // .filter((user) => enrollments.some((enrollment) => 
                //     enrollment.user === user._id && enrollment.course === cid))
                .map((user: any) => (
                    <tr key={user._id}>
                        <td className="wd-full-name text-nowrap">
                          <Link to={`/Kambaz/Account/Users/${user._id}`} className="text-decoration-none">
                            <FaUserCircle className="me-2 fs-1 text-secondary" />
                            <span className="wd-first-name">{user.firstName}</span>{" "}
                            <span className="wd-last-name">{user.lastName}</span>
                          </Link>
                        </td>
                        <td className="wd-login-id">{user.loginId}</td>
                        <td className="wd-section"> {user.section}</td>
                        <td className="wd-role">{user.role}</td>
                        <td className="wd-last-activity">{user.lastActivity}</td>
                        <td className="wd-total-activity">{user.totalActivity}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
        </div> 
    );}
