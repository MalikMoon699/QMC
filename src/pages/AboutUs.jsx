import { ArrowUpFromLine, Pen, Plus } from "lucide-react";
import React, { useState, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../utils/FirebaseConfig"; // Import storage if using Firebase Storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase Storage imports
import { demo5 } from "../utils/Demoimages";
import Loader from "../components/Loader";

const AboutUs = () => {
  const { currentUser, role } = useAuth();
  const { searchTxt } = useOutletContext();
  const [adminData, setAdminData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [update, setUpdate] = useState(false);
  const [updateImg, setUpdateImg] = useState("");
  const [updateName, setUpdateName] = useState("");
  const [updateEmail, setUpdateEmail] = useState("");
  const [updatePhone, setUpdatePhone] = useState("");
  const [updateLocation, setUpdateLocation] = useState("");
  const [updateId, setUpdateId] = useState(""); // Store the ID of the admin being updated
  const [imageFile, setImageFile] = useState(null); // Store the selected image file

  const fetchAdmin = useCallback(async () => {
    try {
      const collections = ["ADMIN"];
      let allAdmins = [];

      for (const collectionName of collections) {
        const collectionRef = collection(db, collectionName);
        const querySnapshot = await getDocs(collectionRef);
        allAdmins = [
          ...allAdmins,
          ...querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
            collection: collectionName,
          })),
        ];
      }

      const formattedAdmins = allAdmins.map((adminData) => ({
        name: adminData.name || "Unnamed User",
        profileImg: adminData.profileImg || demo5,
        email: adminData.email || "N/A",
        phoneNumber: adminData.phoneNumber || "N/A",
        location: adminData.location || "N/A",
        id: adminData.id, // Store ID for updates
      }));

      setAdminData(formattedAdmins);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setAdminData([]);
      setLoading(false);
    }
  }, []);

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setUpdateImg(URL.createObjectURL(file)); // Preview the selected image
    }
  };

  // Upload image to Firebase Storage and get URL
  const uploadImage = async (file, adminId) => {
    if (!file) return updateImg; // Return existing image if no new file
    try {
      const storageRef = ref(storage, `profileImages/${adminId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      return updateImg; // Fallback to existing image on error
    }
  };

  // Handle updating admin data in Firestore
  const handleUpdate = async () => {
    try {
      if (!updateId) {
        console.error("No admin ID provided for update");
        return;
      }

      // Upload image if a new one was selected
      const profileImgUrl = await uploadImage(imageFile, updateId);

      // Prepare updated data
      const updatedData = {
        name: updateName,
        email: updateEmail,
        phoneNumber: updatePhone,
        location: updateLocation,
        profileImg: profileImgUrl,
      };

      // Update Firestore document
      const adminDocRef = doc(db, "ADMIN", updateId);
      await updateDoc(adminDocRef, updatedData);

      // Refresh admin data
      await fetchAdmin();
      handleUpdateClose(); // Close modal after update
    } catch (error) {
      console.error("Error updating admin:", error);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin]);

  if (loading) {
    return (
      <div>
        <Loader loading={true} />
      </div>
    );
  }

  const handleUpdateOpen = (admin) => {
    setUpdateId(admin.id); // Set the ID of the admin to update
    setUpdateImg(admin.profileImg || demo5);
    setUpdateName(admin.name || "");
    setUpdateEmail(admin.email || "");
    setUpdatePhone(admin.phoneNumber || "");
    setUpdateLocation(admin.location || "");
    setUpdate(true);
  };

  const handleUpdateClose = () => {
    setUpdateId("");
    setUpdateImg("");
    setUpdateName("");
    setUpdateEmail("");
    setUpdatePhone("");
    setUpdateLocation("");
    setImageFile(null);
    setUpdate(false);
  };

  return (
    <div>
      <div className="mobiles-summary-header">
        <div className="mobiles-status-title">About Us</div>
        {adminData.length > 0 && (
          <button
            style={{
              backgroundColor: "red",
              padding: "10px 20px",
              gap: "12px",
            }}
            className="action-btn"
            onClick={() => handleUpdateOpen(adminData[0])}
          >
            <ArrowUpFromLine size={20} />
            Update
          </button>
        )}
      </div>
      <div>
        <div className="left-side-container">
          {adminData.length > 0 ? (
            adminData.map((admin, index) => (
              <div key={index} className="mobile-summary-header">
                <img
                  style={{ height: "20px", width: "20px" }}
                  src={admin.profileImg}
                  alt={`${admin.name}'s profile`}
                />
                <h2>{admin.name}</h2>
                <h2>{admin.email}</h2>
                <h2>{admin.phoneNumber}</h2>
                <h2>{admin.location}</h2>
              </div>
            ))
          ) : (
            <div>No admin data available</div>
          )}
        </div>
        <div className="right-side-container"></div>
      </div>
      {update && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <button onClick={handleUpdateClose} className="back-button">
                ❮
              </button>
              <h3 className="modal-title">Update</h3>
            </div>
            <div>
              <div className="avatar-section" style={{ marginTop: "10px" }}>
                <div style={{ position: "relative", cursor: "pointer" }}>
                  <img src={updateImg || demo5} alt="Profile preview" />
                  <span className="edit-icon">
                    <label htmlFor="imageUpload" style={{ cursor: "pointer" }}>
                      <Pen size={20} color="red" />
                    </label>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageChange}
                    />
                  </span>
                </div>
              </div>
              <div className="modal-containeer">
                <div style={{ border: "none" }}>
                  <span>Name</span>
                  <input
                    type="text"
                    className="edit-input"
                    value={updateName}
                    onChange={(e) => setUpdateName(e.target.value)}
                  />
                </div>
                <div>
                  <span>Email</span>
                  <input
                    type="email"
                    className="edit-input"
                    value={updateEmail}
                    onChange={(e) => setUpdateEmail(e.target.value)}
                  />
                </div>
                <div>
                  <span>Phone Number</span>
                  <input
                    type="number"
                    className="edit-input"
                    value={updatePhone}
                    onChange={(e) => setUpdatePhone(e.target.value)}
                  />
                </div>
                <div>
                  <span>Location</span>
                  <input
                    type="text"
                    className="edit-input"
                    value={updateLocation}
                    onChange={(e) => setUpdateLocation(e.target.value)}
                  />
                </div>
                <div>
                  <button className="update-button" onClick={handleUpdate}>
                    Update Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutUs;
