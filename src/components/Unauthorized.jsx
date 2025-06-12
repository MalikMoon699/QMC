import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../utils/FirebaseConfig";
import "../assets/styles/Unauthorized.css"

const Unauthorized = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div className="unauthorized-container ">
      <div className="unauthorized-content">
        <h1>403 - Unauthorized Access</h1>
        <p>You don't have permission to access this page.</p>
        <p>Because your role is {role || "not assigned"}.</p>
        <div className="unauthorized-actions">
          <button onClick={() => navigate(-1)}>Go Back</button>
          <button onClick={() => navigate("/")}>Return to Home</button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
