import React, { useState, useEffect } from "react";
import { db } from "../utils/FirebaseConfig";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";

const Notifications = () => {
  const { currentUser, role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Notifications</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {notifications.map((notification) => (
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
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
