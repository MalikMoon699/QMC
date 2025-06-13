import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../utils/FirebaseConfig";
import "../assets/styles/Login.css";
import logo from "../../public/QMCLogo.png";
import LoginImg from "../assets/images/login/LoginImg.jpg";
import GoogleIcon from "../assets/images/login/GoogleIcon.png";
import { Eye, EyeClosed } from "lucide-react";

const SignUp = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { createUserDocument, role: currentUserRole } = useAuth();

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!name) {
      newErrors.name = "Name is Required";
    }
    if (phoneNumber.length < 11) {
      newErrors.phoneNumber = "Phone Number must be at least 11 digits";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const onBack = (e) => {
    setErrors({});
    setStep(1);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is Required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password) {
      newErrors.password = "Password is Required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);

    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await createUserDocument(user, role, { name, phoneNumber });
      toast.success(`SignUp successfully!`);

      if (currentUserRole === "admin" || currentUserRole === "seller") {
        window.location.reload();
      }
      setName("");
      setPhoneNumber("");
      setEmail("");
      setPassword("");
      setRole("user");
    } catch (error) {
      console.error("SignUp Error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email is already in use. Please use a different email.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email format. Please enter a valid email.");
      } else if (error.code === "auth/permission-denied") {
        toast.error("Permission denied: Unable to create account.");
      } else {
        toast.error(error.message || "Failed to create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userInfo = await findUserDoc(user);
      if (userInfo) {
        const { userData } = userInfo;
        if (userData.isActive === false) {
          await signOut(auth);
          throw new Error("Your account is inactive.");
        }
        setCurrentUser(user);
        setRole(userData.role);
        toast.success(`Welcome ${user.displayName}!`, { autoClose: 2000 });
        navigate("/dashboard");
      } else if (!documentCreatedRef.current) {
        await createUserDocument(user, "user", {
          name: user.displayName || "",
          phoneNumber: user.phoneNumber || "",
        });
        setRole("user");
        setHasProfileDetails(!!user.displayName);
        toast.success(`Welcome ${user.displayName}!`, { autoClose: 2000 });
        navigate("/profileDetails");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Google login failed.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-left">
        <div className="brand-logo">
          <img src={logo} alt="UnicodeTech Logo" />Q<span>MC</span>
        </div>
        <h1>
          Where <br />
          Innovation Meets <br />
          <span>Imagination.</span>
        </h1>
        <div className="login-illustration">
          <img src={LoginImg} alt="Illustration" />
        </div>
      </div>

      <div className="login-right">
        <form className="login-form" onSubmit={handleSignUp}>
          <h2>
            SignUp to <span>QMC</span>
          </h2>
          {step === 1 && (
            <>
              <label>Name</label>
              <input
                type="text"
                className="login-input"
                placeholder="Enter Your Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
              />
              {errors.name && <p className="login-form-error">{errors.name}</p>}
              <label>Phone Number</label>
              <input
                type="number"
                className="login-input"
                placeholder="Enter Your Phone Number"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (errors.phoneNumber) {
                    setErrors((prev) => ({ ...prev, phoneNumber: "" }));
                  }
                }}
              />
              {errors.phoneNumber && (
                <p className="login-form-error">{errors.phoneNumber}</p>
              )}
              <button onClick={handleNextStep} className="login-button">
                Next
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <label>Email Address</label>
              <input
                type="email"
                className="login-input"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
              />
              {errors.email && (
                <p className="login-form-error">{errors.email}</p>
              )}
              <label>Password</label>
              <div className="input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }}
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeClosed /> : <Eye />}
                </div>
              </div>
              {errors.password && (
                <p className="login-form-error">{errors.password}</p>
              )}
              <div className="signUp-btn-container">
                <button onClick={onBack} className="login-button">
                  Back
                </button>
                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Create Account"}
                </button>
              </div>
            </>
          )}
          <div className="or-line-container">
            <div className="or-line">OR</div>
          </div>
          <h2 style={{ fontSize: "15px", fontWeight: "500" }}>
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              style={{ textDecoration: "underline", cursor: "pointer" }}
            >
              Login
            </span>
          </h2>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="google-login-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loader"></span>
            ) : (
              <div className="login-with-google">
                <img src={GoogleIcon} alt="" />
                <span className="login-text">Login with Google</span>
                <span className="login-text"></span>
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
