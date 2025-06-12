import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../utils/FirebaseConfig";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import "../assets/styles/ProfileDetail.css";
import "../assets/styles/Login.css";
import LoginImg from "../assets/images/login/LoginImg.jpg";
import Logo from "../assets/images/logo/QMCLogo.png";
import { generateCustomId } from "../utils/Helpers";
import { Pen } from "lucide-react";

const ProfileImage =
  "https://png.pngtree.com/png-clipart/20200701/original/pngtree-single-person-character-in-vector-png-image_5359691.jpg";

const ProfileDetails = () => {
  const [imageSrc, setImageSrc] = useState(ProfileImage);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const { currentUser, role } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const getUserDocId = async () => {
    const collectionName = role === "user" ? "USERS" : role.toUpperCase();
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where("uid", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    const customId = await generateCustomId(collectionName);
    const userDocRef = doc(db, collectionName, customId);
    await setDoc(userDocRef, {
      email: currentUser.email,
      role,
      isActive: true,
      profileImg: "",
      name: "",
      gender: "",
      position: "",
      uid: currentUser.uid,
    });
    return customId;
  };

  const handleIconClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setImageSrc(imageURL);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setUploading(true);

    if (!name) {
      setError("Enter Your name.");
      setUploading(false);
      return;
    }
    if (phoneNumber && phoneNumber.length < 11) {
      setError("Phone number must be at least 11 digits.");
      setUploading(false);
      return;
    }

    try {
      setLoading(true);
      const storage = getStorage();
      let imageUrl = imageSrc;

      if (fileInputRef.current && fileInputRef.current.files[0]) {
        const file = fileInputRef.current.files[0];
        const storageRef = ref(storage, `profileImages/${currentUser.uid}`);
        await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(storageRef);
      } else if (imageSrc === ProfileImage) {
        imageUrl = ProfileImage;
      }

      const collectionName = role === "user" ? "USERS" : role.toUpperCase();
      const customId = await getUserDocId();
      const userDocRef = doc(db, collectionName, customId);

      await setDoc(
        userDocRef,
        {
          name: name.trim(),
          userEmail: email,
          phoneNumber: phoneNumber,
          gender,
          position: position.trim(),
          profileImg: imageUrl,
          email: currentUser.email,
          role,
          uid: currentUser.uid,
        },
        { merge: true }
      );

      navigate(role === "admin" ? "/" : "/");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader loading={true} />;
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="profile-detail-brand-logo">
          <img src={Logo} alt="UnicodeTech Logo" />
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
        <div className="profile-details-card">
          {error && (
            <div style={{ width: "250px" }} className="error-message">
              {error}
            </div>
          )}
          <div className="image-section">
            <img src={imageSrc} alt="User Avatar" className="avatar" />
            <div className="edit-btn" onClick={handleIconClick}>
              <Pen />
            </div>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          <div className="form-section">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => {
                  setError("");
                  setName(e.target.value);
                }}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="number"
                placeholder="Enter Your Phone Number."
                value={phoneNumber}
                onChange={(e) => {
                  setError("");
                  setPhoneNumber(e.target.value);
                }}
              />
            </div>
          </div>
          <button
            style={{ width: "100%", justifyContent: "center" }}
            className="continue-btn"
            onClick={handleSubmit}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
