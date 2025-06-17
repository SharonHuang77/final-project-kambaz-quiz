import { useState, useEffect } from "react";
import { useParams } from "react-router";
import PeopleTable from "../Courses/People/Table";
import * as client from "./client";
import { FormControl } from "react-bootstrap";
import PeopleDetails from "../Courses/People/Details.tsx";
import { FaPlus } from "react-icons/fa";

export default function Users() {

 const [users, setUsers] = useState<any[]>([]);
 const { uid } = useParams();
 const [role, setRole] = useState("");
 const [name, setName] = useState("");

 const createUser = async () => {
  const user = await client.createUser({
    firstName: "New",
    lastName: `User${users.length + 1}`,
    username: `newuser${Date.now()}`,
    password: "password123",
    section: "S101",
    role: "STUDENT",
  });
  setUsers([...users, user]);
};


 const filterUsersByName = async (name: string) => {
   setName(name);
   if (name) {
     const users = await client.findUsersByPartialName(name);
     setUsers(users);
   } else {
     fetchUsers();
   }
 };

 const filterUsersByRole = async (role: string) => {
   setRole(role);
   if (role) {
     const users = await client.findUsersByRole(role);
     setUsers(users);
   } else {
     fetchUsers();
   }
 };
 const fetchUsers = async () => {
   const users = await client.findAllUsers();
   setUsers(users);
 };
 useEffect(() => {
   fetchUsers();
 }, [uid]);

 return (
   <div id="wd-people-table">
     <h3>
        Users
        <button onClick={createUser}
                className="float-end btn btn-danger">
          <FaPlus className="me-2" />
          People
        </button>
     </h3>
     <FormControl value ={name} onChange={(e) => filterUsersByName(e.target.value)} placeholder="Search people"
             className="float-start w-25 me-2 wd-filter-by-name" />
     <select value={role} onChange={
        (e) =>filterUsersByRole(e.target.value)}
              className="form-select float-start w-25 wd-select-role" >
        <option value="">All Roles</option>
        <option value="STUDENT">Students</option>
        <option value="TA">Assistants</option>
        <option value="FACULTY">Faculty</option>
        <option value="ADMIN">Administrators</option>
      </select>
      <br></br><br></br><br></br>
     <PeopleTable users={users} />
     <PeopleDetails fetchUsers={fetchUsers}/>
   </div>
);
}
