import "./Login.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../../src/api/axios"

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();
  // const { login } = useAuth();
  const pupilsRef = useRef([]);

  const [focusField, setFocusField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (focusField) return;

      pupilsRef.current.forEach((pupil) => {
        if (!pupil) return;

        const eye = pupil.parentElement;
        const rect = eye.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dx = e.clientX - cx;
        const dy = e.clientY - cy;

        const angle = Math.atan2(dy, dx);
        const distance = Math.min(4, Math.sqrt(dx * dx + dy * dy) / 20);

        pupil.style.transition = "transform 0.15s linear";
        pupil.style.transform = `translate(
          ${Math.cos(angle) * distance}px,
          ${Math.sin(angle) * distance}px
        )`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [focusField]);

  const lockEyes = (x) => {
    pupilsRef.current.forEach((pupil) => {
      if (!pupil) return;
      pupil.style.transition = "transform 0.7s ease";
      pupil.style.transform = `translate(${x}px, 0)`;
    });
  };

  useEffect(() => {
    if (focusField === "email") lockEyes(5);
    if (focusField === "password") lockEyes(-5);
    if (!focusField && !showPassword) lockEyes(0);
  }, [focusField, showPassword]);

  // const handleSubmit = async (e) => {
  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const { data } = await api.post("/auth/login", {
      email,
      password,
    });

    login(data);
    navigate("/home");
  } catch (err) {
    alert(
      err.response?.data?.message || "Login failed"
    );
  }
};



  return (
    <div className="login-page">
      <div className="login-container">

        {/* LEFT */}
        <div className="illustration-section">
          <div className="shapes-container">
            {["purple", "orange", "black", "yellow"].map((color, i) => (
              <div key={color} className={`shape shape-${color}`}>
                <div className="eyes">
                  {[0, 1].map((j) => (
                    <div key={j} className="eye">
                      <div
                        className="pupil"
                        ref={(el) => (pupilsRef.current[i * 2 + j] = el)}
                      />
                    </div>
                  ))}
                </div>
                <div className="mouth" />
              </div>
            ))}
          </div>
        </div>

        {/* form */}
        <div className="form-section">
          <div className="brand">
            <div className="logo">T</div>
            <span>ToggleNest</span>
          </div>

          <h2>Welcome back!</h2>
          <p className="subtitle">Please enter your details</p>

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusField("email")}
              onBlur={() => setFocusField(null)}
              required
            />


            <label>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusField("password")}
                onBlur={() => setFocusField(null)}
                required
              />

              <span
                onClick={() => {
                  setShowPassword(!showPassword);
                  lockEyes(-6);
                }}
                style={{
                  position: "absolute",
                  right: "6px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? (
                  /* Eye Off */
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 3L21 21"
                      stroke="#555"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10.6 10.6A3 3 0 0012 15a3 3 0 002.4-4.4"
                      stroke="#555"
                      strokeWidth="2"
                    />
                    <path
                      d="M2 12s3.6-6 10-6 10 6 10 6"
                      stroke="#555"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                ) : (
                  /* Eye */
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z"
                      stroke="#555"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle cx="12" cy="12" r="3" fill="#555" />
                  </svg>
                )}
              </span>
            </div>

            <div className="forgot-password">Forgot password?</div>

            <button className="login-btn">Log in</button>

            <button type="button" className="google-btn">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
              />
              Log in with Google
            </button>

            <p className="signup-link">
              Don’t have an account?
              <span onClick={() => navigate("/signup")}> Sign up</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
