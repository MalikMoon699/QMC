import React, { useState } from "react";
import { auth, db } from "../utils/FirebaseConfig";
import { CircleCheckBig, CircleX } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { generateCustomId } from "../utils/Helpers";

const SellerApplication = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [errors, setErrors] = useState({});
  const [userName, setUserName] = useState(currentUser.displayName || "");
  const [userEmail, setUserEmail] = useState(currentUser?.email || "");
  const [userAge, setUserAge] = useState("");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [isFormSubmit, setIsFormSubmit] = useState(false);
  const [lessAge, setLessAge] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!userName.trim()) newErrors.userName = "Name is required";
    if (!userEmail.trim()) {
      newErrors.userEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userEmail)) {
      newErrors.userEmail = "Invalid email format";
    }
    if (!userAge) newErrors.userAge = "Date of birth is required";
    if (!idCardNumber.trim()) {
      newErrors.idCardNumber = "ID card number is required";
    } else if (idCardNumber.length < 13) {
      newErrors.idCardNumber = "ID card number must be at least 13 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const age = calculateAge(userAge);
    if (age < 18) {
      setLessAge(true);
      return;
    }

    try {
        const customId = await generateCustomId("NOTIFICATIONS");
      const notificationRef = doc(db, "NOTIFICATIONS", customId);
      await setDoc(notificationRef, {
        userId: currentUser.uid,
        userName,
        userEmail,
        userAge,
        idCardNumber,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      setIsFormSubmit(true);
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    }
  };

  return (
    <>
      <div
        style={{ display: lessAge || isFormSubmit ? "none" : "flex" }}
        onClick={() => {
          onClose();
        }}
        className="modal-overlay"
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          style={{ width: "400px" }}
          className="sidebar-modal-container"
        >
          <div className="modal-header">
            <button
              onClick={() => {
                onClose();
              }}
              className="back-button"
            >
              ❮
            </button>
            <h3 className="modal-title">Seller Application</h3>
          </div>
          <form style={{ padding: "20px" }} onSubmit={handleSubmit}>
            <input
              className="login-input"
              type="text"
              placeholder="Enter Your Name."
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                setErrors((prev) => ({ ...prev, userName: "" }));
              }}
            />
            {errors.userName && (
              <p className="login-form-error">{errors.userName}</p>
            )}
            <input
              className="login-input"
              type="email"
              placeholder="Enter Your Email."
              value={userEmail}
              onChange={(e) => {
                setUserEmail(e.target.value);
                setErrors((prev) => ({ ...prev, userEmail: "" }));
              }}
            />
            {errors.userEmail && (
              <p className="login-form-error">{errors.userEmail}</p>
            )}
            <input
              className="login-input"
              type="date"
              value={userAge}
              onChange={(e) => {
                setUserAge(e.target.value);
                setErrors((prev) => ({ ...prev, userAge: "" }));
              }}
            />
            {errors.userAge && (
              <p className="login-form-error">{errors.userAge}</p>
            )}
            <input
              className="login-input"
              type="number"
              placeholder="ID card Number"
              value={idCardNumber}
              min={13}
              onChange={(e) => {
                setIdCardNumber(e.target.value);
                setErrors((prev) => ({ ...prev, idCardNumber: "" }));
              }}
            />
            {errors.idCardNumber && (
              <p className="login-form-error">{errors.idCardNumber}</p>
            )}
            <button
              style={{ width: "100%", justifyContent: "center" }}
              className="continue-btn"
              type="submit"
            >
              Submit Request
            </button>
          </form>
        </div>
      </div>
      {lessAge && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ width: "400px" }} className="sidebar-modal">
              <div className="contentWrapper">
                <CircleX color="red" size={50} />
                <h3>Your Request Submission Failed</h3>
                <p>
                  You are not eligible to apply. Required age is 18 years or
                  above. Thank you for your interest.
                </p>
              </div>
              <div style={{ width: "100%", textAlign: "center" }}>
                <button
                  onClick={() => {
                    setLessAge(false);
                    onClose();
                  }}
                  style={{ width: "100px" }}
                  className="logout-delte-btn logout-delte-btn-same"
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isFormSubmit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="sidebar-modal">
              <div className="contentWrapper">
                <CircleCheckBig color="green" size={50}  />
                <h3>Your Request Submitted Successfully</h3>
                <p>We will contact you soon.</p>
              </div>
              <div style={{ width: "100%", textAlign: "center" }}>
                <button
                  onClick={() => {
                    setIsFormSubmit(false);
                    onClose();
                  }}
                  style={{ width: "100px" }}
                  className="logout-delte-btn logout-delte-btn-same"
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SellerApplication;
