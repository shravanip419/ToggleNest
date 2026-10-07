import React, { useState } from "react";
import { MdVisibility, MdVisibilityOff, MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Setting.css";

const UpdatePassword = () => {
  const navigate = useNavigate();

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const toggle = (key) => {
    setShow(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setStatus({ type: "error", message: "All fields are required" });
      return;
    }

    if (passwords.new.length < 6) {
      setStatus({ type: "error", message: "New password must be at least 6 characters" });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setStatus({ type: "error", message: "New passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      const res = await api.put("/users/update-password", {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });

      setStatus({ type: "success", message: res.data.message || "Password updated successfully! 🎉" });
      setPasswords({ current: "", new: "", confirm: "" });
      setTimeout(() => {
        navigate("/settings");
      }, 1500);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to update password. Please check your current password."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sub-view-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <MdArrowBack /> Back
      </button>

      <div className="sub-settings-card">
        <h2 className="view-title">Update Password</h2>

        {status.message && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px",
              fontWeight: "500",
              backgroundColor: status.type === "error" ? "#fee2e2" : "#dcfce7",
              color: status.type === "error" ? "#dc2626" : "#16a34a",
              border: `1px solid ${status.type === "error" ? "#fca5a5" : "#86efac"}`
            }}
          >
            {status.message}
          </div>
        )}

        <form className="password-form" onSubmit={handleSubmit}>
          {["current", "new", "confirm"].map((field) => (
            <div className="password-input-wrapper" key={field}>
              <input
                type={show[field] ? "text" : "password"}
                name={field}
                placeholder={
                  field === "current"
                    ? "Current Password"
                    : field === "new"
                    ? "New Password (min. 6 characters)"
                    : "Confirm New Password"
                }
                value={passwords[field]}
                onChange={handleChange}
                required
              />
              <span onClick={() => toggle(field)} style={{ cursor: "pointer" }}>
                {show[field] ? <MdVisibilityOff /> : <MdVisibility />}
              </span>
            </div>
          ))}

          <button type="submit" className="update-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;

