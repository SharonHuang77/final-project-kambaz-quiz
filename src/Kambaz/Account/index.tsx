import { Navigate, Route, Routes } from "react-router-dom";
import Profile from "./Profile";
import Signin from "./Signin";
import Signup from "./Signup";
import AccountNavigation from "./Navigation";
import { useSelector } from "react-redux";

export default function Account() {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  return (
    <div id="wd-account-screen">
      <h1 id="wd-account-title">Account</h1>
      <table>
        <tr>
          <td valign="top">
            <AccountNavigation />
          </td>
          <td valign="top">
            <Routes>
              <Route path="/"        element={<Navigate to={ currentUser ? "/Kambaz/Account/Profile" : "/Kambaz/Account/Signin" } />} />
              <Route path="/Signin"  element={<Signin />} />
              <Route path="/Profile" element={<Profile />} />
              <Route path="/Signup"  element={<Signup />} />
            </Routes>
          </td>
        </tr>
      </table>
    </div>
  );
}
