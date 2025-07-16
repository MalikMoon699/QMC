import React, { useState, useEffect, useMemo } from "react";
import { db } from "../utils/FirebaseConfig";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/Notifications.css";
import { useOutletContext } from "react-router-dom";
import { demo5 } from "../utils/Demoimages";
import moment from "moment";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Loader from "../components/Loader";
import { Bell, Flag, MessageCircle, UserCog } from "lucide-react";
import NotificationsModal from "../components/NotificationsModal";

const Notifications = () => {
  const { currentUser, role } = useAuth();
  const { searchTxt } = useOutletContext();
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [notificationsModal, setNotificationsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("total");

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    let unsubscribe;

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

      unsubscribe = onSnapshot(notificationsQuery, (querySnapshot) => {
        const notificationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationsData);
        setLoading(false);
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
    return () => unsubscribe && unsubscribe();
  }, [currentUser, role]);

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

  const handleDetailModalOpen = (notification) => {
    setNotificationsModal(true);
    setSelectedNotifications(notification);
  };

  const handleDetailModalClose = () => {
    setNotificationsModal(false);
    setSelectedNotifications([]);
  };

  return (
    <div style={{ paddingTop: "20px" }}>
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
                <Loader className={"counterLoader"} loading={true} size={30} />
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
        <div className="notification-container">
          {filteredNotifications.map((notification) => (
            <React.Fragment key={notification.id}>
              {notification.notificationType === "application" ? (
                <div
                  onClick={() => handleDetailModalOpen(notification)}
                  className="notification"
                  key={notification.id}
                >
                  <div className="notification-content">
                    <img src={notification.userImg || demo5} />{" "}
                    <div className="notification-details-wrapper">
                      <h3>{notification.userName}</h3>
                      <h3>{notification.userEmail}</h3>
                      <p>{notification.idCardNumber}</p>
                    </div>
                  </div>
                  <div className="notification-date-wrapper">
                    <h4>
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
                    </h4>

                    <h3>{notification.status}</h3>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => handleDetailModalOpen(notification)}
                  key={notification.id}
                  className="notification"
                >
                  <div className="notification-content">
                    <img src={notification.userImg || demo5} />
                    <div className="notification-details-wrapper">
                      <h3>{notification.userName}</h3>
                      <h3>{notification.userEmail}</h3>
                      <p>{notification.description}</p>
                    </div>
                  </div>
                  <div className="notification-date-wrapper">
                    <h4>
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
                    </h4>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      {notificationsModal && (
        <NotificationsModal
          role={role}
          onClose={handleDetailModalClose}
          selectedNotifications={selectedNotifications}
        />
      )}
    </div>
  );
};

export default Notifications;
