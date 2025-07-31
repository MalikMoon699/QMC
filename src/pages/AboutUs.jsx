import {
  AlertCircleIcon,
  ArrowUpFromLine,
  MessageSquareMore,
  Pen,
  ChevronDown,
  ChevronUp,
  Search,
  Mail,
  Phone,
  MapPin,
  ShieldUser,
  Clock,
  Clock10,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";
import moment from "moment";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  doc,
  updateDoc,
  setDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { db, storage } from "../utils/FirebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { demo5 } from "../utils/Demoimages";
import "../assets/styles/AboutUs.css";
import Loader from "../components/Loader";
import {
  fetchCurrentUser,
  fetchAllUsers,
  generateCustomId,
} from "../utils/Helpers";
import { toast } from "react-toastify";
import { fetchAdminUsers } from "../utils/Helpers";

const AboutUs = () => {
  const { currentUser, role } = useAuth();
  const [adminData, setAdminData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [currentUserDetails, setCurrentUserDetails] = useState([]);
  const [allUserDetail, setAllUserDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [update, setUpdate] = useState(false);
  const [feedBack, setFeedBack] = useState(false);
  const [reportUserOpen, setReportUserOpen] = useState(false);
  const [reportIssue, setReportIssue] = useState(false);
  const [error, setError] = useState("");
  const [updateImg, setUpdateImg] = useState("");
  const [updateName, setUpdateName] = useState("");
  const [updateEmail, setUpdateEmail] = useState("");
  const [description, setDescription] = useState("");
  const [updatePhone, setUpdatePhone] = useState("");
  const [updateimpNote, setUpdateImpNote] = useState("");
  const [updateOpenTime, setUpdateOpenTime] = useState("");
  const [updateEndTime, setUpdateEndTime] = useState("");
  const [updateFriOpenTime, setUpdateFriOpenTime] = useState("");
  const [updateFriEndTime, setUpdateFriEndTime] = useState("");
  const [updateLocation, setUpdateLocation] = useState("");
  const [updateId, setUpdateId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [searchUser, setSearchUser] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = React.useRef(null);

  const handleNavigation = (direction) => {
    const sellers = allUserDetail.filter((user) => user.role === "seller");
    if (direction === "prev" && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else if (direction === "next" && currentIndex < sellers.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const selectedCard = carouselRef.current?.children[currentIndex];
    if (selectedCard) {
      selectedCard.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentIndex, allUserDetail]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [userDetails, allUsers] = await Promise.all([
          fetchCurrentUser(currentUser),
          fetchAllUsers(),
        ]);

        if (userDetails) setCurrentUserDetails(userDetails.userData || {});
        if (allUsers) setAllUserDetails(allUsers);

        const adminDetails = await fetchAdminUsers();
        if (adminDetails) setAdminData(adminDetails);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const unsubAdmin = onSnapshot(collection(db, "ADMIN"), async () => {
      const adminDetails = await fetchAdminUsers();
      if (adminDetails) {
        setAdminData(adminDetails);
      }
    });

    return () => {
      unsubAdmin();
    };
  }, [currentUser]);

  const getAdminDetails = async () => {
    const adminDetails = await fetchAdminUsers();
    setAdminData(adminDetails);
  };

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
      handleUpdateClose();

      const profileImgUrl = await uploadImage(imageFile, updateId);

      const updatedData = {
        name: updateName,
        email: updateEmail,
        phoneNumber: updatePhone,
        shopOpenTime: updateOpenTime,
        shopEndTime: updateEndTime,
        shopFriOpenTime: updateFriOpenTime,
        shopFriEndTime: updateFriEndTime,
        impNote: updateimpNote,
        location: updateLocation,
        profileImg: profileImgUrl,
      };
      const adminDocRef = doc(db, "ADMIN", updateId);
      await updateDoc(adminDocRef, updatedData);
      await getAdminDetails();
      toast.success("Details updated successfully");
    } catch (error) {
      console.error("Error updating admin:", error);
    }
  };

  const handleReport = async () => {
    try {
      if (!description) {
        setError("No description provided");
        return;
      }
      handleReportClose();

      const reportData = {
        userId: currentUserDetails.uid,
        userImg: currentUserDetails.profileImg,
        userEmail: currentUserDetails.email,
        userName: currentUserDetails.name,
        notificationType: "report",
        reportAbout: selected,
        description: description,
        createdAt: new Date().toISOString(),
      };
      const customId = await generateCustomId("NOTIFICATIONS");
      const reportDocRef = doc(db, "NOTIFICATIONS", customId);
      await setDoc(reportDocRef, reportData);

      toast.success("Reported issue submitted successfully");
    } catch (error) {
      console.error("Error reporting issue:", error);
    }
  };

  const handleFeedBack = async () => {
    try {
      if (!description) {
        setError("No description provided");
        return;
      }
      handleFeedBackClose();

      const reportData = {
        userId: currentUserDetails.uid,
        userImg: currentUserDetails.profileImg,
        userEmail: currentUserDetails.email,
        userName: currentUserDetails.name,
        notificationType: "feedback",
        reportAbout: selected,
        description: description,
        createdAt: new Date().toISOString(),
      };
      const customId = await generateCustomId("NOTIFICATIONS");
      const reportDocRef = doc(db, "NOTIFICATIONS", customId);
      await setDoc(reportDocRef, reportData);
      toast.success("Feedback submitted successfully");
    } catch (error) {
      console.error("Error reporting issue:", error);
    }
  };

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
    setUpdateImpNote(admin.impNote || "");
    setUpdateOpenTime(admin.shopOpenTime || "");
    setUpdateEndTime(admin.shopEndTime || "");
    setUpdateFriOpenTime(admin.shopFriOpenTime || "");
    setUpdateFriEndTime(admin.shopFriEndTime || "");
    setUpdateLocation(admin.location || "");
    setUpdate(true);
  };

  const handleUpdateClose = () => {
    setUpdateId("");
    setUpdateImg("");
    setUpdateName("");
    setUpdateEmail("");
    setUpdatePhone("");
    setUpdateImpNote("");
    setUpdateOpenTime("");
    setUpdateEndTime("");
    setUpdateFriOpenTime("");
    setUpdateFriEndTime("");
    setUpdateLocation("");
    setImageFile(null);
    setUpdate(false);
  };

  const handleReportClose = () => {
    setSelected([]);
    setDescription("");
    setReportIssue(false);
    setReportUserOpen(false);
    setSearchUser("");
  };

  const handleFeedBackClose = () => {
    setSelected([]);
    setDescription("");
    setFeedBack(false);
    setReportUserOpen(false);
    setSearchUser("");
  };

  const handleReportUserOpen = () => {
    setReportUserOpen((prev) => !prev);
  };

  const filteredUsers = allUserDetail.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  const copyClicked = (email, message) => {
    navigator.clipboard.writeText(email);
    toast.success(message);
  };

  return (
    <div>
      <div className="mobile-summary-header mobiles-summary-header">
        {role !== "admin" ? (
          <div className="mobiles-status-title">
            Now Shop is
            {adminData.isSwitch ? " Open" : " Closed"}
          </div>
        ) : (
          <div className="mobiles-status-title">About Us</div>
        )}

        {role !== "admin" && (
          <div className="action-btn-container">
            <button
              style={{
                backgroundColor: "var(--secondcolor)",
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
                backgroundColor: "var(--secondcolor)",
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
              backgroundColor: "var(--secondcolor)",
              padding: "10px 20px",
              gap: "12px",
            }}
            className="action-btn"
            onClick={() => handleUpdateOpen(adminData)}
          >
            <ArrowUpFromLine size={20} />
            Update
          </button>
        )}
      </div>
      <div className="aboutUs-main-container">
        <div className="owner-details-container">
          <div className="about_header">
            <h3>Important Note</h3>
          </div>
          <div className="important-note">
            {adminData.impNote ||
              " We are here to help you. Please fill The Form in top right corner,Choose your Option report OR feedBack to get in touch with us. Wewill get back to you as soon as possible."}
          </div>
        </div>
        <div style={{ marginTop: "40px" }} className="owner-details-container">
          <div className="about_header">
            <h3> Owner Details</h3>
          </div>
          <div className="owner-details-innercontainer">
            <div className="owner-details-first-child">
              <img
                src={adminData.profileImg}
                alt={`${adminData.name}'s profile`}
              />
            </div>
            <div className="owner-details-second-child">
              <div className="copy-item-constainer">
                <ShieldUser />
                <span
                  className="copy-item"
                  onClick={() =>
                    copyClicked(adminData.name, "Name copied successfully")
                  }
                >
                  {adminData.name}
                </span>
              </div>

              <div className="copy-item-constainer">
                <Mail />
                <span
                  className="copy-item"
                  onClick={() =>
                    copyClicked(adminData.email, "Email copied successfully")
                  }
                >
                  {adminData.email}
                </span>
              </div>
              <div className="copy-item-constainer">
                <Phone />
                <span
                  className="copy-item"
                  onClick={() =>
                    copyClicked(
                      adminData.phoneNumber,
                      "Phone Number copied successfully."
                    )
                  }
                >
                  {adminData.phoneNumber}
                </span>
              </div>
              <div className="copy-item-constainer">
                <Clock10 />
                <span className="copy-item">
                  Week:{" "}
                  {moment(adminData.shopOpenTime, "HH:mm").format("hh:mm A")} to{" "}
                  {moment(adminData.shopEndTime, "HH:mm").format("hh:mm A")}
                </span>
              </div>
              <div className="copy-item-constainer">
                <Clock />
                <span className="copy-item">
                  Fri:{" "}
                  {moment(adminData.shopFriOpenTime, "HH:mm").format("hh:mm A")}{" "}
                  to{" "}
                  {moment(adminData.shopFriEndTime, "HH:mm").format("hh:mm A")}
                </span>
              </div>
              <div className="copy-item-constainer">
                <MapPin size={30} />
                <span
                  className="copy-item"
                  onClick={() =>
                    copyClicked(
                      adminData.location,
                      "Location copied successfully."
                    )
                  }
                >
                  {adminData.location}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="users-counts-container">
          <div className="about_header">
            <h3>Social Platfrom</h3>
          </div>
          <div className="users-counts-innercontainer social-platforms-container">
            <a
              className="users-counts"
              target="_blank"
              href="https://www.instagram.com"
            >
              <Instagram size={30} />
              <span>Insta</span>
            </a>
            <a
              className="users-counts"
              target="_blank"
              href="https://www.facebook.com"
            >
              <Facebook size={30} />
              <span>Facebook</span>
            </a>
            <a
              className="users-counts"
              target="_blank"
              href="https://www.twitter.com"
            >
              <Twitter />
              <span>Twitter</span>
            </a>
          </div>
        </div>
        <div className="users-counts-container">
          <div className="about_header">
            <h3> Users Counts</h3>
          </div>
          <div className="users-counts-innercontainer">
            <div className="users-counts">
              <h3>{allUserDetail?.length}</h3>
              <span>Total Users</span>
            </div>
            <div className="users-counts">
              <h3>
                {allUserDetail?.filter((user) => user.role === "seller").length}
              </h3>
              <span>Sellers</span>
            </div>
            <div className="users-counts">
              <h3>
                {allUserDetail?.filter((user) => user.role === "user").length}
              </h3>
              <span>Customers</span>
            </div>
          </div>
        </div>
        <div className="sellers-outerContainer">
          <div className="about_header">
            <h3> Sellers Details</h3>
          </div>

          <div className="sellers-container">
            <button
              className="about_prev-btn"
              onClick={() => handleNavigation("prev")}
              disabled={currentIndex === 0}
            >
              {"<"}
            </button>
            <div className="sellers-carousel" ref={carouselRef}>
              {allUserDetail?.some((user) => user.role === "seller") ? (
                allUserDetail
                  .filter((user) => user.role === "seller")
                  .map((user, index) => (
                    <div
                      key={user.id || index}
                      className={`user-card about_user-card ${
                        index === currentIndex ? "selected_about_user-card" : ""
                      }`}
                    >
                      <div className="about_user-card__info_img">
                        <img
                          src={user.profileImg || demo5}
                          alt={`${user.name}'s profile`}
                        />
                      </div>
                      <div className="user-card__info_content">
                        <div className="user-card__text user-card__info about_user-card__info">
                          <h3>{user.name}</h3>
                        </div>
                        <div className="user-card_details_container"></div>
                        <div className="user-card_personal_details_container about_user-card_personal_details_container">
                          <div className="about_user-card__contact">
                            <Mail size={20} />
                            <p
                              className="copy-item"
                              onClick={() =>
                                copyClicked(
                                  user.email,
                                  "Email copied successfully"
                                )
                              }
                            >
                              {user.email}
                            </p>
                          </div>
                          <div className="about_user-card__contact">
                            <Phone />
                            <p
                              className="copy-item"
                              onClick={() =>
                                copyClicked(
                                  user.phoneNumber,
                                  "Phone Number copied successfully"
                                )
                              }
                            >
                              {user.phoneNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="no-seller-message">
                  No seller data available
                </div>
              )}
            </div>
            <button
              className="about_next-btn"
              onClick={() => handleNavigation("next")}
              disabled={
                currentIndex >=
                allUserDetail.filter((user) => user.role === "seller").length -
                  1
              }
            >
              {">"}
            </button>
          </div>
        </div>
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
                {error && <div className="error-message">{error}</div>}
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
                    <p> Feed Back any User</p>
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
                              key={user.userId || user.uid}
                            >
                              <input
                                type="checkbox"
                                checked={selected.some(
                                  (u) => u.uid === (user.userId || user.uid)
                                )}
                                onChange={() => {
                                  setSelected((prev) => {
                                    const uid = user.userId || user.uid;

                                    const isAlreadySelected = prev.some(
                                      (u) => u.uid === uid
                                    );

                                    if (isAlreadySelected) {
                                      return prev.filter((u) => u.uid !== uid);
                                    } else {
                                      return [
                                        ...prev,
                                        {
                                          uid: uid,
                                          userImg: user.profileImg || "",
                                          name: user.name || "",
                                          email: user.email || "",
                                        },
                                      ];
                                    }
                                  });
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
                              key={user.userId || user.uid}
                            >
                              <input
                                type="checkbox"
                                checked={selected.some(
                                  (u) => u.uid === (user.userId || user.uid)
                                )}
                                onChange={() => {
                                  setSelected((prev) => {
                                    const uid = user.userId || user.uid;
                                    const isAlreadySelected = prev.some(
                                      (u) => u.uid === uid
                                    );
                                    if (isAlreadySelected) {
                                      return prev.filter((u) => u.uid !== uid);
                                    } else {
                                      return [
                                        ...prev,
                                        {
                                          uid: uid,
                                          userImg: user.profileImg || "",
                                          name: user.name || "",
                                          email: user.email || "",
                                        },
                                      ];
                                    }
                                  });
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
                    <label style={{ cursor: "pointer" }}>
                      <Pen size={20} color="var(--secondcolor)" />
                    </label>
                    <input
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
                  <span>Important Note</span>
                  <input
                    type="text"
                    className="edit-input"
                    value={updateimpNote}
                    onChange={(e) => setUpdateImpNote(e.target.value)}
                  />
                </div>
                <div>
                  <span>Shop Timing</span>
                  <div className="time-Update-Container">
                    <input
                      type="time"
                      className="login-input"
                      value={updateOpenTime}
                      onChange={(e) => setUpdateOpenTime(e.target.value)}
                    />
                    to{" "}
                    <input
                      type="time"
                      className="login-input"
                      value={updateEndTime}
                      onChange={(e) => setUpdateEndTime(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <span>Shop Timing FriDay</span>
                  <div className="time-Update-Container">
                    <input
                      type="time"
                      className="login-input"
                      value={updateFriOpenTime}
                      onChange={(e) => setUpdateFriOpenTime(e.target.value)}
                    />
                    to{" "}
                    <input
                      type="time"
                      className="login-input"
                      value={updateFriEndTime}
                      onChange={(e) => setUpdateFriEndTime(e.target.value)}
                    />
                  </div>
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
