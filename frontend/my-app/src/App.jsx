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
import Projects from "./pages/Projects";

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
            <Route path="/" element={<Hero />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/board" element={<Projects/>}/>
            <Route path="/board/:projectId" element={<Board />} />
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
