import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, reload } from "firebase/auth";
import { auth } from "../firebase/config";
import { Link, useNavigate, useLocation } from "react-router-dom";
import './LoginPage.css';

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [infoMessage, setInfoMessage] = useState(""); 
    const [errorMessage, setErrorMessage] = useState("");
    
    const navigate = useNavigate();
    const location = useLocation(); 

    useEffect(() => {
        if (location.state?.emailSent && location.state?.message) {
            setInfoMessage(location.state.message);
            window.history.replaceState({}, document.title); 
        }
    }, [location.state]);

    const getUserRole = (userEmail) => {
        if (userEmail.includes("coordinator")) return "Coordinator";
        if (userEmail.includes("judge")) return "Judge";
        if (userEmail.includes("mentor")) return "Mentor";
        return "Student";
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setInfoMessage(""); 
        setErrorMessage("");

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await reload(user); 

            if (!user.emailVerified) {
                await auth.signOut(); 
                setErrorMessage("Your email is not verified. Check your inbox or resend the link.");
                return; 
            }

            const role = getUserRole(user.email); 

            switch (role) {
                case "Coordinator":
                    navigate("/admin/dashboard"); 
                    break;
                case "Judge":
                    navigate("/judge/dashboard"); 
                    break;
                case "Mentor":
                    navigate("/mentor/dashboard"); 
                    break;
                default:
                    navigate("/student/team-select");
                    break;
            }

        } catch (err) {
            console.error("Login error:", err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setErrorMessage("Invalid email or password.");
            } else {
                setErrorMessage(`Login failed: ${err.message}`);
            }
        }
    };

    return (
        <div className="login-container">
            <h2>Portal Log In</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                /><br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                /><br />

                <button type="submit">Access Portal</button>
            </form>

            <p><Link to="/reset-password" className="forgot-password-link">Forgot your password?</Link></p>
            
            {infoMessage && <p className="message info">{infoMessage}</p>} 
            {errorMessage && <p className="message error">{errorMessage}</p>} 

            <p className="already-account">Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
    );
}
