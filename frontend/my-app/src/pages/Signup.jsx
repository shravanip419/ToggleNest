import "./Login.css"; // reuse same CSS
import React from "react";
import {useNavigate} from "react-router-dom";

function Signup() {
    const navigate = useNavigate();

    function handleSubmit(e){
        e.preventDefault();
        // signup auth ka code
        // after auth ye
        navigate("/home");
    }
    return (
    <div className="login-container">
        <div className="login-left">
        <div className="brand">
            <div className="logo">T</div>
            <span>ToggleNest</span>
        </div>

        <h1>Create an account</h1>
        <p className="subtitle">
            Get started by creating your account
        </p>

        <form className="form" onSubmit={handleSubmit}>
            <label>Name</label>
            <input type="text" name="name" placeholder="Your name"  />

            <label>Username</label>
            <input type="text" name="username" placeholder="Username"  />

            <label>Email</label>
            <input type="email" name="email" placeholder="you@example.com"  />

            <label>Password</label>
            <input type="password" name="password" placeholder="••••••••"  />

            <label>Phone</label>
            <input type="text" name="phone" placeholder="Phone number"  />

            <button type="submit" className="signin">
            Create Account →
            </button>

            <p className="signup">
            Already have an account? <span>Sign in</span>
            </p>
        </form>
        </div>

        {/* OPTIONAL: right side same as Login */}
        <div className="login-right">
        <div className="icon-box">🚀</div>
        <h2>Join ToggleNest</h2>
        <p>
            Build faster, collaborate better, and stay organized from day one.
        </p>

        <div className="tags">
            <span>Fast Setup</span>
            <span>Secure</span>
            <span>Team Ready</span>
        </div>
        </div>
    </div>
    );
}

export default Signup;
