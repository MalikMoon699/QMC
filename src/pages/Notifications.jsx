import React, { useState, useEffect, useMemo } from "react";
import { db } from "../utils/FirebaseConfig";
import { useAuth } from "../context/AuthContext";
import { useOutletContext } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import Loader from "../components/Loader";

const Notifications = () => {
  const { currentUser, role } = useAuth();
  const { searchTxt } = useOutletContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        let notificationsQuery;
        if (role === "admin") {
          notificationsQuery = query(collection(db, "NOTIFICATIONS"));
        } else {
          notificationsQuery = query(
            collection(db, "NOTIFICATIONS"),
            where("userId", "==", currentUser.uid)
          );
        }

        const querySnapshot = await getDocs(notificationsQuery);
        const notificationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationsData);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser, role]);

  const handleApprove = async (notification) => {
    try {
      const notificationRef = doc(db, "NOTIFICATIONS", notification.id);
      await updateDoc(notificationRef, {
        status: "Approved",
      });

      const userQuery = query(
        collection(db, "USERS"),
        where("uid", "==", notification.userId)
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        throw new Error("User not found.");
      }

      const userId = userSnapshot.docs[0].id;

      const userRef = doc(db, "USERS", userId);
      await updateDoc(userRef, {
        role: "seller",
      });

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, status: "Approved" } : item
        )
      );

      alert("Notification approved and user role updated to seller!");
    } catch (error) {
      console.error("Error approving notification:", error);
      setError("Failed to approve notification.");
    }
  };

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    if (statusFilter !== "All") {
      filtered = notifications.filter(
        (record) =>
          record.notificationType &&
          record.notificationType.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (searchTxt.trim()) {
      filtered = filtered.filter((notification) =>
        [
          notification.userName,
          notification.userEmail,
          notification.description,
        ].some((field) =>
          field && typeof field === "string"
            ? field.toLowerCase().includes(searchTxt.toLowerCase())
            : false
        )
      );
    }

    return filtered.sort((a, b) =>
      a.createdAt && b.createdAt
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : 0
    );
  }, [notifications, statusFilter, searchTxt]);

  return (
    <div style={{ padding: "20px" }}>
      <div className="mobile-summary-header mobiles-summary-header">
        <div className="mobiles-status-title">Notifications</div>
        <div className="action-btn-container">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="custom-select"
          >
            <option value="All">All</option>
            <option value="application">Applications</option>
            <option value="feedBack">Feed Back</option>
            <option value="report">Reports</option>
          </select>
        </div>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (
        <Loader loading={true} />
      ) : notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredNotifications.map((notification) => (
            <React.Fragment key={notification.id}>
              {notification.notificationType === "application" && (
                <li
                  key={notification.id}
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "5px",
                  }}
                >
                  <p>
                    <strong>Name:</strong> {notification.userName}
                  </p>
                  <p>
                    <strong>Email:</strong> {notification.userEmail}
                  </p>
                  <p>
                    <strong>Age:</strong> {notification.userAge}
                  </p>
                  <p>
                    <strong>Notification Type:</strong>{" "}
                    {notification.notificationType}
                  </p>
                  <p>
                    <strong>ID Card Number:</strong> {notification.idCardNumber}
                  </p>
                  <p>
                    <strong>Status:</strong> {notification.status}
                  </p>
                  <p>
                    <strong>userId:</strong> {notification.userId}
                  </p>
                  <p>
                    <strong>Submitted:</strong>{" "}
                    {notification.createdAt
                      ? new Date(notification.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                  {role === "Admin" && notification.status !== "Approved" && (
                    <button onClick={() => handleApprove(notification)}>
                      Approve
                    </button>
                  )}
                </li>
              )}
              {notification.notificationType === "feedback" && (
                <li
                  key={notification.id}
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "5px",
                  }}
                >
                  <p>
                    <strong>Name:</strong> {notification.userName}
                  </p>
                  <p>
                    <strong>Email:</strong> {notification.userEmail}
                  </p>
                  <div style={{ background: "red" }}>
                    {notification.reportAbout.map((report, index) => (
                      <p key={index}>
                        <strong>Report {index + 1}:</strong>
                        <br />
                        Name: {report.name} <br />
                        Email: {report.email} <br />
                        UID: {report.uid}
                      </p>
                    ))}
                  </div>

                  <p>
                    <strong>Notification Type:</strong>{" "}
                    {notification.notificationType}
                  </p>
                  <p>
                    <strong>Feed Back:</strong> {notification.description}
                  </p>
                  <p>
                    <strong>Submitted:</strong>{" "}
                    {notification.createdAt
                      ? new Date(notification.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                </li>
              )}
              {notification.notificationType === "report" && (
                <li
                  key={notification.id}
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "5px",
                  }}
                >
                  <p>
                    <strong>Name:</strong> {notification.userName}
                  </p>
                  <p>
                    <strong>Email:</strong> {notification.userEmail}
                  </p>
                  <div style={{ background: "red" }}>
                    {notification.reportAbout.map((report, index) => (
                      <p key={index}>
                        <strong>Report {index + 1}:</strong>
                        <br />
                        Name: {report.name} <br />
                        Email: {report.email} <br />
                        UID: {report.uid}
                      </p>
                    ))}
                  </div>
                  <p>
                    <strong>Notification Type:</strong>{" "}
                    {notification.notificationType}
                  </p>
                  <p>
                    <strong>Feed Back:</strong> {notification.description}
                  </p>
                  <p>
                    <strong>Submitted:</strong>{" "}
                    {notification.createdAt
                      ? new Date(notification.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
