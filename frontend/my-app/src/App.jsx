import { Routes, Route, useLocation } from "react-router-dom";

import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import ProtectedRoute from "./Components/ProtectedRoute";
import Hero from "./pages/Hero";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Board from "./pages/Board";
import Activity from "./pages/Activity";
import Setting from "./pages/Setting";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import UpdatePassword from "./pages/UpdatePassword";

import "./App.css";

function App() {
  const location = useLocation();
  const isAuthPage = ["/", "/login", "/signup"].includes(location.pathname);

  return (
    <div className={isAuthPage ? "auth-root" : "app"}>
      {!isAuthPage && <Sidebar />}

      <main className={isAuthPage ? "full-content" : "main"}>
        {!isAuthPage && <Header />}

        <div className={isAuthPage ? "" : "page-content"}>
          <Routes>
            {/* PUBLIC / AUTH */}
            <Route path="/" element={<Hero />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* PROTECTED APP ROUTES */}
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<Home />} />
              <Route path="/board" element={<Projects />} />
              <Route path="/board/:projectId" element={<Board />} />
              <Route path="/activity" element={<Activity />} />

              {/* SETTINGS (NESTED ROUTES) */}
              <Route path="/settings" element={<Setting title="Settings" subtitle="Manage your account" />}>
                <Route path="profile" element={<Profile />} />
                <Route path="security/update-password" element={<UpdatePassword />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;

