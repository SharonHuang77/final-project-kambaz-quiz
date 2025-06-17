import { useEffect, useState } from "react";
import { useParams } from "react-router";
import PeopleTable from "./Table";
import * as coursesClient from "../client";

export default function People() {
  const { cid } = useParams();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!cid) return;
      try {
        const enrolledUsers = await coursesClient.findUsersForCourse(cid);
        setUsers(enrolledUsers);
      } catch (error) {
        console.error(error);
      }
      };
    fetchUsers();
  }, [cid]);

  return <PeopleTable users={users} />;

}