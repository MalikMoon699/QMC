import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, provider } from "../utils/FirebaseConfig";
import { signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/Login.css";
import logo from "../../public/QMCLogo.png";
import LoginImg from "../assets/images/login/LoginImg.jpg";
import GoogleIcon from "../assets/images/login/GoogleIcon.png";
import { toast } from "react-toastify";
import { Eye, EyeClosed } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgetOpen, setIsForgetOpen] = useState(false);
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      toast.error(location.state.message, {
        toastId: "inactive-account",
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const validateInputs = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendPasswordReset = async (email) => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent.");
      return { success: true, message: "Check Your Email." };
    } catch (error) {
      console.error("Error sending password reset email:", error.message);
      return { success: false, message: error.message };
    }
    finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email.");
      return;
    }
    const res = await sendPasswordReset(email);
    if (res.success) {
      toast.success(res.message);
      isForgetClose();
    } else {
      toast.error(res.message);
    }
  };

  const isForgetClose = () => {
    setIsForgetOpen(false);
    setEmail("");
    setPassword("");
    setErrors({});
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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    try {
      setLoading(true);
      await login(email, password);
      toast.success("Login successfully!", {
        autoClose: 2000,
      });
    } catch (error) {
      toast.error(error.message || "Invalid email or password.", {
        toastId: "login-error",
      });
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
        <form className="login-form" onSubmit={handleLogin}>
          <h2>
            Login to <span>QMC</span>
          </h2>
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
          {errors.email && <p className="login-form-error">{errors.email}</p>}
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
            <p style={{ marginBottom: "15px" }} className="login-form-error">
              {errors.password}
            </p>
          )}
          <p
            onClick={() => {
              setIsForgetOpen(true);
            }}
            style={{
              textDecoration: "underline",
              cursor: "pointer",
              margin: "-10px 0px 20px 8px",
            }}
            className="login-form-error"
          >
            forget email or password?
          </p>
          <button
            type="submit"
            disabled={loading || authLoading}
            className="login-button"
          >
            {loading || authLoading ? (
              <span className="loader"></span>
            ) : (
              <span className={`login-text ${loading ? "slide-out" : ""}`}>
                Login →
              </span>
            )}
          </button>
          <div className="or-line-container">
            <div className="or-line">OR</div>
          </div>
          <h2 style={{ fontSize: "15px", fontWeight: "500" }}>
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signUp")}
              style={{ textDecoration: "underline", cursor: "pointer" }}
            >
              Sign up
            </span>
          </h2>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="google-login-button"
            disabled={loading || authLoading}
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
      {isForgetOpen && (
        <div
          onClick={isForgetClose}
          style={{ backdropFilter: "blur(10px)" }}
          className="modal-overlay"
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="modal-content"
          >
            <div className="sidebar-modal">
              <div className="contentWrapper">
                <h2>Forget Email or Password</h2>
              </div>
              <input
                type="email"
                placeholder="Email"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="logout-btn-container">
                <button
                  onClick={isForgetClose}
                  className="logout-cencel-btn logout-delte-btn-same"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordReset}
                  disabled={loading || authLoading}
                  style={{display: "flex", }}
                  className="logout-delte-btn logout-delte-btn-same"
                >
                  {loading || authLoading ? (
                    <span className="loader"></span>
                  ) : (
                    <span
                      className={`login-text ${loading ? "slide-out" : ""}`}
                    >
                      Submit
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
