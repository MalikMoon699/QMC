import React, { useState, useEffect, useMemo } from "react";
import { db } from "../utils/FirebaseConfig";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/Notifications.css";
import { useOutletContext } from "react-router-dom";
import moment from "moment";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import Loader from "../components/Loader";
import { Bell, Flag, MessageCircle, User, UserCog } from "lucide-react";
import { toast } from "react-toastify";

const Notifications = () => {
  const { currentUser, role } = useAuth();
  const { searchTxt } = useOutletContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("total");

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

      toast.success("Application approved successfully!!");
    } catch (error) {
      console.error("Error approving notification:", error);
    }
  };

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    if (activeTab !== "total") {
      filtered = notifications.filter(
        (record) =>
          (record?.notificationType || "").toLowerCase() ===
          activeTab.toLowerCase()
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
  }, [notifications, activeTab, searchTxt]);

  const applicationCount = notifications.filter(
    (n) => n.notificationType === "application"
  ).length;

  const feedbackCount = notifications.filter(
    (n) => n.notificationType === "feedback"
  ).length;

  const reportCount = notifications.filter(
    (n) => n.notificationType === "report"
  ).length;

  return (
    <div style={{ padding: "20px" }}>
      <div className="tabsWrapper">
        <div
          onClick={() => {
            setActiveTab("total");
          }}
          className={`${activeTab === "total" ? "active-tab" : ""} tab`}
        >
          <div className="counterContentWrapper">
            <h3>Total</h3>
            {loading ? (
              <div className="counterLoader">
                <Loader loading={true} size={30} />
              </div>
            ) : (
              <div className="countWrapper">
                <h3>{notifications.length}</h3>
                <span>Notifications</span>
              </div>
            )}
          </div>
          <div className="counterIcon">
            <Bell color="#ea5173" />
          </div>
        </div>
        <div
          onClick={() => {
            setActiveTab("application");
          }}
          className={`${activeTab === "application" ? "active-tab" : ""} tab`}
        >
          <div className="counterContentWrapper">
            <h3>Application</h3>
            {loading ? (
              <div className="counterLoader">
                <Loader loading={true} size={30} />
              </div>
            ) : (
              <div className="countWrapper">
                <h3>{applicationCount}</h3>
                <span>Notifications</span>
              </div>
            )}
          </div>
          <div className="counterIcon">
            <UserCog color="#ea5173" />
          </div>
        </div>
        <div
          onClick={() => {
            setActiveTab("feedback");
          }}
          className={`${activeTab === "feedback" ? "active-tab" : ""} tab`}
        >
          <div className="counterContentWrapper">
            <h3>Feedback</h3>
            {loading ? (
              <div className="counterLoader">
                <Loader loading={true} size={30} />
              </div>
            ) : (
              <div className="countWrapper">
                <h3>{feedbackCount}</h3>
                <span>Notifications</span>
              </div>
            )}
          </div>
          <div className="counterIcon">
            <MessageCircle color="#ea5173" />
          </div>
        </div>
        <div
          onClick={() => {
            setActiveTab("report");
          }}
          className={`${activeTab === "report" ? "active-tab" : ""} tab`}
        >
          <div className="counterContentWrapper">
            <h3>Report</h3>
            {loading ? (
              <div className="counterLoader">
                <Loader loading={true} size={30} />
              </div>
            ) : (
              <div className="countWrapper">
                <h3>{reportCount}</h3>
                <span>Notifications</span>
              </div>
            )}
          </div>
          <div className="counterIcon">
            <Flag color="#ea5173" />
          </div>
        </div>
      </div>
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
                    {notification?.createdAt
                      ? moment(
                          notification.createdAt,
                          "YYYY-MM-DD HH:mm:ss.SSS Z"
                        )
                          .fromNow()
                          .charAt(0)
                          .toUpperCase() +
                        moment(
                          notification.createdAt,
                          "YYYY-MM-DD HH:mm:ss.SSS Z"
                        )
                          .fromNow()
                          .slice(1)
                      : "DD-MM-YYYY"}
                  </p>
                  {role === "admin" && notification.status !== "Approved" && (
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
                    {notification?.createdAt
                      ? moment(
                          notification.createdAt,
                          "YYYY-MM-DD HH:mm:ss.SSS Z"
                        )
                          .fromNow()
                          .charAt(0)
                          .toUpperCase() +
                        moment(
                          notification.createdAt,
                          "YYYY-MM-DD HH:mm:ss.SSS Z"
                        )
                          .fromNow()
                          .slice(1)
                      : "DD-MM-YYYY"}
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
                    {notification?.createdAt
                      ? moment(
                          notification.createdAt,
                          "YYYY-MM-DD HH:mm:ss.SSS Z"
                        )
                          .fromNow()
                          .charAt(0)
                          .toUpperCase() +
                        moment(
                          notification.createdAt,
                          "YYYY-MM-DD HH:mm:ss.SSS Z"
                        )
                          .fromNow()
                          .slice(1)
                      : "DD-MM-YYYY"}
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
