import React, { useState, useRef } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../utils/FirebaseConfig";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/Modal.css";
import { Info, Pen } from "lucide-react";

const ProfileImage =
  "https://png.pngtree.com/png-clipart/20200701/original/pngtree-single-person-character-in-vector-png-image_5359691.jpg";

const TopBarModal = ({ userData, onProfileUpdate, isOpen, setIsOpen }) => {
  const { role, currentUser } = useAuth();
  const fileInputRef = useRef(null);
  const [infoModal, setInfoModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState(userData?.name || "");
  const [editPhoneNumber, setEditPhoneNumber] = useState(
    userData?.phoneNumber || ""
  );
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const getUserDocId = async () => {
    const collectionName = role === "user";
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where("uid", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    throw new Error("User document not found");
  };

  const handleUpdateProfile = async () => {
    try {
      setUploading(true);
      if (!auth.currentUser) {
        throw new Error("User is not authenticated");
      }

      const storage = getStorage();
      let imageUrl = userData.profileImg || "";
      if (fileInputRef.current.files[0]) {
        const file = fileInputRef.current.files[0];
        const storageRef = ref(
          storage,
          `profileImages/${auth.currentUser.uid}`
        );
        await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(storageRef);
      }

      const collectionName = role === "user" ? "EMPLOYEES" : role.toUpperCase();
      const customId = await getUserDocId();
      const userDocRef = doc(db, collectionName, customId);

      await updateDoc(userDocRef, {
        name: editName,
        phoneNumber: editPhoneNumber,
        profileImg: imageUrl,
      });

      setEditModal(false);
      if (onProfileUpdate) onProfileUpdate();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsOpen(false)}>
      {isOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          style={{ display: infoModal || editModal ? "none" : "" }}
          className="sidebar-modal-container"
        >
          <div className="modal-header">
            <button className="back-button" onClick={() => setIsOpen(false)}>
              ❮
            </button>
            <h3 className="modal-title">User Details</h3>
          </div>
          <div className="sidebar-modal">
            <div className="avatar-section">
              <img
                src={
                  userData?.profileImg?.startsWith("http")
                    ? userData.profileImg
                    : ProfileImage
                }
                alt="Profile"
              />
            </div>
            <div className="user-Name">
              <h3>{userData?.name || "No Name"}</h3>
            </div>

            <div className="menu">
              <div
                onClick={() => {
                  setInfoModal(!infoModal);
                }}
              >
                <Info color="white" /> Info
              </div>
              <div onClick={() => setEditModal(!editModal)}>
                <Pen color="white" /> Profile Edit
              </div>
            </div>
          </div>
        </div>
      )}
      {infoModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="modal-card"
        >
          <div className="modal-header">
            <button className="back-button" onClick={() => setInfoModal(false)}>
              ❮
            </button>
            <h3 className="modal-title">Info</h3>
          </div>
          <div className="modal-containeer">
            <div className="avatar-section">
              <img
                src={
                  previewImage ||
                  (userData?.profileImg?.startsWith("http")
                    ? userData.profileImg
                    : ProfileImage)
                }
                alt="Profile"
                className="clickable-profile-img"
              />
            </div>
            <div style={{ border: "none" }}>
              <span>Name</span> {userData?.name || "N/A"}
            </div>
            <div>
              <span>Email</span> {currentUser?.email || "N/A"}
            </div>
            <div>
              <span>Phone Number</span> {userData?.phoneNumber || "N/A"}
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="modal-card"
        >
          <div className="modal-header">
            <button className="back-button" onClick={() => setEditModal(false)}>
              ❮
            </button>
            <h3 className="modal-title">Edit Profile</h3>
          </div>

          <div className="avatar-section" style={{ marginTop: "10px" }}>
            <div
              onClick={handleImageClick}
              style={{ cursor: "pointer", position: "relative" }}
            >
              <img
                src={
                  previewImage ||
                  (userData?.profileImg?.startsWith("http")
                    ? userData.profileImg
                    : ProfileImage)
                }
                alt="Profile"
                className="clickable-profile-img"
              />
              <span className="edit-icon">
                <Pen color="red" size={20}/>
              </span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          <div className="modal-containeer">
            <div style={{ border: "none" }}>
              <span>Name</span>
              <input
                type="text"
                className="edit-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <span>Phone Number</span>
              <input
                type="number"
                className="edit-input"
                value={editPhoneNumber}
                onChange={(e) => setEditPhoneNumber(e.target.value)}
              />
            </div>
            <div>
              <button
                className="update-button"
                onClick={handleUpdateProfile}
                disabled={uploading}
              >
                {uploading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBarModal;
