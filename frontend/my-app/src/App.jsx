import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";

import Hero from "./pages/Hero";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Home from "./pages/Home";
import Board from "./pages/Board";
import Activity from "./pages/Activity";
import Setting from "./pages/Setting";
import Profile from "./pages/Profile";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---------- PUBLIC / AUTH ---------- */}
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ---------- DASHBOARD (PROTECTED LAYOUT) ---------- */}
        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/board" element={<Board />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/settings/profile" element={<Profile />} />
        </Route>

        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
