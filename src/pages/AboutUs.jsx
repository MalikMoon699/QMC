import {
  AlertCircleIcon,
  ArrowUpFromLine,
  MessageSquareMore,
  Pen,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import React, { useState, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../utils/FirebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { demo5 } from "../utils/Demoimages";
import "../assets/styles/AboutUs.css";
import Loader from "../components/Loader";
import { fetchCurrentUser, fetchAllUsers } from "../utils/Helpers";

const AboutUs = () => {
  const { currentUser, role } = useAuth();
  const { searchTxt } = useOutletContext();
  const [adminData, setAdminData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [currentUserDetails, setCurrentUserDetails] = useState([]);
  const [allUserDetail, setAllUserDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [update, setUpdate] = useState(false);
  const [feedBack, setFeedBack] = useState(false);
  const [reportUserOpen, setReportUserOpen] = useState(false);
  const [reportIssue, setReportIssue] = useState(false);
  const [updateImg, setUpdateImg] = useState("");
  const [updateName, setUpdateName] = useState("");
  const [updateEmail, setUpdateEmail] = useState("");
  const [description, setDescription] = useState("");
  const [updatePhone, setUpdatePhone] = useState("");
  const [updateLocation, setUpdateLocation] = useState("");
  const [updateId, setUpdateId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [searchUser, setSearchUser] = useState(""); // New state for search input

  useEffect(() => {
    getUserDetails();
    getAllUserDetails();
  }, [currentUser]);

  const getAllUserDetails = async () => {
    const fetchUsers = await fetchAllUsers();
    const allUsers = fetchUsers.map((user) => user.userData);
    setAllUserDetails(allUsers);
  };

  const getUserDetails = async () => {
    if (currentUser) {
      const userDetails = await fetchCurrentUser(currentUser);
      const currentUserDetail = userDetails.userData;
      setCurrentUserDetails(currentUserDetail);
    }
  };

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
        id: adminData.id,
      }));

      setAdminData(formattedAdmins);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setAdminData([]);
      setLoading(false);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setUpdateImg(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file, adminId) => {
    if (!file) return updateImg;
    try {
      const storageRef = ref(storage, `profileImages/${adminId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      return updateImg;
    }
  };

  const handleUpdate = async () => {
    try {
      if (!updateId) {
        console.error("No admin ID provided for update");
        return;
      }

      const profileImgUrl = await uploadImage(imageFile, updateId);

      const updatedData = {
        name: updateName,
        email: updateEmail,
        phoneNumber: updatePhone,
        location: updateLocation,
        profileImg: profileImgUrl,
      };
      const adminDocRef = doc(db, "ADMIN", updateId);
      await updateDoc(adminDocRef, updatedData);
      await fetchAdmin();
      handleUpdateClose();
    } catch (error) {
      console.error("Error updating admin:", error);
    }
  };

  const handleReport = async () => {
    try {
      if (!description) {
        console.error("No description provided");
        return;
      }

      const reportData = {
        userId: currentUserDetails.uid,
        userEmail: currentUserDetails.email,
        userName: currentUserDetails.displayName,
        notificationType: "report",
        reportAbout: selected,
        description: description,
        createdAt: new Date(),
      };

      const reportDocRef = doc(db, "NOTIFICATIONS", currentUser.id);
      await updateDoc(reportDocRef, reportData);
      handleReportClose();
    } catch (error) {
      console.error("Error reporting issue:", error);
    }
  };

  const handleFeedBack = async () => {
    try {
      if (!description) {
        console.error("No description provided");
        return;
      }

      const reportData = {
        userId: currentUserDetails.uid,
        userEmail: currentUserDetails.email,
        userName: currentUserDetails.displayName,
        notificationType: "feedback",
        reportAbout: selected,
        description: description,
        createdAt: new Date(),
      };

      const reportDocRef = doc(db, "NOTIFICATIONS", currentUser.id);
      await updateDoc(reportDocRef, reportData);
      handleFeedBackClose();
    } catch (error) {
      console.error("Error reporting issue:", error);
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
    setUpdateId(admin.id);
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

  const handleReportClose = () => {
    setSelected([]);
    setDescription("");
    setReportIssue(false);
    setSearchUser(""); // Reset search input
  };

  const handleFeedBackClose = () => {
    setSelected([]);
    setDescription("");
    setFeedBack(false);
    setSearchUser(""); // Reset search input
  };

  const handleReportUserOpen = () => {
    setReportUserOpen((prev) => !prev);
  };

  // Filter users based on search input
  const filteredUsers = allUserDetail.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  console.log("selected Data:", selected);

  return (
    <div>
      <div className="mobile-summary-header mobiles-summary-header">
        <div className="mobiles-status-title">About Us</div>
        {role !== "admin" && (
          <div className="action-btn-container">
            <button
              style={{
                backgroundColor: "red",
                padding: "10px 20px",
                gap: "12px",
              }}
              className="action-btn"
              onClick={() => setFeedBack(true)}
            >
              <MessageSquareMore size={20} />
              FeedBack
            </button>
            <button
              style={{
                backgroundColor: "red",
                padding: "10px 20px",
                gap: "12px",
              }}
              className="action-btn"
              onClick={() => setReportIssue(true)}
            >
              <AlertCircleIcon size={20} />
              Report
            </button>
          </div>
        )}
        {role === "admin" && (
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

      {feedBack && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ minWidth: "410px" }}>
            <div className="modal-header">
              <button onClick={handleFeedBackClose} className="back-button">
                ❮
              </button>
              <h3 className="modal-title">Feed Back</h3>
            </div>
            <div>
              <div className="sidebar-modal" style={{ width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label>Feed Back:</label>
                  <textarea
                    className="login-input report-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the feedBack..."
                  ></textarea>
                </div>
                <div className="report-user-container">
                  <button
                    onClick={handleReportUserOpen}
                    className="report-user-button"
                  >
                    <p> Report any User</p>
                    <span>
                      {reportUserOpen ? (
                        <ChevronUp size={25} style={{ paddingTop: "5px" }} />
                      ) : (
                        <ChevronDown size={25} style={{ paddingTop: "5px" }} />
                      )}
                    </span>
                  </button>
                  {reportUserOpen && (
                    <div className="report-user-list">
                      <div className="searchWrapper">
                        <input
                          style={{ borderRadius: "8px" }}
                          type="text"
                          className="search"
                          placeholder="Search for a user..."
                          value={searchUser}
                          onChange={(e) => setSearchUser(e.target.value)}
                        />
                        <Search className="icon" />
                      </div>
                      <div className="devices-list">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <div
                              style={{
                                boxShadow: "0px 0px 20px rgb(0 0 0 / 10%)",
                              }}
                              className="device-item"
                              key={user.userId}
                            >
                              <input
                                type="checkbox"
                                checked={selected.includes(user.userId)}
                                onChange={() => {
                                  setSelected((prev) =>
                                    prev.includes(user.userId)
                                      ? prev.filter((id) => id !== user.userId)
                                      : [...prev, user.userId]
                                  );
                                }}
                              />
                              <img src={user.profileImg || demo5} alt="" />
                              <div style={{ overflow: "hidden" }}>
                                <h3
                                  style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    textWrap: "nowrap",
                                  }}
                                >
                                  {user.name}
                                </h3>
                                <p
                                  style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    textWrap: "nowrap",
                                  }}
                                >
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div>No users found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  style={{ width: "100%" }}
                  className="update-button"
                  onClick={handleFeedBack}
                >
                  Feed Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {reportIssue && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ minWidth: "410px" }}>
            <div className="modal-header">
              <button onClick={handleReportClose} className="back-button">
                ❮
              </button>
              <h3 className="modal-title">Report a Issue</h3>
            </div>
            <div>
              <div className="sidebar-modal" style={{ width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label>Report Issue:</label>
                  <textarea
                    className="login-input report-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue..."
                  ></textarea>
                </div>
                <div className="report-user-container">
                  <button
                    onClick={handleReportUserOpen}
                    className="report-user-button"
                  >
                    <p> Report any User</p>
                    <span>
                      {reportUserOpen ? (
                        <ChevronUp size={25} style={{ paddingTop: "5px" }} />
                      ) : (
                        <ChevronDown size={25} style={{ paddingTop: "5px" }} />
                      )}
                    </span>
                  </button>
                  {reportUserOpen && (
                    <div className="report-user-list">
                      <div className="searchWrapper">
                        <input
                          style={{ borderRadius: "8px" }}
                          type="text"
                          className="search"
                          placeholder="Search for a user..."
                          value={searchUser}
                          onChange={(e) => setSearchUser(e.target.value)}
                        />
                        <Search className="icon" />
                      </div>
                      <div className="devices-list">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <div
                              style={{
                                boxShadow: "0px 0px 20px rgb(0 0 0 / 10%)",
                              }}
                              className="device-item"
                              key={user.userId}
                            >
                              <input
                                type="checkbox"
                                checked={selected.includes(user.userId)}
                                onChange={() => {
                                  setSelected((prev) =>
                                    prev.includes(user.userId)
                                      ? prev.filter((id) => id !== user.userId)
                                      : [...prev, user.userId]
                                  );
                                }}
                              />
                              <img src={user.profileImg || demo5} alt="" />
                              <div style={{ overflow: "hidden" }}>
                                <h3
                                  style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    textWrap: "nowrap",
                                  }}
                                >
                                  {user.name}
                                </h3>
                                <p
                                  style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    textWrap: "nowrap",
                                  }}
                                >
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div>No users found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  style={{ width: "100%" }}
                  className="update-button"
                  onClick={handleReport}
                >
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {update && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ minWidth: "450px" }}>
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
