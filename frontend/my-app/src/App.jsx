<<<<<<< Updated upstream
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

=======
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
>>>>>>> Stashed changes
import Board from "./pages/Board.jsx";
import Activity from "./pages/Activity.jsx";
import Setting from "./pages/Setting.jsx";
import Profile from "./pages/Profile.jsx";
<<<<<<< Updated upstream

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
=======
import Hero from "./pages/Hero";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import "./App.css";

function App() {
  const location = useLocation();
  
  // Routes that should NOT show the Sidebar/Header
  const isAuthPage = ["/", "/login", "/signup"].includes(location.pathname);

  return (
    <div className={isAuthPage ? "auth-root" : "app"}>
      {!isAuthPage && <Sidebar />}
      
      <main className={isAuthPage ? "full-content" : "main"}>
        {!isAuthPage && <Header />}
        
        {/* Container for the actual page content */}
        <div className={isAuthPage ? "" : "page-content"}>
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Dashboard Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/board" element={<Board />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/settings" element={<Setting />} />
            <Route path="/settings/profile" element={<Profile />} />
          </Routes>
        </div>
      </main>
    </div>
>>>>>>> Stashed changes
  );
}

export default App;