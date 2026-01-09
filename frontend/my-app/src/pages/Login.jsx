import "./Login.css"
import React from "react";
import {useNavigate} from "react-router-dom";


function Login()
{
    const navigate = useNavigate();

    function handleLogin(e){
        // prevent reload
        e.preventDefault()
        // auth wala section idar
        // after auth
        navigate("/home");
    }
    return <>
        <div className="login-container">

            {/* Left side wala part */}
            <div className="login-left">
                <div className="brand">
                    <div className="logo">T</div>
                    <span>Togglenest</span>
                </div>

                {/* welcome message */}
                <h2>Welcome Back</h2>
                <div className="subtitle">
                    <p>Enter your credentials to access your workspace</p>
                </div>

                <form className="form" onSubmit={handleLogin}>
                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" id="email" placeholder="you@example.com" />

                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" placeholder="Enter your password" />

                    <a className="forgot-pass">Forgot Password?</a>

                    <button className="signin">
                        Sign in <span>→</span>
                    </button>

                    <p className="signup">
                        Don't have an account? <a>Create one here</a>
                    </p>
                </form>
            </div>

            {/* Right side wala part */}
            <div className="login-right">
                <div className="iconbox">
                    ✨
                </div>
                <h2>Organize your workflow</h2>
                <p>
                    Manage tasks, collaborate with your team, and ship projects faster with ToggleNest.
                </p>

                <div className="rounded-tags">
                    <span>Kanban Boards</span>
                    <span>Team Collaboration</span>
                    <span>Realtime Updates</span>
                </div>
            </div>
        </div>
    </>
}

export default Login;