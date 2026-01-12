import "./Login.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const pupilsRef = useRef([]);
  const shapesRef = useRef([]);
  const { login } = useAuth();

  const [focusField, setFocusField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // 🌸 FORM STATE (THIS WAS MISSING)
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  /* 👀 Cursor tracking */
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

  /* 👁 Lock eyes */
  const lockEyes = (x) => {
    pupilsRef.current.forEach((pupil) => {
      if (!pupil) return;
      pupil.style.transition = "transform 0.7s ease";
      pupil.style.transform = `translate(${x}px, 0)`;
    });
  };

  useEffect(() => {
    if (focusField === "text") lockEyes(5);
    if (focusField === "password") lockEyes(-5);
    if (!focusField && !showPassword) lockEyes(0);
  }, [focusField, showPassword]);

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/auth/signup", {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      login(data);

      navigate("/home");
    } catch (err) {
      alert(
        err.response?.data?.message || "Signup failed"
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
              <div
                key={color}
                ref={(el) => (shapesRef.current[i] = el)}
                className={`shape shape-${color}`}
              >
                <div className="eyes">
                  {[0, 1].map((j) => (
                    <div key={j} className="eye">
                      <div
                        className="pupil"
                        ref={(el) =>
                          (pupilsRef.current[i * 2 + j] = el)
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="mouth" />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="form-section">
          <div className="brand">
            <div className="logo">T</div>
            <span>ToggleNest</span>
          </div>

          <h2>Create an account</h2>
          <p className="subtitle">Get started with ToggleNest</p>

          <form onSubmit={handleSubmit}>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              onFocus={() => setFocusField("text")}
              onBlur={() => setFocusField(null)}
              required
            />

            <label>Username</label>
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              onFocus={() => setFocusField("text")}
              onBlur={() => setFocusField(null)}
              required
            />

            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              onFocus={() => setFocusField("text")}
              onBlur={() => setFocusField(null)}
              required
            />

            <label>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
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
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <button className="login-btn">Create Account</button>

            <p className="signup-link">
              Already have an account?
              <span onClick={() => navigate("/login")}> Sign in</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
