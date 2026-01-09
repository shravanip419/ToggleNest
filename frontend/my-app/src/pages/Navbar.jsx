import React, { useState } from "react";
import "./auth/Login.jsx" ;
import "./auth/Signup.jsx"
import Login from "./auth/Login";
import Signup from "./auth/Signup";


function Navbar(){

    const [view, setView] = useState(null)

    return <>
        <nav>
            Togglnest
            <button onClick={()=>{setView("login")}}>Sign in</button>
            <button onClick={()=>{setView("signup")}}>Get Started</button>

            {view==="login" && <Login/>}
            {view==="signup" && <Signup/>}
        </nav>
    </>
}

export default Navbar;