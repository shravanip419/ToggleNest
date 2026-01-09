import { Routes, Route, useLocation } from "react-router-dom";

import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
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
  const location = useLocation();

  // Routes that should NOT show Sidebar/Header
  const isAuthPage = ["/", "/login", "/signup"].includes(location.pathname);

  return (
    <div className={isAuthPage ? "auth-root" : "app"}>
      {!isAuthPage && <Sidebar />}

      <main className={isAuthPage ? "full-content" : "main"}>
        {!isAuthPage && <Header />}

        <div className={isAuthPage ? "" : "page-content"}>
          <Routes>
            {/* Auth / Landing */}
            <Route path="/" element={<Hero />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* App Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/board" element={<Board />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/settings" element={<Setting />} />
            <Route path="/settings/profile" element={<Profile />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
