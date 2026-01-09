import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

import Board from "./pages/Board.jsx";
import Activity from "./pages/Activity.jsx";
import Setting from "./pages/Setting.jsx";
import Profile from "./pages/Profile.jsx";

import "./App.css";

function App() {
  return (
    <Routes>
      {/* DEFAULT → LOGIN */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* AUTH ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* APP ROUTES (AFTER LOGIN) */}
      <Route path="/board" element={<Board />} />
      <Route path="/activity" element={<Activity />} />

      {/* SETTINGS + PROFILE */}
      <Route path="/setting" element={<Setting />}>
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/login" />} />
      
    </Routes>
  );
}

export default App;
