import { Navigate, Route, Routes } from "react-router-dom";
import Account from "./Account";
import Dashboard from "./Dashboard";
import KambazNavigation from "./KambazNavigation";
import "./styles.css";

import ProtectedRoute from "./Account/ProtectedRoute";
import Courses from "./Courses";
import ProtectedCourseRoute from "./Courses/ProctedCourseReducer";



export default function Kambaz() {
  
    return (
        <div id="wd-kambaz">
            <KambazNavigation />
            <div className="wd-main-content-offset p-3"> 
            <Routes>
                <Route path="/" element={<Navigate to="/Kambaz/Account" />} />
                <Route path="/Account/*" element={<Account />} />
                <Route path="/Dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>} />
                <Route path="/Courses/:cid/*" element={
                  <ProtectedRoute>
                        <ProtectedCourseRoute>
                            <Courses />
                        </ProtectedCourseRoute>
                  </ProtectedRoute>} />
                <Route path="/Calendar" element={<h1>Calendar</h1>} />
                <Route path="/Inbox" element={<h1>Inbox</h1>} />
                <Route path="/Help" element={<h1>Help</h1>} />
            </Routes>
            </div>
        </div>
    );
}